import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../../../http/axios"

export const fetchContactsThunk = createAsyncThunk(
  "contacts/fetchContacts",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get("user/getContacts")

      if (!data) {
        throw new Error("Некорректный ответ от сервера")
      }
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message)
    }
  },
)
export const deleteContactThunk = createAsyncThunk(
  "contacts/deleteContact",
  async (contactId, thunkAPI) => {
    try {
      await axios.delete("user/deleteContact", { data: { contactId } })
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message)
    }
  },
)
export const addContactThunk = createAsyncThunk(
  "contacts/addContact",
  async (contactId, thunkAPI) => {
    try {
      await axios.post("user/addContact", { contactId })
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message)
    }
  },
)
