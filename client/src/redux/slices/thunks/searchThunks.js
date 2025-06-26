import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../../../http/axios"

export const searchUsersThunk = createAsyncThunk(
  "search/searchUsersThunk",
  async (text, thunkAPI) => {
    try {
      const { data } = await axios.get(`user/findUsers/${text}`)
      if (!data) {
        throw new Error("Некорректный ответ от сервера")
      }
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message)
    }
  },
)
export const searchChatroomsThunk = createAsyncThunk(
  "search/searchChatroomsThunk",
  async (text, thunkAPI) => {
    try {
      const { data } = await axios.get(`chatroom/findRooms/${text}`)
      if (!data) {
        throw new Error("Некорректный ответ от сервера")
      }
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message)
    }
  },
)
