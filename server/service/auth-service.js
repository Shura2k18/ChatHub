import UserModel from "../models/user-model.js"
import bcrypt from 'bcryptjs'
import { v4 as uuid } from "uuid"
import mailService from "./mail-service.js"
import tokenService from "./token-service.js"
import UserDto from "../dtos/user-dto.js"
import ApiError from "../exceptions/api-error.js"
 
class AuthService {
  async registration(email, password, name, tag, phone, role) {
    const candidate = await UserModel.findOne({ email })
    if (candidate) {
      throw ApiError.BadRequest(
        `User with email address ${email} already exists`,
      )
    }
    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid() // v34fa-asfasf-142saf-sa-asf
    phone = phone.replace(/\s+/g, "")
    if (!tag.includes("@")) {
      throw ApiError.BadRequest(`Incorrect tag`)
    }
    const logo = "uploads/users/user.png"
    const user = await UserModel.create({
      email,
      name,
      password: hashPassword,
      activationLink,
      imageUrl: logo,
      phone,
      role,
      tag,
    })
    //await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    const userDto = new UserDto(user) // id, email, name, isActivated
    const token = tokenService.generateToken({ ...userDto })

    return { token, user: userDto }
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink })
    if (!user) {
      throw ApiError.BadRequest("Incorrect activation link")
    }
    user.isActivated = true
    await user.save()
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })
    console.log(user)
    console.log(email)
    if (!user) {
      throw ApiError.BadRequest("User with this email was not found")
    }
    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) {
      throw ApiError.BadRequest("Incorrect password")
    }
    const userDto = new UserDto(user)
    const token = tokenService.generateToken({ ...userDto })

    return { token, user: userDto }
  }
}

export default new AuthService()
