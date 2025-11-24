import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import tokenService from "../service/token-service.js"
import authMiddleware from "../middlewares/auth-middleware.js"
import chatroomController from "../controllers/chatroom-controller.js"
import RoompersistModel from "../models/room-participants-model.js"
import MessageModel from "../models/message-model.js"
import { redisClient } from "../index.js"
import UserContactsModel from "../models/user-contacts-model.js"

//Online
export const getRelevantUsers = async (userId) => {
  // 1. Получаем пользователей, у которых userId есть в контактах
  const usersWhoAddedMe = await UserContactsModel.find({
    "contacts.contactId": userId,
  }).select("userId")
  const usersWhoAddedMeIds = usersWhoAddedMe.map((user) =>
    user.userId.toString(),
  )

  // 2. Получаем контакты пользователя (если он сам кого-то добавил)
  const userContacts = await UserContactsModel.findOne({ userId }).select(
    "contacts",
  )
  const contacts = userContacts
    ? userContacts.contacts.map((c) => c.contactId.toString())
    : []

  // 3. Получаем участников групп пользователя
  const chatroomUsers = await RoompersistModel.find({ user: userId }).select(
    "chatroomId",
  )
  const chatroomIds = chatroomUsers.map((room) => room.chatroomId)

  const roomMembers = await RoompersistModel.find({
    chatroomId: { $in: chatroomIds },
  }).select("user")
  const groupUsers = roomMembers.map((member) => member.user.toString())

  // 4. Объединяем всех в Set (чтобы убрать дубликаты)
  const relevantUsers = new Set([
    ...contacts,
    ...groupUsers,
    ...usersWhoAddedMeIds,
  ])

  // Удаляем самого пользователя
  relevantUsers.delete(userId.toString())

  return Array.from(relevantUsers)
}
const getUserStatus = async (userId) => {
  const isOnline = await redisClient.exists(`online:${userId}`)
  return isOnline ? "online" : "offline"
}

