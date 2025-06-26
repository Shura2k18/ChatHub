import { Schema, model } from "mongoose"

const ChatroomSchema = new Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.type !== "private"
      },
    },
    tag: {
      type: String,
      unique: true,
      required: function () {
        return this.type !== "private"
      },
    },
    type: { type: String, required: true },
    imageUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
)
ChatroomSchema.index({ name: "text", tag: "text" })

export default model("Chatroom", ChatroomSchema)
