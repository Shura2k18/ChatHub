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

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    addMember: (state, action) => {
      state.data.push(action.payload)
    },
    clearMembers: (state, action) => {
      state.data = []
      state.loading = true
    },
    // updateUnreadCounts: (state, action) => {
    //   const { chatroomId, unreadCounts } = action.payload
    //   state.data = state.data.map((member) => {
    //     const unreadData = unreadCounts.find((u) => u._id === member._id)
    //     return {
    //       ...member,
    //       unreadCount: unreadData ? unreadData.unreadCount : member.unreadCount,
    //     }
    //   })
    // },
    // onlineMember: (state, action) => {
    //     const {roomId, userId } = action.payload
    //     state.data.forEach((member, index) => {
    //         if (member.user._id === userId && member.chatroomId === roomId) {
    //             state.data[index] = { ...member, isOnline: true }
    //         }
    //     });
    // }
    updateMember: (state, action) => {
      const { userId, data } = action.payload
      state.data.forEach((member) =>
        member.user._id === userId
          ? (member.user = { ...member.user, ...data })
          : null,
      )
    },
    deleteMember: (state, action) => {
      state.data = state.data.filter(
        (member) =>
          member.user._id !== action.payload.userId &&
          member.chatroomId !== action.payload.chatroomId,
      )
    },
    deleteMembers: (state, action) => {
      state.data = state.data.filter(
        (member) => member.chatroomId !== action.payload.chatroomId,
      )
    },
    updateTypingStatus: (state, action) => {
      const { chatroomId, userId, isTyping } = action.payload
      state.data.forEach((member) => {
        if (member.user._id === userId && member.chatroomId === chatroomId) {
          member.isTyping = isTyping
        }
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChatroomsThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(fetchChatroomsThunk.fulfilled, (state, action) => {
      state.data = action.payload.flatMap((item) => item.members) // Добавляем всех участников групп
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
      action.payload.members.forEach((item) => state.data.push(item))
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

export const membersReducer = membersSlice.reducer
export const {
  addMember,
  clearMembers,
  onlineMember,
  updateMember,
  updateUnreadCounts,
  deleteMember,
  deleteMembers,
  updateTypingStatus,
} = membersSlice.actions
