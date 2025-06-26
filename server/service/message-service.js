import ApiError from "../exceptions/api-error.js"
import RoompersistModel from "../models/room-participants-model.js"
import MessageModel from "../models/message-model.js"
import ChatroomModel from "../models/chatroom-model.js"
import UserDto from "../dtos/user-dto.js"
import fs from "fs"
import util from "util"
import { io } from "../WebSocket/websocket.js"
import ffmpeg from "fluent-ffmpeg"
import path from "path"
import ffmpegStatic from "ffmpeg-static"
import { activeUploads } from "../middlewares/file-middleware.js"

const stat = util.promisify(fs.stat)
const rename = util.promisify(fs.rename)

ffmpeg.setFfmpegPath(ffmpegStatic) // Указываем путь к ffmpeg

const generateThumbnail = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["2"], // Взять кадр на 2-й секунде
        filename: "thumbnail.jpg",
        folder: path.dirname(outputPath),
      })
      .on("end", () => {
        console.log("Thumbnail saved at:", outputPath)
        resolve(outputPath)
      })
      .on("error", (err) => {
        console.error("Ошибка при создании превью:", err)
        reject(err)
      })
  })
}
const waitForFile = async (filePath, timeout = 5000) => {
  const startTime = Date.now()
  let lastSize = -1

  while (Date.now() - startTime < timeout) {
    try {
      const stats = await stat(filePath)
      if (stats.size === lastSize) {
        return true // Файл більше не змінюється
      }
      lastSize = stats.size
    } catch (error) {
      if (error.code !== "ENOENT") throw error // Якщо файл не знайдено, чекаємо
    }
    await new Promise((resolve) => setTimeout(resolve, 500)) // Чекаємо 500 мс
  }
  console.log("Файл завершив запис, все нормально")
  throw new Error("Файл не завершив запис вчасно")
}

// Функція для безпечного переміщення файлу
const moveFile = async (oldPath, newPath) => {
  await waitForFile(oldPath)
  console.log("Початток переміщення")
  await rename(oldPath, newPath)
  console.log("Завершення переміщення")
}
const removeTempFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`❌ Файл ${filePath} удалён`)
  }
}

class MessageService {
  async isChatAndUserAvailable(chatroomId, userId) {
    console.log(chatroomId)
    console.log(userId)
    const chat = await RoompersistModel.findOne({ chatroomId, user: userId })

    if (!chat) {
      throw ApiError.BadRequest(
        `Chatroom was not found or user is not a participant`,
      )
    }
  }

