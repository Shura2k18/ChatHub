import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSocket } from "./useSocket"
import { fetchChatroomThunk } from "../redux/slices/thunks/chatroomsThunks"
import {
  deleteChatroom,
  updateChatroomOnNewMessage,
  updateUnreadCounts,
} from "../redux/slices/chatroomsSlice"
import {
  deleteMember,
  deleteMembers,
  updateTypingStatus,
} from "../redux/slices/membersSlice"
import {
  addMessage,
  deleteMessage,
  deleteMessages,
  editMessage,
  markMessagesAsRead,
} from "../redux/slices/messagesSlice"

export const useSocketChatEvents = () => {
  const { socket, isConnected } = useSocket()
  const dispatch = useDispatch()
  const me = useSelector((state) => state.user.data)
  const chatrooms = useSelector((state) => state.chatrooms.data)
  const connectedRoomsRef = useRef(new Set())

  // === 1. Регистрируем обработчики событий чата ===
  useEffect(() => {
    if (!socket || !isConnected || !me?._id) return

    const handlers = {
      newChatroom: ({ roomId }) => {
        dispatch(fetchChatroomThunk(roomId))
        socket.emit("connectToChatroom", roomId)
      },
      deleteChatroom: ({ chatroomId }) => {
        dispatch(deleteChatroom(chatroomId))
        dispatch(deleteMembers(chatroomId))
        dispatch(deleteMessages(chatroomId))
        socket.emit("leaveRoom", chatroomId)
      },
      leaveChatroom: ({ chatroomId, userId }) => {
        if (userId === me._id) {
          socket.emit("leaveRoom", { chatroomId, userId })
          dispatch(deleteChatroom(chatroomId))
          dispatch(deleteMembers(chatroomId))
          dispatch(deleteMessages(chatroomId))
        } else {
          dispatch(deleteMember({ userId, chatroomId }))
        }
      },
      newMessage: ({ chatroomId, message, unreadCounts, userId }) => {
        dispatch(addMessage({ chatroomId, message }))
        if (me._id !== userId) {
          const unread = unreadCounts.find((u) => u.user === me._id)
          dispatch(updateUnreadCounts({ chatroomId, unreadCounts: unread }))
        }
        dispatch(
          updateChatroomOnNewMessage({
            chatroomId,
            updatedAt: new Date().toISOString(),
          }),
        )
      },
      deleteMessage: ({ chatroomId, messageId, messageType }) => {
        dispatch(deleteMessage({ chatroomId, messageId, messageType }))
      },
      editMessage: ({ messageId, content }) => {
        dispatch(editMessage({ messageId, content }))
      },
      messagesRead: ({ chatroomId, userId, unreadCounts }) => {
        if (userId === me._id) {
          const unread = unreadCounts.find((u) => u.user === me._id)
          dispatch(updateUnreadCounts({ chatroomId, unreadCounts: unread }))
        }
        dispatch(markMessagesAsRead({ chatroomId, userId }))
      },
      updateTypingStatus: ({ chatroomId, isTyping, userId }) => {
        dispatch(updateTypingStatus({ chatroomId, isTyping, userId }))
      }
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    return () => {
      Object.keys(handlers).forEach((event) => {
        socket.off(event)
      })
    }
  }, [socket, isConnected, me?._id, dispatch])

  useEffect(() => {
    if (!socket || !isConnected || !me?._id) return

    chatrooms.forEach((room) => {
      if (!connectedRoomsRef.current.has(room._id)) {
        socket.emit("connectToChatroom", room._id)
        connectedRoomsRef.current.add(room._id)
      }
    })
  }, [socket, isConnected, me?._id, chatrooms])
}
