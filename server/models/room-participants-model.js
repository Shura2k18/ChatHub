import { Schema, model } from "mongoose"

const RoompersistSchema = new Schema(
  {
    chatroomId: { type: Schema.Types.ObjectId, ref: "Chatroom" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    role: { type: String, default: "member" },
    unreadCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

export default model("Roompersist", RoompersistSchema)
