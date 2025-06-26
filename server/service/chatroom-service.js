import ChatroomModel from "../models/chatroom-model.js"
import UserModel from "../models/user-model.js"
import RoompersistModel from "../models/room-participants-model.js"
import MessageModel from "../models/message-model.js"
import ApiError from "../exceptions/api-error.js"
import fs from "fs"
import UserContactsModel from "../models/user-contacts-model.js"
import UserDto from "../dtos/user-dto.js"
import { io } from "../WebSocket/websocket.js"
import path from "path"

class ChatroomService {
  async isChatAndUserAvailable(chatroomId, userId) {
    const chat = await RoompersistModel.find({ chatroomId: chatroomId })
    if (!chat) throw ApiError.BadRequest(`Chatroom was not found`)

    let isAvailable = false
    chat.forEach((user) => {
      if (userId === String(user.user)) isAvailable = true
    })

    if (!isAvailable) throw ApiError.BadRequest(`User was not found`)
    return { chat }
  }
  async createRoom(name, createdBy, imageUrl, users, tag, type) {
    users.unshift(createdBy)

    if (type !== "private") {
      if (!tag.includes("$")) {
        throw ApiError.BadRequest(`Incorrect tag`)
      }
      const existingChatroom = await ChatroomModel.findOne({ tag })
      if (existingChatroom)
        throw ApiError.BadRequest(`Chatroom with tag "${tag}" already exists.`)
    }
    const candidateIds = new Set((await UserModel.distinct("_id")).map(String))
    if (users.some((user) => !candidateIds.has(user))) {
      throw ApiError.BadRequest("User was not found")
    }

    const createChatroom = async ({ name, createdBy, tag, type }) => {
      try {
        const chatData = {
          createdBy,
          type,
        }
        if (type !== "private") {
          if (!name || !tag) {
            throw ApiError.BadRequest(
              "Fields 'name' and 'tag' are required for non-private chatrooms",
            )
          }
          chatData.name = name
          chatData.tag = tag
        }
        const chatroom = await ChatroomModel.create(chatData)
        console.log(chatroom)
        return chatroom
      } catch (error) {
        throw error
      }
    }
    let chatroom = await createChatroom({ name, createdBy, tag, type })
    let logo
    if (imageUrl) {
      fs.mkdirSync("uploads/chats/" + chatroom._id)
      fs.renameSync(
        `uploads/chats/temp/${imageUrl.originalname}`,
        `uploads/chats/${chatroom._id}/${imageUrl.originalname}`,
      )
      logo = `uploads/chats/${chatroom._id}/${imageUrl.originalname}`
    } else {
      logo = "uploads/chats/chat.png"
    }
    await ChatroomModel.updateOne(
      { _id: chatroom._id },
      { $set: { imageUrl: logo } },
      { new: true },
    )
    chatroom = await ChatroomModel.findById(chatroom._id)
    await RoompersistModel.create({
      chatroomId: chatroom._id,
      user: createdBy,
      role: "owner",
    })
    users.shift()
    for (const user of users) {
      if (type === "private") {
        await RoompersistModel.create({
          chatroomId: chatroom._id,
          user,
          role: "owner",
        })
      } else {
        await RoompersistModel.create({ chatroomId: chatroom._id, user })
      }
    }
    const members = await RoompersistModel.find({
      chatroomId: chatroom._id,
    }).populate("user")
    // const membersWithoutOwner = mem.filter(
    //   (member) => member.user._id.toString() !== createdBy,
    // )
    members.map((member) => {
      const user = new UserDto(member.user)
      member.user = user
      return member
    })

    members.forEach((member) => {
      io.to(`status:${member.user._id}`).emit("newChatroom", {
        roomId: chatroom._id.toString(),
      })
    })
    // return { chatroom, members }
  }

  async joinRoom(chatroomId, userId) {
    const chatroom = await ChatroomModel.findById(chatroomId)

    if (chatroom.type === "private")
      throw ApiError.BadRequest(`This is a private chat`)

    const chat = await RoompersistModel.find({ chatroomId })
    chat.forEach((user) => {
      if (userId === String(user.user))
        throw ApiError.BadRequest(`User is already joined to the chat`)
    })

    await RoompersistModel.create({ chatroomId, user: userId })

    const members = await RoompersistModel.find({ chatroomId })
      .populate("user")
      .lean()

    members
      .filter((member) => member.user._id.toString() !== userId)
      .map((member) => {
        return new UserDto(member.user)
      })

    return { chatroom, members }
  }

  async leaveRoom(chatroomId, userId) {
    await this.isChatAndUserAvailable(chatroomId, userId)
    await RoompersistModel.deleteOne({ chatroomId, user: userId })

    io.to(`chatroom:${chatroomId}`).emit("leaveChatroom", {
      chatroomId,
      userId,
    })
  }
  async deleteRoom(chatroomId, userId) {
    await this.isChatAndUserAvailable(chatroomId, userId)

    const chat = await RoompersistModel.find({ chatroomId })

    const user = chat.find((user) => user.user.toString() === userId)
    if (!user) {
      throw ApiError.BadRequest(`User is not a participant`)
    }
    if (user.role !== "owner") {
      throw ApiError.BadRequest(`User is not owner`)
    }

    await ChatroomModel.deleteOne({ _id: chatroomId })
    await RoompersistModel.deleteMany({ chatroomId })
    await MessageModel.deleteMany({ chatroomId })
    const chatDir = path.join("uploads", "chats", chatroomId)
    fs.rmSync(chatDir, { recursive: true, force: true })

    io.to(`chatroom:${chatroomId}`).emit("deleteChatroom", {
      chatroomId,
    })
  }

