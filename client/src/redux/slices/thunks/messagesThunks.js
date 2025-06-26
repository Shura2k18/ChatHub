import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../../../http/axios"

// const generateThumbnail = (videoFileUrl) => {
//   return new Promise((resolve, reject) => {
//     fetch(videoFileUrl)
//       .then((response) => response.blob()) // Получаем Blob из URL
//       .then((blob) => {
//         const video = document.createElement("video")
//         video.src = URL.createObjectURL(blob) // Создаем URL из Blob
//         video.crossOrigin = "anonymous"
//         video.currentTime = 1
//         video.muted = true
//         video.play()
//
//         video.onloadeddata = () => {
//           const canvas = document.createElement("canvas")
//           canvas.width = video.videoWidth
//           canvas.height = video.videoHeight
//           const ctx = canvas.getContext("2d")
//           ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
//           canvas.toBlob(
//             (blob) => resolve(URL.createObjectURL(blob)),
//             "image/jpeg",
//           )
//           video.pause()
//         }
//
//         video.onerror = reject
//       })
//       .catch(reject) // Обрабатываем ошибку в fetch
//   })
// }

export const fetchMessagesThunk = createAsyncThunk(
  "messages/fetchMessages",
  async ({ chatroomId, page }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/message/getMessages/${chatroomId}?page=${page}`,
      )
      if (page === 1) {
        const mediaCounters = response.data.mediaCounters
        // const messages = await Promise.all(
        //   response.data.messages.map(async (msg) => {
        //     if (msg.messageType === "video") {
        //       const thumbnail = await generateThumbnail(
        //         `${process.env.REACT_APP_SERVER_URL}${msg.fileUrl}`,
        //       )
        //       msg.thumbnail = thumbnail
        //     }
        //     return msg
        //   }),
        // )
        return {
          chatroomId,
          messages: response.data.messages,
          page,
          mediaCounters,
        }
      }
      return { chatroomId, messages: response.data, page }
    } catch (error) {
      return rejectWithValue(error.response)
    }
  },
)

export const fetchLastMessageThunk = createAsyncThunk(
  "messages/fetchLastMessage",
  async (chatroomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/message/getMessages/${chatroomId}?page=1&limit=1`,
      )
      return { chatroomId, messages: response.data }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  },
)

export const sendMessageThunk = createAsyncThunk(
  "messages/sendMessage",
  async (
    { messageData, setUploadProgress = () => {}, abortControllers = {} },
    { rejectWithValue },
  ) => {
    const chatroomId = messageData.get("chatroomId")
    const file = messageData.get("files") // Для текстовых сообщений file === null
    const fileKey = file ? `${chatroomId}_${file.name}` : null

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (messageData.get("messageType") !== "text") {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            )

            setUploadProgress((prev) => ({
              ...prev,
              [fileKey]: {
                progress: percentCompleted,
                chatroomId: chatroomId,
              },
            }))
          }
        },
        signal: abortControllers[fileKey]?.signal,
      }
      const response = await axios.post(
        "/message/sendMessage",
        messageData,
        config,
      )
      return response.data
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log(`Загрузка ${file.name} отменена`, error.message)
        return rejectWithValue({ fileKey, message: "Upload canceled" })
      }
      return rejectWithValue(
        error.response?.data || "Помилка відправлення повідомлення",
      )
    }
  },
)

export const deleteMessageThunk = createAsyncThunk(
  "messages/deleteMessage",
  async ({ messageId, chatroomId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/message/deleteMessage`, {
        data: { messageId, chatroomId }, // Указываем data вручную
      })
    } catch (error) {
      return rejectWithValue(error.response?.data || "Unknown error")
    }
  },
)
export const editMessageThunk = createAsyncThunk(
  "messages/editMessage",
  async (data, { rejectWithValue }) => {
    try {
      await axios.patch(`/message/editMessage`, data)
    } catch (error) {
      return rejectWithValue(error.response?.data || "Unknown error")
    }
  },
)

export const markAsReadThunk = createAsyncThunk(
  "messages/markAsRead",
  async (chatroomId, { rejectWithValue }) => {
    try {
      await axios.patch(`/message/markAsRead`, { chatroomId })
      return
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  },
)
