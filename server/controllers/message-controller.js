import messageService from "../service/message-service.js"
import { validationResult } from "express-validator"
import ApiError from "../exceptions/api-error.js"

class UserController {
  async sendMessage(req, res, next) {
    try {
      const user = req.user._id
      const files = req.files
      const { messageType, chatroomId, content } = req.body
      await messageService.sendMessage(
        user,
        chatroomId,
        messageType,
        content,
        files,
      )
      return res.status(201).send()
    } catch (e) {
      console.log(e)
      next(e)
    }
  }
  async sendFile(req, res, next) {
    try {
      let fileData = req.file
      if (!fileData) throw ApiError.BadRequest(`Wrong file type`)
      const { chatroomId } = req.body
      const fileUrl = `${process.env.API_URL}/uploads/chats/${chatroomId}/messages/${req.file.originalname}`
      const user = req.user._id
      const data = await messageService.sendFile(user, chatroomId, fileUrl)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async editMessage(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()))
      }
      const user = req.user._id
      const { message, messageId, chatroomId } = req.body
      await messageService.editMessage(user, chatroomId, message, messageId)
      return res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
  async markAsRead(req, res, next) {
    try {
      const { chatroomId } = req.body
      const userId = req.user._id
      await messageService.markAsRead(userId, chatroomId)
      return res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
  async deleteMessage(req, res, next) {
    try {
      const user = req.user._id
      const { messageId, chatroomId } = req.body
      await messageService.deleteMessage(user, chatroomId, messageId)
      return res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
  // async getMessages(req, res, next) {
  //     try {
  //         const chatroom = req.params.chatroom;
  //         const user = req.user._id;
  //         const data = await messageService.getMessages(user, chatroom);
  //         return res.json(data);
  //     } catch (e) {
  //         next(e);
  //     }
  // }
  async getMessages(req, res, next) {
    try {
      const { chatroomId } = req.params
      const { page = 1, limit = 50 } = req.query
      const data = await messageService.getMessages(chatroomId, page, limit)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async findMessages(req, res, next) {
    try {
      const chatroomId = req.query.chatroomId
      const message = req.query.message
      const data = await messageService.findMessages(chatroomId, message)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
}

export default new UserController()
