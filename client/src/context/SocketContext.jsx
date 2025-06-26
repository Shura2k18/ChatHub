import React, { createContext, useEffect, useMemo, useState } from "react"
import { io } from "socket.io-client"
import { useDispatch, useSelector } from "react-redux"
import {
  deleteMember,
  deleteMembers,
  updateMember,
  updateTypingStatus,
} from "../redux/slices/membersSlice"
import {
  addContact,
  deleteContact,
  updateContact,
} from "../redux/slices/contactsSlice"
import { updateMe } from "../redux/slices/userSlice"
import { fetchChatroomThunk } from "../redux/slices/thunks/chatroomsThunks"
import {
  deleteMessage,
  deleteMessages,
  editMessage,
  markMessagesAsRead,
} from "../redux/slices/messagesSlice"
import { addMessage } from "../redux/slices/messagesSlice"
import {
  deleteChatroom,
  updateChatroomOnNewMessage,
  updateUnreadCounts,
} from "../redux/slices/chatroomsSlice"
import StatusProvider from "../Providers/StatusProvider"

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch()
  const me = useSelector((state) => state.user.data)
  const chatrooms = useSelector((state) => state.chatrooms.data)
  const [connectedRooms, setConnectedRooms] = useState(new Set())
  const [isConnected, setIsConnected] = useState(false)

  // Создаем socket только 1 раз
  const socket = useMemo(() => {
    const token = localStorage.getItem("token")
    if (!token) return null

    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      query: { token },
    })

    newSocket.on("connect", () => {
      console.log("Connected")
      setIsConnected(true)
    })
    newSocket.on("connect_error", (err) => {
      console.error("Connect error:", err)
      setIsConnected(false)
    })
    newSocket.on("disconnect", () => {
      console.log("Disconnected")
      setIsConnected(false)
    })

    return newSocket
  }, [])

  // Обработчики событий
  useEffect(() => {
    if (!socket || !me._id) return

    const handleNewUserData = ({ userId, data }) => {
      console.log(`${userId} ... ${me._id}`)
      if (userId !== me._id) {
        dispatch(updateMember({ userId, data }))
        dispatch(updateContact({ userId, data }))
      }
    }

    const handleUpdateMyData = ({ data }) => {
      dispatch(updateMe({ data }))
    }

    const handleDeleteContact = ({ contactId }) => {
      dispatch(deleteContact(contactId))
    }

    const handleAddContact = ({ contact }) => {
      dispatch(addContact(contact))
    }

    socket.off("newUserData").on("newUserData", handleNewUserData)
    socket.off("updateMyData").on("updateMyData", handleUpdateMyData)
    socket.off("deleteContact").on("deleteContact", handleDeleteContact)
    socket.off("addContact").on("addContact", handleAddContact)

    return () => {
      socket.off("newUserData", handleNewUserData)
      socket.off("updateMyData", handleUpdateMyData)
      socket.off("deleteContact", handleDeleteContact)
      socket.off("addContact", handleAddContact)
    }
  }, [socket, me._id, dispatch])

  // Подключение к чатам
  useEffect(() => {
    if (!socket || !me._id) return

    chatrooms.forEach((room) => {
      if (!connectedRooms.has(room._id)) {
        socket.emit("connectToChatroom", room._id)
        setConnectedRooms((prev) => new Set(prev).add(room._id))
      }
    })
  }, [chatrooms, socket, me._id])

  // Обработка событий чатов
  useEffect(() => {
    if (!socket || !me._id) return

    const handleNewChatroom = ({ roomId }) => {
      dispatch(fetchChatroomThunk(roomId))
      socket.emit("connectToChatroom", roomId)
    }

    const handleDeleteChatroom = ({ chatroomId }) => {
      dispatch(deleteChatroom(chatroomId))
      dispatch(deleteMembers(chatroomId))
      dispatch(deleteMessages(chatroomId))
      socket.emit("leaveRoom", chatroomId)
    }

    const handleLeaveChatroom = ({ chatroomId, userId }) => {
      if (userId === me._id) {
        socket.emit("leaveRoom", { chatroomId, userId })
        dispatch(deleteChatroom(chatroomId))
        dispatch(deleteMembers(chatroomId))
        dispatch(deleteMessages(chatroomId))
      } else {
        dispatch(deleteMember({ userId, chatroomId }))
      }
    }

    const handleNewMessage = ({
      chatroomId,
      message,
      unreadCounts,
      userId,
    }) => {
      dispatch(addMessage({ chatroomId, message }))
      const unread = unreadCounts.find((u) => u.user === me._id)
      if (me._id !== userId)
        dispatch(updateUnreadCounts({ chatroomId, unreadCounts: unread }))
      dispatch(
        updateChatroomOnNewMessage({
          chatroomId,
          updatedAt: new Date().toISOString(),
        }),
      )
    }

    const handleDeleteMessage = ({ chatroomId, messageId, messageType }) => {
      dispatch(deleteMessage({ chatroomId, messageId, messageType }))
    }

    const handleEditMessage = ({ messageId, content }) => {
      dispatch(editMessage({ messageId, content }))
    }

    const handleMessagesRead = ({ chatroomId, userId, unreadCounts }) => {
      if (userId === me._id) {
        const unread = unreadCounts.find((u) => u.user === me._id)
        dispatch(updateUnreadCounts({ chatroomId, unreadCounts: unread }))
      }
      dispatch(markMessagesAsRead({ chatroomId, userId }))
    }

    const handleUpdateTypingStatus = ({ chatroomId, isTyping, userId }) => {
      dispatch(updateTypingStatus({ chatroomId, isTyping, userId }))
    }

    socket.off("newChatroom").on("newChatroom", handleNewChatroom)
    socket.off("deleteChatroom").on("deleteChatroom", handleDeleteChatroom)
    socket.off("leaveChatroom").on("leaveChatroom", handleLeaveChatroom)
    socket.off("newMessage").on("newMessage", handleNewMessage)
    socket.off("deleteMessage").on("deleteMessage", handleDeleteMessage)
    socket.off("editMessage").on("editMessage", handleEditMessage)
    socket.off("messagesRead").on("messagesRead", handleMessagesRead)
    socket
      .off("updateTypingStatus")
      .on("updateTypingStatus", handleUpdateTypingStatus)

    return () => {
      socket.off("newChatroom", handleNewChatroom)
      socket.off("deleteChatroom", handleDeleteChatroom)
      socket.off("leaveChatroom", handleLeaveChatroom)
      socket.off("newMessage", handleNewMessage)
      socket.off("deleteMessage", handleDeleteMessage)
      socket.off("editMessage", handleEditMessage)
      socket.off("messagesRead", handleMessagesRead)
      socket.off("updateTypingStatus", handleUpdateTypingStatus)
    }
  }, [socket, dispatch, me._id])
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      <StatusProvider />
      {children}
    </SocketContext.Provider>
  )
}
