import { Schema, model } from "mongoose"

const UserContactsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    contacts: [
      {
        contactId: { type: Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default model("UserContacts", UserContactsSchema)
