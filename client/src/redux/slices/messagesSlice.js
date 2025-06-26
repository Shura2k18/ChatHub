import { createSlice } from "@reduxjs/toolkit"
import {
  fetchLastMessageThunk,
  fetchMessagesThunk,
  markAsReadThunk,
} from "./thunks/messagesThunks"
import { leaveChatroomThunk } from "./thunks/chatroomsThunks"

const initialState = {
  messages: {}, // { messageId: { _id, chatroomId, user, content, isRead, ... } }
  chatMessages: {}, // { chatroomId: [messageId1, messageId2, ...] }
  chatPagination: {}, // { chatroomId: { page: 1, hasMore: true, loading: false } }
}

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessages: (state, action) => {
      const { chatroomId } = action.payload
      state.messages[chatroomId] = []
      state.pages[chatroomId] = 1
      state.hasMore[chatroomId] = true
    },
    addMessage: (state, action) => {
      const { chatroomId, message } = action.payload

      if (!state.chatMessages[chatroomId]) {
        state.chatMessages[chatroomId] = []
      }

      state.messages[message._id] = message

      // Добавляем в конец, если его ещё нет
      if (!state.chatMessages[chatroomId].includes(message._id)) {
        state.chatMessages[chatroomId].push(message._id)
      }

      if (["video", "image"].includes(message.messageType)) {
        if (message.messageType === "video") {
          if (state.mediaCounters[chatroomId]?.videoCount !== undefined) {
            state.mediaCounters[chatroomId].videoCount++
          } else {
            if (!state.mediaCounters[chatroomId]) {
              state.mediaCounters[chatroomId] = {}
            }
            state.mediaCounters[chatroomId].videoCount = 1
          }
        }

        if (message.messageType === "image") {
          if (state.mediaCounters[chatroomId]?.imageCount !== undefined) {
            state.mediaCounters[chatroomId].imageCount++
          } else {
            if (!state.mediaCounters[chatroomId]) {
              state.mediaCounters[chatroomId] = {}
            }
            state.mediaCounters[chatroomId].imageCount = 1
          }
        }
      }
    },
    deleteMessages: (state, action) => {
      const chatroomId = action.payload.chatroomId

      // Новый объект chatMessages, не содержащий chatroomId
      const updatedChatMessages = { ...state.chatMessages }
      delete updatedChatMessages[chatroomId] // Удаляем чат для данного chatroomId

      // Новый объект chatPagination, не содержащий chatroomId
      const updatedChatPagination = { ...state.chatPagination }
      delete updatedChatPagination[chatroomId] // Удаляем пагинацию для данного chatroomId

      // Новый объект messages, где мы удаляем сообщения для данного chatroomId
      const updatedMessages = { ...state.messages }
      const messageIds = state.chatMessages[chatroomId] || []
      messageIds.forEach((id) => {
        delete updatedMessages[id] // Удаляем каждое сообщение
      })

      // Обновляем состояние с новыми значениями
      state.chatMessages = updatedChatMessages
      state.chatPagination = updatedChatPagination
      state.messages = updatedMessages
    },
    markMessagesAsRead: (state, action) => {
      const { chatroomId, userId } = action.payload
      if (state.chatMessages[chatroomId]) {
        state.chatMessages[chatroomId].forEach((msgId) => {
          if (state.messages[msgId].user !== userId) {
            state.messages[msgId].isRead = true
          }
        })
      }
    },
    deleteMessage: (state, action) => {
      const { chatroomId, messageId, messageType } = action.payload

      if (!state.messages[messageId]) return // Проверяем, есть ли сообщение

      // Удаляем сообщение из messages
      delete state.messages[messageId]

      // Удаляем ID сообщения из chatMessages
      if (state.chatMessages[chatroomId]) {
        state.chatMessages[chatroomId] = state.chatMessages[chatroomId].filter(
          (id) => id !== messageId,
        )
      }

      // Обновляем mediaCounters, если сообщение было видео или изображением
      if (
        ["video", "image"].includes(messageType) &&
        state.mediaCounters[chatroomId]
      ) {
        if (
          messageType === "video" &&
          state.mediaCounters[chatroomId].videoCount > 0
        ) {
          state.mediaCounters[chatroomId].videoCount--
        }
        if (
          messageType === "image" &&
          state.mediaCounters[chatroomId].imageCount > 0
        ) {
          state.mediaCounters[chatroomId].imageCount--
        }
      }
    },
    editMessage: (state, action) => {
      const { messageId, content } = action.payload

      if (state.messages[messageId]) {
        state.messages[messageId].content = content
        state.messages[messageId].isChanged = true
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch messages
    builder.addCase(fetchMessagesThunk.pending, (state, action) => {
      const chatroomId = String(action.meta.arg.chatroomId)
      if (!state.chatPagination[chatroomId]) {
        state.chatPagination[chatroomId] = {
          page: 1,
          hasMore: true,
          loading: true,
        }
      }
      state.chatPagination[chatroomId].loading = true
    })
    builder.addCase(fetchMessagesThunk.fulfilled, (state, action) => {
      const { chatroomId, messages, page, mediaCounters } = action.payload
      if (!state.chatMessages[chatroomId]) {
        state.chatMessages[chatroomId] = []
      }
      if (!state.chatPagination[chatroomId]) {
        state.chatPagination[chatroomId] = {
          page: 1,
          hasMore: true,
          loading: false,
        }
      }

      messages.forEach((msg) => {
        state.messages[msg._id] = msg
        if (!state.chatMessages[chatroomId].includes(msg._id)) {
          state.chatMessages[chatroomId].unshift(msg._id)
        }
      })

      state.chatPagination[chatroomId].page = page + 1
      state.chatPagination[chatroomId].hasMore = messages.length > 0
      state.chatPagination[chatroomId].loading = false
      if (!state.mediaCounters) {
        state.mediaCounters = {}
      }

      if (mediaCounters) {
        state.mediaCounters[chatroomId] = {
          imageCount: mediaCounters[chatroomId]?.imageCount || 0,
          videoCount: mediaCounters[chatroomId]?.videoCount || 0,
        }
      }
    })
    builder.addCase(fetchMessagesThunk.rejected, (state, action) => {
      console.log(action.payload)
    })
    // Fetch last message
    builder.addCase(fetchLastMessageThunk.pending, (state, action) => {
      const chatroomId = action.meta.arg
      if (!state.chatPagination[chatroomId]) {
        state.chatPagination[chatroomId] = {
          page: 1,
          hasMore: true,
          loading: true,
        }
      }
    })
    builder.addCase(fetchLastMessageThunk.fulfilled, (state, action) => {
      const { chatroomId, messages } = action.payload

      if (!state.chatMessages[chatroomId]) {
        state.chatMessages[chatroomId] = []
      }
      if (!state.chatPagination[chatroomId]) {
        state.chatPagination[chatroomId] = {
          page: 1,
          hasMore: true,
          loading: false,
        }
      } else {
        state.chatPagination[chatroomId].loading = false
      }
      messages.forEach((msg) => {
        state.messages[msg._id] = msg
        if (!state.chatMessages[chatroomId].includes(msg._id)) {
          state.chatMessages[chatroomId].unshift(msg._id)
        }
      })
    })
    // builder.addCase(leaveChatroomThunk.fulfilled, (state, action) => {
    //     const chatroomId = action.payload.chatroomId;
    //
    //     // Новый объект chatMessages, не содержащий chatroomId
    //     const updatedChatMessages = { ...state.chatMessages };
    //     delete updatedChatMessages[chatroomId]; // Удаляем чат для данного chatroomId
    //
    //     // Новый объект chatPagination, не содержащий chatroomId
    //     const updatedChatPagination = { ...state.chatPagination };
    //     delete updatedChatPagination[chatroomId]; // Удаляем пагинацию для данного chatroomId
    //
    //     // Новый объект messages, где мы удаляем сообщения для данного chatroomId
    //     const updatedMessages = { ...state.messages };
    //     const messageIds = state.chatMessages[chatroomId] || [];
    //     messageIds.forEach(id => {
    //         delete updatedMessages[id]; // Удаляем каждое сообщение
    //     });
    //
    //     // Обновляем состояние с новыми значениями
    //     state.chatMessages = updatedChatMessages;
    //     state.chatPagination = updatedChatPagination;
    //     state.messages = updatedMessages;
    // });
    // builder.addCase(sendMessage.fulfilled, (state, action) => {
    //         const { chatroomId } = action.payload;
    //         if (!state.chats[chatroomId]) {
    //             state.chats[chatroomId] = { messages: [], page: 1, hasMore: true, loading: false };
    //         }
    //         state.chats[chatroomId].messages.push(action.payload);
    //     })
    // builder.addCase(markAsRead.fulfilled, (state, action) => {
    //         const { chatroomId, userId } = action.payload;
    //         if (state.chats[chatroomId]) {
    //             state.chats[chatroomId].messages.forEach(msg => {
    //                 if (msg.user !== userId) {
    //                     msg.isRead = true;
    //                 }
    //             });
    //         }
    //     });
  },
})

export const messagesReducer = messagesSlice.reducer
export const {
  clearMessages,
  markMessagesAsRead,
  addMessage,
  deleteMessages,
  deleteMessage,
  editMessage,
} = messagesSlice.actions
