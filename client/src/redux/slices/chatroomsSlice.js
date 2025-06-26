import { createSlice } from "@reduxjs/toolkit"
import {
  createChatroomThunk,
  fetchChatroomThunk,
  fetchChatroomsThunk,
  leaveChatroomThunk,
} from "./thunks/chatroomsThunks"

const initialState = {
  data: [],
  loading: true,
  err: null,
}

const chatroomsSlice = createSlice({
  name: "chatrooms",
  initialState,
  reducers: {
    addChatroom: (state, action) => {
      state.data.push(action.payload)
    },
    clearChatrooms: (state, action) => {
      state.data = []
      state.loading = true
    },
    updateChatroomOnNewMessage: (state, action) => {
      const { chatroomId, updatedAt } = action.payload
      const chatIndex = state.data.findIndex((chat) => chat._id === chatroomId)
      if (chatIndex !== -1) {
        state.data[chatIndex].updatedAt = updatedAt
      }
      state.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    },
    deleteChatroom: (state, action) => {
      state.data = state.data.filter((chat) => chat._id !== action.payload)
    },
    updateUnreadCounts: (state, action) => {
      const { chatroomId, unreadCounts } = action.payload
      const chatroom = state.data.find(
        (chatroom) => chatroom._id === chatroomId,
      )
      if (chatroom) {
        chatroom.unreadCount = unreadCounts.unreadCount
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChatroomsThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(fetchChatroomsThunk.fulfilled, (state, action) => {
      state.data = action.payload
        .map((item) => item.chat)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Добавляем только чаты
      state.loading = false
    })
    builder.addCase(fetchChatroomsThunk.rejected, (state, action) => {
      state.err = action.payload
      state.loading = false
    })
    builder.addCase(fetchChatroomThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(fetchChatroomThunk.fulfilled, (state, action) => {
      state.data.push(action.payload.chatroom)
      state.loading = false
    })
    builder.addCase(fetchChatroomThunk.rejected, (state, action) => {
      state.err = action.payload
      state.loading = false
    })
    builder.addCase(createChatroomThunk.rejected, (state, action) => {
      state.err = action.payload
      state.loading = false
    })
    builder.addCase(leaveChatroomThunk.rejected, (state, action) => {
      state.err = action.payload
      state.loading = false
    })
  },
})

export const chatroomsReducer = chatroomsSlice.reducer
export const {
  addChatroom,
  clearChatrooms,
  updateChatroomOnNewMessage,
  deleteChatroom,
  updateUnreadCounts,
} = chatroomsSlice.actions
