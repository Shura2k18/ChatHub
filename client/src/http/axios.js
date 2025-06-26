import axios from "axios"

const instance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  // baseURL: "/api/",
})
console.log(process.env.REACT_APP_SERVER_URL)
console.log(instance.defaults.baseURL)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") // Получаем актуальный токен
    if (token) {
      config.headers.Authorization = `Bearer ${token}` // Обновляем заголовок
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default instance
