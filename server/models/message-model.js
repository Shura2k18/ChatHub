import { Schema, model } from "mongoose"

const MessageSchema = new Schema(
  {
    chatroomId: { type: Schema.Types.ObjectId, ref: "Chatroom" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    messageType: { type: String },
    fileUrl: { type: String },
    thumbnail: { type: String },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text"
      },
    },
    isChanged: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export default model("Message", MessageSchema)
