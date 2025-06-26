import authService from "../service/auth-service.js"
import { validationResult } from "express-validator"
import ApiError from "../exceptions/api-error.js"
import { io } from "../WebSocket/websocket.js"

class AuthController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()))
      }
      const { email, password, name, tag, phone, role } = req.body
      const userData = await authService.registration(
        email,
        password,
        name,
        tag,
        phone,
        role,
      )
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await authService.login(email, password)
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      await authService.activate(activationLink)
      return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }
}

export default new AuthController()
