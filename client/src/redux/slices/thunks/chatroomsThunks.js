import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../../../http/axios"
import { clearChatrooms, deleteChatroom } from "../chatroomsSlice"
import { clearMembers, deleteMembers } from "../membersSlice"
import { deleteMessages } from "../messagesSlice"

export const fetchChatroomsThunk = createAsyncThunk(
  "chatrooms/fetchChatrooms",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get("chatroom/getRooms")
      if (!data) {
        throw new Error("Некорректный ответ от сервера")
      }
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response.data.message || "Ошибка изменения данных",
      )
    }
  },
)
export const fetchChatroomThunk = createAsyncThunk(
  "chatrooms/fetchChatroom",
  async (roomId, thunkAPI) => {
    try {
      const { data } = await axios.get(`chatroom/getRoom/${roomId}`)
      if (!data) {
        throw new Error("Некорректный ответ от сервера")
      }
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response.data.message || "Ошибка изменения данных",
      )
    }
  },
)
export const createChatroomThunk = createAsyncThunk(
  "chatrooms/createChatroom",
  async (formData, thunkAPI) => {
    try {
      await axios.post("chatroom/createRoom", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      // if (!data) {
      //   throw new Error("Некорректный ответ от сервера")
      // }
      // return data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response.data.message || "Ошибка изменения данных",
      )
    }
  },
)
export const leaveChatroomThunk = createAsyncThunk(
  "chatrooms/leaveChatroom",
  async (chatroomId, thunkAPI) => {
    try {
      await axios.post("chatroom/leaveRoom", { chatroomId })
    } catch (err) {
      console.log(err)
      return thunkAPI.rejectWithValue(
        err.response.data.message || "Ошибка изменения данных",
      )
    }
  },
)
export const deleteChatroomThunk = createAsyncThunk(
  "chatrooms/deleteChatroom",
  async (chatroomId, thunkAPI) => {
    try {
      await axios.delete("chatroom/deleteRoom", { data: { chatroomId } })
    } catch (err) {
      console.log(err)
      return thunkAPI.rejectWithValue(
        err.response.data.message || "Ошибка изменения данных",
      )
    }
  },
)
