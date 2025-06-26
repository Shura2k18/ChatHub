import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../../../http/axios"

export const fetchAuthMe = createAsyncThunk("user/fetchAuthMe", async () => {
  const { data } = await axios.get("user/me")
  return data
})
export const loginThunk = createAsyncThunk(
  "user/loginThunk",
  async ({ email, password }, thunkAPI) => {
    try {
      const { data } = await axios.post("auth/login", { email, password })

      if (!data?.user) {
        throw new Error("Некорректный ответ от сервера")
      }
      localStorage.setItem("token", data.token.accessToken)
      return data.user
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Ошибка авторизации",
      )
    }
  },
)
export const registerThunk = createAsyncThunk(
  "user/registerThunk",
  async ({ email, password, name, phone, tag }, thunkAPI) => {
    try {
      const { data } = await axios.post("auth/reg", {
        email,
        password,
        name,
        phone,
        tag,
      })

      if (!data?.user) {
        throw new Error("Некорректный ответ от сервера")
      }
      localStorage.setItem("token", data.token.accessToken)
      return data.user
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Ошибка регистрации",
      )
    }
  },
)
export const editUserData = createAsyncThunk(
  "user/editUserDataThunk",
  async (value, thunkAPI) => {
    try {
      if (Object.keys(value)[0] !== "imageUrl") {
        await axios.patch("user/updateData", value)
      } else {
        const formData = new FormData()
        formData.append("imageUrl", value.imageUrl)
        await axios.patch("user/updateImage", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Ошибка изменения данных",
      )
    }
  },
)
