import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSocket } from "./useSocket"
import { updateMember } from "../redux/slices/membersSlice"
import {
  addContact,
  deleteContact,
  updateContact,
} from "../redux/slices/contactsSlice"
import { updateMe } from "../redux/slices/userSlice"

export const useSocketUserEvents = () => {
  const { socket, isConnected } = useSocket()
  const dispatch = useDispatch()
  const me = useSelector((state) => state.user.data)

  useEffect(() => {
    if (!socket || !isConnected || !me?._id) return

    const handlers = {
      newUserData: ({ userId, data }) => {
        if (userId !== me._id) {
          dispatch(updateMember({ userId, data }))
          dispatch(updateContact({ userId, data }))
        }
      },
      updateMyData: ({ data }) => dispatch(updateMe({ data })),
      deleteContact: ({ contactId }) => dispatch(deleteContact(contactId)),
      addContact: ({ contact }) => dispatch(addContact(contact)),
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
}
