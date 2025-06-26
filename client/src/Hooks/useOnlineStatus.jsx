import { useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSocket } from "./useSocket"
import {
  setUserOffline,
  setUserOnline,
} from "../redux/slices/onlineStatusSlice"

export const useOnlineStatus = () => {
  const { socket, isConnected } = useSocket()
  const dispatch = useDispatch()
  const contacts = useSelector((state) => state.contacts.data)
  const members = useSelector((state) => state.members.data)

  // Общий обработчик статусов
  const handleStatusUpdate = useCallback(
    (data) => {
      dispatch(
        data.status === "online" ? setUserOnline(data) : setUserOffline(data),
      )
      console.log(`User ${data.userId} is now ${data.status}`)
    },
    [dispatch],
  )

  // Подписка на события статусов
  useEffect(() => {
    if (!socket || !isConnected) return

    socket.on("updateStatus", handleStatusUpdate)
    socket.on("userStatusResponse", handleStatusUpdate)

    return () => {
      socket.off("updateStatus", handleStatusUpdate)
      socket.off("userStatusResponse", handleStatusUpdate)
    }
  }, [socket, isConnected, handleStatusUpdate])

  // Проверка статусов контактов (автоматическая)
  useEffect(() => {
    if (!socket || !isConnected) return

    const users = [
      ...new Set([
        ...contacts.map((c) => c._id),
        ...members.map((m) => m.user._id),
      ]),
    ]

    const checkStatus = () =>
      users.forEach((id) => {
        socket.emit("checkUserStatus", id)
      })

    checkStatus()
    // const interval = setInterval(checkStatus, 30000)
    //
    // return () => clearInterval(interval)
  }, [socket, isConnected, contacts, members])

  // Функция для ручной проверки конкретного пользователя
  const checkUserStatus = useCallback(
    (userId) => {
      if (!socket || !isConnected) return

      socket.emit("checkUserStatus", userId)
    },
    [socket, isConnected],
  )

  return { checkUserStatus } // Экспортируем функцию для использования
}
