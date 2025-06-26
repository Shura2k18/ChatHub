import multer from "multer"
import fs from "fs"
import { v4 as uuid } from "uuid"

export const activeUploads = new Map() // <== ✅ Отслеживание активных загрузок

const checkAndCreateFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath = ""

    switch (req.originalUrl) {
      case "/user/updateImage":
        folderPath = `uploads/users/${req.user._id}`
        break
      case "/chatroom/createRoom":
        folderPath = "uploads/chats/temp"
        break
      case "/chatroom/updateImage":
        folderPath = `uploads/chats/${req.body.chatroomId}`
        break
      case "/message/sendMessage":
        folderPath = `uploads/chats/${req.body.chatroomId}/messages/temp`
        break
      default:
        folderPath = "uploads/temp"
    }

    checkAndCreateFolder(folderPath)
    cb(null, folderPath)
  },
  filename: (req, file, cb) => {
    file.originalname = file.originalname.replace(/\s+/g, "_") // Пробелы → _
    const extension = file.originalname.split(".").pop()
    const baseName = file.originalname.replace(`.${extension}`, "")
    const uniqueSuffix = uuid().split("-")[0]
    const newFileName = `${baseName}_${uniqueSuffix}.${extension}`

    file.filename = newFileName
    file.originalname = newFileName
    cb(null, file.originalname)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
})

export const fileUploadMiddleware = (req, res, next) => {
  upload.array("files", 10)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Файл перевищує 2 ГБ" })
      }
      return res.status(400).json({ message: err.message })
    }

    if (req.files) {
      req.files.forEach((file) => {
        const filePath = `uploads/chats/${req.body.chatroomId}/messages/temp/${file.filename}`
        activeUploads.set(filePath, true)
      })
    }
    next()
  })
  // req.on("aborted", () => {
  //   console.log("🚨 Запрос был прерван клиентом!")
  //   cleanupTempFiles(req)
  // })
  // req.on("close", () => {
  //   console.log("🚨 Соединение закрыто!")
  //   cleanupTempFiles(req)
  // })
}

// 🗑️ УДАЛЯЕМ НЕЗАВЕРШЁННЫЕ ФАЙЛЫ
// const cleanupTempFiles = (req) => {
//   console.log("🗑️ Удаление временных файлов...")
//
//   const files = req.files || (req.file ? [req.file] : [])
//   console.log("📂 Загруженные файлы:", files)
//
//   files.forEach((file) => {
//     console.log("🧐 Файл:", file)
//     if (!file || !file.filename) return
//
//     const filePath = `uploads/chats/${req.body.chatroomId}/messages/temp/${file.filename}`
//     if (fs.existsSync(filePath)) {
//       try {
//         fs.unlinkSync(filePath)
//         console.log(`❌ Удалён файл: ${filePath}`)
//       } catch (err) {
//         console.error("Ошибка удаления файла:", err)
//       }
//     }
//   })
// }
