import userService from "../service/user-service.js"
import ApiError from "../exceptions/api-error.js"

class UserController {
  async getMe(req, res, next) {
    try {
      const user = await userService.getMe(req.user)
      return res.json(user)
    } catch (e) {
      next(e)
    }
  }
  async getUser(req, res, next) {
    try {
      const userId = req.params.id
      const user = await userService.getUser(userId)
      return res.json(user)
    } catch (e) {
      next(e)
    }
  }
  async getUsers(req, res, next) {
    try {
      const user = req.user._id
      const users = await userService.getUsers(user)
      return res.json(users)
    } catch (e) {
      next(e)
    }
  }
  async updateImage(req, res, next) {
    try {
      let fileData = req.file
      if (!fileData) throw ApiError.BadRequest(`Wrong file type`)
      const user = req.user._id
      const imageUrl = `uploads/users/${user}/${req.file.originalname}`
      await userService.updateImage(user, imageUrl)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
  async updateName(req, res, next) {
    try {
      const { newName } = req.body
      const user = req.user._id
      const data = await userService.updateName(user, newName)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async updateData(req, res, next) {
    try {
      // const value = Object.values(req.body)[0];
      const [[key, value]] = Object.entries(req.body)
      const user = req.user._id
      const data = await userService.updateData(user, key, value)

      if (key === "password" && !data) return res.status(204)
      return res.status(200).send()
    } catch (e) {
      next(e)
    }
  }
  async addContact(req, res, next) {
    try {
      const userId = req.user._id
      const { contactId } = req.body
      console.log(contactId)
      const data = await userService.addContact(userId, contactId)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async deleteContact(req, res, next) {
    try {
      const userId = req.user._id
      const { contactId } = req.body
      await userService.deleteContact(userId, contactId)
      return res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
  async getContacts(req, res, next) {
    try {
      const userId = req.user._id
      const data = await userService.getContacts(userId)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
  async findUsers(req, res, next) {
    try {
      const userId = req.user._id
      const text = req.params.text
      const data = await userService.findUsers(userId, text)
      return res.json(data)
    } catch (e) {
      next(e)
    }
  }
}

export default new UserController()
