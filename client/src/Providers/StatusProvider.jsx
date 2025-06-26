import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  setUserOnline,
  setUserOffline,
} from "../redux/slices/onlineStatusSlice"
import { useSocket } from "../Hooks/useSocket"

const StatusProvider = () => {
  const { socket, isConnected } = useSocket()
  const socketRef = useRef(null) // Зберігаємо посилання на socket
  const initializedRef = useRef(false) // Запобігаємо повторним викликам
  const dispatch = useDispatch()
  const contacts = useSelector((state) => state.contacts)
  const members = useSelector((state) => state.members)

  useEffect(() => {
    if (!socket || socketRef.current === socket) return // Якщо сокет не змінився, виходимо
    socketRef.current = socket // Оновлюємо посилання

    socket.emit("setOnline")

    const handleStatusUpdate = (data) => {
      dispatch(
        data.status === "online" ? setUserOnline(data) : setUserOffline(data),
      )
      console.log(`User ${data.userId} is now ${data.status}`)
    }

    socket.off("updateStatus").on("updateStatus", handleStatusUpdate)

    return () => {
      socket.off("updateStatus", handleStatusUpdate)
    }
  }, [socket, dispatch, isConnected])

  useEffect(() => {
    // console.log(socket)
    // console.log(initializedRef.current)
    // console.log(contacts)
    // console.log(members)
    // console.log(isConnected)
    if (
      !socket ||
      initializedRef.current ||
      contacts.loading ||
      members.loading ||
      !isConnected
    )
      return

    const users = new Set([
      ...contacts.data.map((contact) => contact._id),
      ...members.data.map((member) => member.user._id),
    ])

    users.forEach((user) => {
      socket.emit("checkUserStatus", user)
    })

    const handleUserStatusResponse = (data) => {
      dispatch(
        data.status === "online" ? setUserOnline(data) : setUserOffline(data),
      )
      console.log(`User ${data.userId} is now ${data.status}`)
    }

    socket
      .off("userStatusResponse")
      .on("userStatusResponse", handleUserStatusResponse)

    initializedRef.current = true
  }, [
    socket,
    contacts.data,
    members.data,
    dispatch,
    contacts.status,
    members.status,
    isConnected,
  ])

  return null
}

export default StatusProvider
