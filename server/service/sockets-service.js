import RoompersistModel from "../models/room-participants-model.js"
import MessageModel from "../models/message-model.js"

class SocketsService {
  connection(socket, io) {
    console.log("Connected: " + socket.userId)

    socket.on("disconnect", () => {
      console.log("Disconnected: " + socket.userId)
    })

    socket.on("joinRoom", ({ chatroomId }) => {
      socket.join(chatroomId)
      console.log("A user joined chatroom: " + chatroomId)
    })

    socket.on("leaveRoom", ({ chatroomId }) => {
      socket.leave(chatroomId)
      console.log("A user left chatroom: " + chatroomId)
    })

    socket.on("sendMessage", async ({ chatroomId, message }) => {
      if (message.trim().length > 0) {
        const chat = await RoompersistModel.findOne({
          users: socket.userId,
          chatroomId: chatroomId,
        }).populate("users")
        let user
        chat.users.forEach((c) => {
          c._id == socket.userId ? (user = Object.assign({}, c._doc)) : user
        })
        console.log(user.name + "   " + message)
        const newMessage = new MessageModel({
          chatroomId: chatroomId,
          user: socket.userId,
          message,
        })
        io.to(chatroomId).emit("getMessage", {
          message,
          name: user.name,
          userId: socket.userId,
        })
        await newMessage.save()
      }
    })
  }
}
export default new SocketsService()
