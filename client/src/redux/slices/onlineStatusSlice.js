import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  data: [], // Массив ID пользователей, которые в сети
}

const onlineStatusSlice = createSlice({
  name: "onlineStatus",
  initialState,
  reducers: {
    setUserOnline: (state, action) => {
      const index = state.data.findIndex(
        (item) => item.userId === action.payload.userId,
      )
      if (index !== -1) {
        state.data[index].status = action.payload.status
      } else {
        state.data.push(action.payload)
      }
    },
    setUserOffline: (state, action) => {
      const index = state.data.findIndex(
        (item) => item.userId === action.payload.userId,
      )
      if (index !== -1) {
        state.data[index].status = action.payload.status
      } else {
        // Если пользователь не найден, можно добавить его с состоянием "offline"
        state.data.push(action.payload)
      }
    },
    clearOnlineUsers: (state, action) => {
      state.data = []
    },
  },
})

export const onlineStatusReducer = onlineStatusSlice.reducer
export const { setUserOnline, setUserOffline, clearOnlineUsers } =
  onlineStatusSlice.actions
