import chatroomService from "../service/chatroom-service.js"
import { validationResult } from "express-validator"
import ApiError from "../exceptions/api-error.js"
import { io } from "../WebSocket/websocket.js"

class UserController {
  async createRoom(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const imageUrl = req.file
      const { name, tag, type } = req.body
      const users = JSON.parse(req.body.users)
      const createdBy = req.user._id
      await chatroomService.createRoom(
        name,
        createdBy,
        imageUrl,
        users,
        tag,
        type,
      )

      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }

  async joinRoom(req, res, next) {
    try {
      const { chatroomId } = req.body
      const user = req.user._id
      const data = await chatroomService.joinRoom(chatroomId, user)
      io.to(chatroomId).emit("joinNewUser", data)
      console.log(`Пользователь ${user} присоединился к комнате ${chatroomId}`)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  // async joinRoom(data, socket) {
  //     try {
  //         const { chatroomId } = data; // Получаем данные из события
  //         const user = socket.user._id; // Данные пользователя из middleware
  //         const result = await chatroomService.joinRoom(chatroomId, user);

  //         // Присоединение пользователя к комнате через Socket.IO
  //         socket.join(chatroomId);

  //         console.log(`Пользователь ${user} присоединился к комнате ${chatroomId}`);
  //         return result; // Возвращаем результат операции
  //     } catch (e) {
  //         console.error("Ошибка в joinRoom:", e.message);
  //         throw e; // Прокидываем ошибку
  //     }
  // }

  async leaveRoom(req, res, next) {
    try {
      const { chatroomId } = req.body
      const user = req.user._id
      await chatroomService.leaveRoom(chatroomId, user)
      return res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
  async deleteRoom(req, res, next) {
    try {
      const { chatroomId } = req.body
      const user = req.user._id
      await chatroomService.deleteRoom(chatroomId, user)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
  async updateName(req, res, next) {
    try {
      const { newName, chatroomId } = req.body
      const user = req.user._id
      const data = await chatroomService.updateName(chatroomId, newName, user)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async updateImage(req, res, next) {
    try {
      let fileData = req.file
      if (!fileData) throw ApiError.BadRequest(`Wrong file type`)
      const { chatroomId } = req.body
      const imageUrl = `uploads/chats/${chatroomId}/${req.file.originalname}`
      const user = req.user._id
      const data = await chatroomService.updateImage(user, imageUrl, chatroomId)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async getChatrooms(req, res, next) {
    try {
      const user = req.user._id
      const data = await chatroomService.getChatrooms(user)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async getChatroom(req, res, next) {
    try {
      const user = req.user._id
      const chatroom = req.params.chatroom
      const data = await chatroomService.getChatroom(user, chatroom)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async findChatroom(req, res, next) {
    try {
      const text = req.params.text
      const user = req.user._id
      const data = await chatroomService.findChatroom(user, text)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
}

export default new UserController()