  async sendMessage(user, chatroomId, messageType, content, files) {
    await this.isChatAndUserAvailable(chatroomId, user)

    let fileUrl
    let thumbnail
    files.forEach((file) => {
      file.originalname === "thumbnail.jpg"
        ? (thumbnail = file)
        : (fileUrl = file)
      console.log(file.originalname)
    })

    const createMessage = async ({
      user,
      chatroomId,
      messageType,
      content,
    }) => {
      try {
        const messageData = {
          user,
          chatroomId,
          messageType,
        }
        if (content) {
          messageData.content = content
        }
        const message = await MessageModel.create(messageData)

        return message
      } catch (error) {
        throw error
      }
    }
    // let message = new MessageModel({ user, chatroomId, messageType, content })
    // await message.save()
    let message = await createMessage({
      user,
      chatroomId,
      messageType,
      content,
    })

    if (fileUrl && messageType !== "text") {
      const newDir = `uploads/chats/${chatroomId}/messages/${message._id}`
      const oldDir = `uploads/chats/${chatroomId}/messages/temp`

      const filePath = `${oldDir}/${fileUrl.originalname}`

      // ✅ Проверяем, был ли файл успешно загружен
      if (!fs.existsSync(filePath)) {
        console.log(
          `⚠️ Файл ${filePath} не найден, возможно, загрузка была отменена`,
        )
        removeTempFile(filePath)
        return
      }

      if (
        activeUploads.has(`${chatroomId}/messages/temp/${fileUrl.originalname}`)
      ) {
        console.log("⏳ Файл ещё загружается, ждём завершения...")
        await waitForFile(filePath)
      }

      fs.mkdirSync(newDir, { recursive: true })
      console.log("Створення папки", `${newDir}`)
      const newFilePath = `${newDir}/${fileUrl.originalname}`
      console.log("Переміщення файлу", `${oldDir}/${fileUrl.originalname}`)
      await moveFile(`${oldDir}/${fileUrl.originalname}`, newFilePath)
      console.log("Файл перемістився", `${newFilePath}`)
      activeUploads.delete(
        `${chatroomId}/messages/temp/${fileUrl.originalname}`,
      )

      //fs.renameSync(`${oldDir}/${fileUrl.originalname}`, newFilePath)
      if (messageType === "video") {
        if (!thumbnail) {
          try {
            const thumbnailPath = await generateThumbnail(
              newFilePath,
              `${newDir}/thumbnail.jpg`,
            )

            await MessageModel.updateOne(
              { _id: message._id },
              { $set: { fileUrl: newFilePath, thumbnail: thumbnailPath } },
              { new: true },
            )
          } catch (error) {
            console.error("Ошибка при создании превью:", error)
          }
        } else {
          const thumbnailNewPath = `${newDir}/${thumbnail.originalname}`

          await moveFile(
            `${oldDir}/${thumbnail.originalname}`,
            thumbnailNewPath,
          )
          //fs.renameSync(`${oldDir}/${thumbnail.originalname}`, thumbnailNewPath)
          await MessageModel.updateOne(
            { _id: message._id },
            { $set: { fileUrl: newFilePath, thumbnail: thumbnailNewPath } },
            { new: true },
          )
        }
      } else {
        await MessageModel.updateOne(
          { _id: message._id },
          { $set: { fileUrl: newFilePath } },
          { new: true },
        )
      }
    }
    message = await MessageModel.findById(message._id)
    await message.populate("user", "name imageUrl")
    await ChatroomModel.findByIdAndUpdate(chatroomId, { updatedAt: new Date() })
    await RoompersistModel.updateMany(
      { chatroomId, user: { $ne: user } },
      { $inc: { unreadCount: 1 } },
    )
    const unreadCounts = await RoompersistModel.find({
      chatroomId,
      user: { $ne: user },
    })
      .select("user unreadCount")
      .lean()
    io.to(`chatroom:${chatroomId}`).emit("newMessage", {
      chatroomId,
      message,
      unreadCounts,
      userId: user,
    })
    return
  }
  async sendFile(user, chatroomId, message) {
    await this.isChatAndUserAvailable(chatroomId, user)

    await MessageModel.create({ user, chatroomId, message })
    const mess = await MessageModel.findOne({
      user,
      chatroomId,
      message,
    }).populate("user")
    const userDto = new UserDto(mess.user)
    mess.user = userDto
    return mess
  }
  async editMessage(user, chatroomId, message, messageId) {
    await this.isChatAndUserAvailable(chatroomId, user)

    const mess = await MessageModel.findById(messageId)
    if (String(mess.user) !== user)
      throw ApiError.BadRequest(`You did not send this message`)
    if (!mess.content)
      throw ApiError.BadRequest(`You did not content to change`)

    await MessageModel.updateOne(
      { _id: messageId },
      { $set: { content: message, isChanged: true } },
    )
    io.to(`chatroom:${chatroomId}`).emit("editMessage", {
      messageId,
      content: message,
    })
  }
  async markAsRead(userId, chatroomId) {
    await this.isChatAndUserAvailable(chatroomId, userId)
    await MessageModel.updateMany(
      { chatroomId, isRead: false, user: { $ne: userId } },
      { $set: { isRead: true } },
    )
    await RoompersistModel.updateOne(
      { chatroomId, user: userId },
      { $set: { unreadCount: 0 } },
    )
    const unreadCounts = await RoompersistModel.find({
      chatroomId,
      user: userId,
    })
      .select("user unreadCount")
      .lean()
    // 📡 Сообщаем всем в чате, что сообщения прочитаны
    io.to(`chatroom:${chatroomId}`).emit("messagesRead", {
      chatroomId,
      userId,
      unreadCounts,
    })

    return { success: true }
  }
  async deleteMessage(user, chatroomId, messageId) {
    await this.isChatAndUserAvailable(chatroomId, user)

    const message = await MessageModel.findById(messageId)
    const u = await RoompersistModel.findOne({ chatroomId, user })

    if (!message) throw ApiError.BadRequest("Message not found")
    if (String(message.user) !== user) {
      if (u.role === "member")
        throw ApiError.BadRequest("You do not have permission")
    }

    // Путь к папке с файлами сообщения
    const messageDir = path.join(
      "uploads",
      "chats",
      chatroomId,
      "messages",
      messageId,
    )

    if (message.messageType !== "text" && fs.existsSync(messageDir)) {
      fs.rmSync(messageDir, { recursive: true, force: true })
    }

    await MessageModel.deleteOne({ _id: messageId })

    io.to(`chatroom:${chatroomId}`).emit("deleteMessage", {
      chatroomId,
      messageId,
      messageType: message.messageType,
    })
  }
  // async getMessages(user, chatroomId) {
  //     await this.isChatAndUserAvailable(chatroomId, user);

  //     const messages = await MessageModel.find({chatroomId}).populate('user');
  //     const mess = messages.map(mess => {
  //         const userDto = new UserDto(mess.user)
  //         mess.user = userDto
  //         return mess
  //     })
  //     return mess
  // }
  async getMessages(chatroomId, page, limit) {
    page = parseInt(page)
    limit = parseInt(limit)

    let messages = await MessageModel.find({ chatroomId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name imageUrl")

    if (page === 1 && limit !== 1) {
      const mess = await MessageModel.find({
        chatroomId,
        messageType: { $in: ["image", "video"] },
      })
      const mediaCounters = mess.reduce((acc, message) => {
        const { chatroomId, messageType } = message

        if (!acc[chatroomId]) {
          acc[chatroomId] = { imageCount: 0, videoCount: 0 }
        }

        if (messageType === "image") {
          acc[chatroomId].imageCount++
        } else if (messageType === "video") {
          acc[chatroomId].videoCount++
        }

        return acc
      }, {})
      messages = { messages, mediaCounters }
      return messages
    }
    return messages
  }
  async findMessages(chatroomId, message) {
    const isChat = chatroomId.slice(0, 1) ? 1 : 0
    const isMess = message.slice(0, 1) ? 1 : 0
    if (!isChat || !isMess)
      throw ApiError.BadRequest(`Incorrect chat or message`)
    const re = RegExp(message, "ig")
    const messages = await MessageModel.find({
      chatroomId,
      message: re,
    }).populate("user")
    messages.forEach((mess) => {
      const userDto = new UserDto(mess.user)
      return (mess.user = userDto)
    })
    return messages
  }
}

setInterval(() => {
  activeUploads.forEach((_, filePath) => {
    const fullPath = `uploads/chats/${filePath}`
    if (!fs.existsSync(fullPath)) {
      console.log(`🗑️ Файл ${fullPath} не найден, удаляем из activeUploads`)
      activeUploads.delete(filePath)
    }
  })
}, 60000)

export default new MessageService()