  async updateName(chatroomId, newName, user) {
    await this.isChatAndUserAvailable(chatroomId, user)
    const chat = await ChatroomModel.findOneAndUpdate(
      { _id: chatroomId },
      { name: newName },
      { new: true },
    )

    return chat
  }
  async updateImage(user, imageUrl, chatroomId) {
    await this.isChatAndUserAvailable(chatroomId, user)
    const chat = await ChatroomModel.findById(chatroomId)

    const newChat = await ChatroomModel.findOneAndUpdate(
      { _id: chatroomId },
      { imageUrl },
      { new: true },
    )
    if (chat.imageUrl !== null && chat.imageUrl !== `uploads/chats/chat.png`) {
      //let file = chat.imageUrl.split(process.env.API_URL + '/')[1]
      fs.unlink(chat.imageUrl, function (err) {
        if (err) {
          console.log(err)
        }
      })
    }

    return newChat
  }
  async getChatrooms(user) {
    const chats = await RoompersistModel.find({ user }).populate("chatroomId")
    const chatrooms = await Promise.all(
      chats.map(async (c) => {
        let mem = await RoompersistModel.find({
          chatroomId: c.chatroomId,
        }).populate("user")
        //mem = mem.filter(member => member.user._id.toString() !== user)
        const members = mem.map((member) => {
          const user = new UserDto(member.user)
          member.user = user
          return member
        })
        const unreadCounts = await RoompersistModel.find({
          chatroomId: c.chatroomId,
          user,
        })
          .select("user unreadCount")
          .lean()

        // Считаем сумму всех непрочитанных сообщений
        const totalUnreadCount = unreadCounts.reduce(
          (sum, item) => sum + item.unreadCount,
          0,
        )

        // Добавляем unreadCount в chat
        const chat = {
          ...c.chatroomId.toObject(),
          unreadCount: totalUnreadCount,
        }
        return { chat, members }
      }),
    )
    return chatrooms
  }
  async getChatroom(user, chatroomId) {
    await this.isChatAndUserAvailable(chatroomId, user)
    const chatroom = await ChatroomModel.findById(chatroomId)
    let mem = await RoompersistModel.find({ chatroomId }).populate("user")
    // mem = mem.filter((member) => member.user._id.toString() !== user)
    const members = mem.map((member) => {
      const user = new UserDto(member.user)
      member.user = user
      return member
    })
    return { chatroom, members }
  }
  async findChatroom(userId, text) {
    if (!text) throw ApiError.BadRequest("Search text is required")

    // Проверка на поиск по тегу
    const isTagSearch = text.startsWith("$")

    let searchQuery = {}

    if (isTagSearch) {
      // Поиск по тегу
      searchQuery = { tag: new RegExp(text.slice(1), "i") }
    } else {
      // Поиск по имени (регулярное выражение для игнорирования регистра)
      searchQuery = { name: new RegExp(text, "i") }
    }

    // Ищем чаты по запросу
    let chatrooms = await ChatroomModel.find(searchQuery)

    // Если нет чатов по имени, ищем среди приватных чатов
    if (chatrooms.length === 0 && !isTagSearch) {
      chatrooms = await ChatroomModel.find({ type: "private" })

      // Обрабатываем приватные чаты
      let myChats = []
      let searchResult = []

      for (let chat of chatrooms) {
        const userRoom = await RoompersistModel.findOne({
          chatroomId: chat._id,
          user: userId,
        }).lean()

        if (userRoom) {
          // Приватный чат, если пользователь участвует
          const otherMember = await RoompersistModel.findOne({
            chatroomId: chat._id,
            user: { $ne: userId }, // Найти другого участника
          }).populate("user")

          if (otherMember && otherMember.user) {
            chat.name = otherMember.user.name // Используем имя другого участника
          }

          // Если имя другого участника совпадает с запросом, возвращаем этот чат
          if (chat.name.toLowerCase().includes(text.toLowerCase())) {
            myChats.push(chat) // Добавляем в мой чат
          }
        }
      }

      return { myData: myChats, searchResult: [] }
    }

    // Переменные для хранения результатов
    let myChats = []
    let searchResult = []

    // Для публичных чатов
    for (let chat of chatrooms) {
      const userRoom = await RoompersistModel.findOne({
        chatroomId: chat._id,
        user: userId,
      })

      if (userRoom) {
        // Это мой чат
        myChats.push(chat)
      } else {
        // Это не мой чат (добавляем в результат поиска)
        searchResult.push(chat)
      }
    }

    return { myData: myChats, searchResult }
  }
}

export default new ChatroomService()
