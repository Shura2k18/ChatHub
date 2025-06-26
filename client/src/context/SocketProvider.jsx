import React, { createContext, useState, useMemo } from "react"
import { io } from "socket.io-client"

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Функция для инициализации соединения
  const initSocket = useMemo(
    () => ({
      connect: () => {
        if (socketInstance) return socketInstance

        const token = localStorage.getItem("token")
        if (!token) return null

        const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
          withCredentials: true,
          reconnection: true,
          query: { token },
        })

        newSocket.on("connect", () => {
          setIsConnected(true)
          console.log("Connected")
        })
        newSocket.on("disconnect", () => {
          setIsConnected(false)
          console.log("Connected")
        })

        setSocketInstance(newSocket)
        return newSocket
      },
      disconnect: () => {
        if (socketInstance) {
          socketInstance.disconnect()
          setSocketInstance(null)
          setIsConnected(false)
        }
      },
    }),
    [socketInstance],
  )

  const contextValue = useMemo(
    () => ({
      socket: socketInstance,
      isConnected,
      initSocket,
    }),
    [socketInstance, isConnected, initSocket],
  )

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}
