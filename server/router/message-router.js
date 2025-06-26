//Express
import { Router } from "express"
const router = new Router()

//Controllers
import messageController from "../controllers/message-controller.js"

//Middlewares
import authMiddleware from "../middlewares/auth-middleware.js"

import { body } from "express-validator"
// import upload from "../middlewares/file-middleware.js"
import { fileUploadMiddleware } from "../middlewares/file-middleware.js"
import ApiError from "../exceptions/api-error.js"

router.post(
  "/sendMessage",
  authMiddleware,
  fileUploadMiddleware,
  messageController.sendMessage,
)
router.patch(
  "/editMessage",
  authMiddleware,
  body("message").isLength({ min: 1 }),
  messageController.editMessage,
)
router.patch("/markAsRead", authMiddleware, messageController.markAsRead)
router.delete("/deleteMessage", authMiddleware, messageController.deleteMessage)
router.get(
  "/getMessages/:chatroomId",
  authMiddleware,
  messageController.getMessages,
)
router.get("/findMessages/", authMiddleware, messageController.findMessages)

export default router
