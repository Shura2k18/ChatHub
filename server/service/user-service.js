import UserModel from "../models/user-model.js"
import UserContactsModel from "../models/user-contacts-model.js"
import UserDto from "../dtos/user-dto.js"
import ApiError from "../exceptions/api-error.js"
import fs from "fs"
import bcrypt from "bcryptjs"
import { redisClient } from "../index.js"
import { getRelevantUsers, io, sessions } from "../WebSocket/websocket.js"

class UserService {
  async updateImage(userId, imageUrl) {
    const user = await UserModel.findById(userId)

    const newUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { imageUrl },
      { new: true },
    )
    if (user.imageUrl !== null && user.imageUrl !== `uploads/users/user.png`) {
      //let file = user.imageUrl.split(process.env.SERVER_URL + '/')[1]
      fs.unlink(user.imageUrl, function (err) {
        if (err) {
          console.log(err)
        }
      })
    }

    const userDto = new UserDto(newUser)

    const relevantUsers = await getRelevantUsers(userId)
    const activeSessions = await redisClient.sMembers(
      `onlineSessions:${userId}`,
    )
    relevantUsers.forEach((id) => {
      if (id !== userId) {
        io.to(`status:${id}`).emit("newUserData", { userId, data: userDto })
      }
    })
    activeSessions.forEach((sessionId) => {
      io.to(sessionId).emit("updateMyData", { data: userDto })
    })
    // return userDto
  }
  // async updateName(userId, newName) {
  //   const newUser = await UserModel.findOneAndUpdate(
  //     { _id: userId },
  //     { name: newName },
  //     { new: true },
  //   )
  //
  //   const userDto = new UserDto(newUser)
  //   return userDto
  // }
  async updateData(userId, key, value) {
    if (key === "name" && value.length < 1)
      throw ApiError.BadRequest("Name must be longer than 1 character")
    if (key === "name" && value.length > 50)
      throw ApiError.BadRequest("Name must be shorter than 50 characters")
    if (key === "tag" && !value.includes("@"))
      throw ApiError.BadRequest("Tag must contain @")
    if (key === "tag" && value.length < 5)
      throw ApiError.BadRequest("Tag must be longer than 5 characters")
    if (key === "tag" && value.length > 20)
      throw ApiError.BadRequest("Tag must be shorter than 20 characters")
    if (key === "phone" && value.length < 1)
      throw ApiError.BadRequest("Phone must be longer than 1 character")
    if (key === "phone" && value.length > 20)
      throw ApiError.BadRequest("Phone must be shorter than 20 characters")
    if (key === "password" && value.length < 8)
      throw ApiError.BadRequest("Password must be longer than 8 characters")
    if (key === "password" && value.length > 20)
      throw ApiError.BadRequest("Password must be shorter than 20 characters")

    if (key === "password") value = await bcrypt.hash(value, 3)
    const newUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { [key]: value },
      { new: true },
    )

    const userDto = new UserDto(newUser)

    const relevantUsers = await getRelevantUsers(userId)
    const activeSessions = await redisClient.sMembers(
      `onlineSessions:${userId}`,
    )
    relevantUsers.forEach((id) => {
      if (id !== userId) {
        io.to(`status:${id}`).emit("newUserData", { userId, data: userDto })
      }
    })
    activeSessions.forEach((sessionId) => {
      io.to(sessionId).emit("updateMyData", { data: userDto })
    })
  }

  async getMe({ _id }) {
    const user = await UserModel.findById(_id)
    if (!user) {
      throw ApiError.BadRequest("User was not found")
    }
    const userDto = new UserDto(user)
    return userDto
  }
  async getUsers(userId) {
    const users = await UserModel.find({ _id: { $ne: userId } })
    if (!users) {
      throw ApiError.BadRequest("Users was not found")
    }

    users.forEach((user) => {
      const userDto = new UserDto(user)
      return (user._doc = userDto)
    })
    return users
  }
  async getUser(id) {
    const user = await UserModel.findById(id)
    if (!user) {
      throw ApiError.BadRequest("User was not found")
    }
    const userDto = new UserDto(user)
    return userDto
  }
  async addContact(userId, contactId) {
    const user = await UserContactsModel.findOne({
      userId,
      contacts: { $elemMatch: { contactId } },
    })
    if (user) {
      throw ApiError.BadRequest("The contact already exists")
    }

    await UserContactsModel.updateOne(
      { userId },
      { $push: { contacts: { contactId } } },
      { upsert: true },
    )
    const contacts = await UserContactsModel.findOne({
      userId,
    }).populate("contacts.contactId")
    let contact
    contacts.contacts.forEach((c) => {
      c.contactId._id == contactId
        ? (contact = Object.assign({}, c.contactId._doc))
        : contact
    })
    const userDto = new UserDto(contact)
    const activeSessions = await redisClient.sMembers(
      `onlineSessions:${userId}`,
    )
    activeSessions.forEach((sessionId) => {
      io.to(sessionId).emit("addContact", { contact: userDto })
    })
  }
  async deleteContact(userId, contactId) {
    const user = await UserContactsModel.findOne({
      userId,
      "contacts.contactId": contactId,
    })

    if (!user) {
      throw ApiError.BadRequest("The contact does not exist")
    }

    await UserContactsModel.updateOne(
      { userId },
      { $pull: { contacts: { contactId } } },
    )
    const activeSessions = await redisClient.sMembers(
      `onlineSessions:${userId}`,
    )
    activeSessions.forEach((sessionId) => {
      io.to(sessionId).emit("deleteContact", { contactId })
    })
  }
  async getContacts(userId) {
    const contacts = await UserContactsModel.findOne({ userId }).populate(
      "contacts.contactId",
    )
    if (!contacts) {
      return []
    }

    const contactsDto = contacts.contacts.map((c) => {
      const userDto = new UserDto(c.contactId)
      delete c._id
      delete c.addedAt
      return (c.contactId._doc = userDto)
    })

    return contactsDto
  }
  async findUsers(userId, text) {
    if (!text) throw ApiError.BadRequest("Search text is required")

    const isTagSearch = text.startsWith("@") // Поиск по тегу
    const isPureNumber = /^\d+$/.test(text) // Чисто цифры без +
    const isPhoneSearch = /^\+\d+$/.test(text) // Начинается с + и дальше цифры
    const isMixedText = /\D/.test(text) // Есть хотя бы одна буква (не число)

    let searchQuery

    if (isTagSearch) {
      // 🔎 Если начинается с "@", ищем по тегу
      searchQuery = { tag: new RegExp(text.slice(1), "i") }
    } else if (isPhoneSearch) {
      // 🔎 Если начинается с "+", ищем только по номеру телефона
      searchQuery = { phone: new RegExp(text, "i") }
    } else if (isPureNumber) {
      // 🔎 Если только цифры, ищем по имени и номеру одновременно
      searchQuery = {
        $or: [
          { name: new RegExp(text, "i") },
          { phone: new RegExp(text, "i") },
        ],
      }
    } else if (isMixedText) {
      // 🔎 Если смешанный текст (буквы + цифры), ищем только по имени
      searchQuery = { name: new RegExp(text, "i") }
    } else {
      throw ApiError.BadRequest("Invalid search input")
    }

    // Поиск пользователей
    const users = await UserModel.find(searchQuery)

    // Получаем контакты текущего пользователя
    const userContacts = await UserContactsModel.findOne({ userId }).populate(
      "contacts.contactId",
    )
    const contactIds = new Set(
      userContacts?.contacts.map((c) => String(c.contactId._id)) || [],
    )

    // Разделяем пользователей на контакты и найденные
    const { myData, searchResult } = users.reduce(
      (acc, user) => {
        if (String(user._id) === userId) return acc

        if (contactIds.has(String(user._id))) {
          acc.myData.push(new UserDto(user))
        } else {
          acc.searchResult.push(new UserDto(user))
        }

        return acc
      },
      { myData: [], searchResult: [] },
    )

    return { myData, searchResult }
  }
}

export default new UserService()