//export let relevantUsers
export let sessions
export let io
const startSocket = (server) => {
  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  })
  // io = io.of("/ws")
  // io.set("transports", ["websocket", "polling"])
  // io.set("origins", "*:*")
  io.use(async (socket, next) => {
    try {
      // const accessToken = socket.handshake.auth.token.split(" ")[1]
      const accessToken = socket.handshake.query.token
      const userData = tokenService.validateAccessToken(accessToken)
      socket.user = userData
      next()
    } catch (err) {}
  })
  io.on("connection", async (socket) => {
    const userId = socket.user._id
    if (!userId) return

    const relevantUsers = await getRelevantUsers(userId)

    console.log(relevantUsers)

    // Отримуємо всі попередні сесії з Redis
    let activeSessions = await redisClient.sMembers(`onlineSessions:${userId}`)

    // Видаляємо неактивні сесії (перевіряємо двічі з затримкою)
    for (const sessionId of activeSessions) {
      if (!io.sockets.sockets.has(sessionId)) {
        // Чекаємо трохи, щоб переконатися, що сесія точно неактивна
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!io.sockets.sockets.has(sessionId)) {
          await redisClient.sRem(`onlineSessions:${userId}`, sessionId)
        }
      }
    }

    // Додаємо нову активну сесію
    await redisClient.sAdd(`onlineSessions:${userId}`, socket.id)

    // Підписуємо на кімнату статуса
    socket.join(`status:${userId}`)

    // Оновлюємо статус онлайн
    await redisClient.set(`online:${userId}`, "online", "EX", 300)

    // Відправляємо статус усім, хто має бачити
    relevantUsers.forEach((id) => {
      io.to(`status:${id}`).emit("updateStatus", { userId, status: "online" })
    })

    // Виводимо оновлений список сесій
    sessions = await redisClient.sMembers(`onlineSessions:${userId}`)
    console.log(`Active sessions for ${userId}:`, sessions)

    // Перевірка статусу іншого користувача
    socket.on("checkUserStatus", async (targetUserId) => {
      const status = await getUserStatus(targetUserId)
      socket.emit("userStatusResponse", { userId: targetUserId, status })
    })

    // Оновлюємо TTL кожну хвилину
    const interval = setInterval(async () => {
      if (await redisClient.exists(`online:${userId}`)) {
        await redisClient.expire(`online:${userId}`, 300)
      }
    }, 60000)

    socket.on("connectToChatroom", async (roomId) => {
      socket.join(`chatroom:${roomId}`)
      console.log(
        `Пользователь ${userId} присоединился к комнате chatroom:${roomId}`,
      )
    })
    socket.on("leaveRoom", async ({ chatroomId, userId }) => {
      socket.leave(`chatroom:${chatroomId}`)
      console.log(
        `Пользователь ${userId} покинул комнату chatroom:${chatroomId}`,
      )
    })

    socket.on("typing", async ({ chatroomId, isTyping }) => {
      relevantUsers.forEach((id) => {
        if (id !== userId) {
          io.to(`status:${id}`).emit("updateTypingStatus", {
            chatroomId,
            isTyping,
            userId,
          })
        }
      })
    })

    //VIDEO
    // Проверка на сервере
    // socket.on("callUser", ({ targetUserId, offer }) => {
    //   console.log(`Call from ${socket.user._id} to ${targetUserId}`)
    //   io.to(`status:${targetUserId}`).emit("callIncoming", {
    //     from: socket.user._id,
    //     offer,
    //   })
    // })
    //
    // socket.on("answerCall", ({ targetUserId, answer }) => {
    //   console.log(`Answer from ${socket.user._id} to ${targetUserId}`)
    //   io.to(`status:${targetUserId}`).emit("callAnswered", {
    //     from: socket.user._id,
    //     answer,
    //   })
    // })
    //
    // socket.on("iceCandidate", ({ targetUserId, candidate }) => {
    //   io.to(`status:${targetUserId}`).emit("iceCandidate", {
    //     from: socket.user._id,
    //     candidate,
    //   })
    // })
    //
    // // Завершение звонка
    // socket.on("endCall", ({ targetUserId }) => {
    //   io.to(`status:${targetUserId}`).emit("callEnded", {
    //     from: socket.user._id,
    //   })
    // })

    //fdgsgsdgsdg
    // Пересылка offer
    socket.on("rtc:offer", ({ to, offer }) => {
      console.log(to)
      socket.to(`status:${to}`).emit("rtc:offer", {
        from: userId,
        offer,
      })
    })

    // Пересылка answer
    socket.on("rtc:answer", ({ to, answer }) => {
      socket.to(`status:${to}`).emit("rtc:answer", {
        from: userId,
        answer,
      })
    })

    // Пересылка ICE кандидатов
    socket.on("rtc:ice-candidate", ({ to, candidate }) => {
      socket.to(`status:${to}`).emit("rtc:ice-candidate", {
        from: userId,
        candidate,
      })
    })

    // Завершение звонка
    socket.on("rtc:end-call", ({ to }) => {
      socket.to(`status:${to}`).emit("rtc:end-call", {
        from: userId,
      })
    })

    socket.on("disconnecting", async () => {
      console.log(`Socket ${socket.id} is disconnecting for user ${userId}`)
      await redisClient.sRem(`onlineSessions:${userId}`, socket.id)
    })

    socket.on("disconnect", async () => {
      console.log(`Socket ${socket.id} disconnected for user ${userId}`)

      const sessionsLeft = await redisClient.sCard(`onlineSessions:${userId}`)
      if (sessionsLeft === 0) {
        console.log(`User ${userId} повністю офлайн, очищаю Redis`)
        await redisClient.del(`online:${userId}`)
        relevantUsers.forEach((id) => {
          io.to(`status:${id}`).emit("updateStatus", {
            userId,
            status: "offline",
          })
        })
      } else {
        console.log(`User ${userId} ще має активні сесії: ${sessionsLeft}`)
      }
    })
  })
  return io
}

export default startSocket
