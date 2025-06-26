import { useState, useRef, useEffect, useCallback } from "react"
import { useSocket } from "./useSocket"

export const useVideoCall = (remoteUserId) => {
  const { socket } = useSocket()

  const [callState, setCallState] = useState("idle")
  const [error, setError] = useState(null)
  const [pendingOffer, setPendingOffer] = useState(null)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnection = useRef(null)
  const localStream = useRef(null)
  const remoteStream = useRef(new MediaStream())
  const pendingIceCandidates = useRef([])

  // Инициализация медиапотока
  const initLocalStream = useCallback(async () => {
    try {
      if (localStream.current?.active) return localStream.current

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      localStream.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current
          .play()
          .catch((e) => console.log("Local video play:", e))
      }

      return stream
    } catch (err) {
      console.error("Media error:", err)
      setError("Camera/microphone access denied")
      throw err
    }
  }, [])

  // Очистка
  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    remoteStream.current = new MediaStream()
    pendingIceCandidates.current = []
  }, [])

  // Полная очистка
  const fullCleanup = useCallback(() => {
    cleanup()
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop())
      localStream.current = null
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
  }, [cleanup])

  // Завершение звонка
  const endCall = useCallback(() => {
    if (callState === "ended") return

    socket.emit("rtc:end-call", { to: remoteUserId })
    fullCleanup()
    setCallState("ended")

    setTimeout(() => setCallState("idle"), 1000)
  }, [callState, socket, remoteUserId, fullCleanup])

  // Создание PeerConnection
  const createPeerConnection = useCallback(async () => {
    if (peerConnection.current) {
      peerConnection.current.close()
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
    })

    // Добавляем локальные треки
    const stream = await initLocalStream()
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream)
    })

    // Обработка удаленного потока
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.current.addTrack(track)
      })

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream.current
        remoteVideoRef.current
          .play()
          .catch((e) => console.log("Remote video play:", e))
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("rtc:ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        })
      }
    }

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        endCall()
      }
    }

    peerConnection.current = pc
    return pc
  }, [initLocalStream, remoteUserId, socket, endCall])

  // Инициирование звонка
  const startCall = useCallback(async () => {
    try {
      setCallState("calling")
      setError(null)

      const pc = await createPeerConnection()
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socket.emit("rtc:offer", {
        to: remoteUserId,
        offer,
      })
    } catch (err) {
      console.error("Call error:", err)
      setError("Call failed")
      fullCleanup()
      setCallState("ended")
    }
  }, [createPeerConnection, remoteUserId, socket, fullCleanup])

  // Принятие звонка
  const acceptCall = useCallback(async () => {
    if (!pendingOffer) return

    try {
      setCallState("in_call")
      const pc = await createPeerConnection()

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      socket.emit("rtc:answer", {
        to: remoteUserId,
        answer,
      })

      pendingIceCandidates.current.forEach((candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error)
      })
      pendingIceCandidates.current = []
    } catch (err) {
      console.error("Accept error:", err)
      setError("Accept failed")
      fullCleanup()
      setCallState("ended")
    }
  }, [pendingOffer, createPeerConnection, remoteUserId, socket, fullCleanup])

  // Обработка входящего звонка
  const handleIncomingCall = useCallback(
    ({ from, offer }) => {
      if (from !== remoteUserId || callState !== "idle") return
      setPendingOffer(offer)
      setCallState("incoming")
    },
    [remoteUserId, callState],
  )

  // Обработка ответа
  const handleAnswer = useCallback(
    async ({ from, answer }) => {
      if (from !== remoteUserId || !peerConnection.current) return

      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        )
        setCallState("in_call")
      } catch (err) {
        console.error("Answer error:", err)
        fullCleanup()
        setCallState("ended")
      }
    },
    [remoteUserId, fullCleanup],
  )

  // Обработка ICE кандидатов
  const handleIceCandidate = useCallback(
    async ({ from, candidate }) => {
      if (from !== remoteUserId) {
        pendingIceCandidates.current.push(candidate)
        return
      }

      try {
        if (peerConnection.current?.remoteDescription) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          )
        } else {
          pendingIceCandidates.current.push(candidate)
        }
      } catch (err) {
        console.error("ICE error:", err)
      }
    },
    [remoteUserId],
  )

  // Подписка на события
  useEffect(() => {
    if (!socket) return

    socket.on("rtc:offer", handleIncomingCall)
    socket.on("rtc:answer", handleAnswer)
    socket.on("rtc:ice-candidate", handleIceCandidate)
    socket.on("rtc:end-call", endCall)

    return () => {
      socket.off("rtc:offer", handleIncomingCall)
      socket.off("rtc:answer", handleAnswer)
      socket.off("rtc:ice-candidate", handleIceCandidate)
      socket.off("rtc:end-call", endCall)
      fullCleanup()
    }
  }, [
    socket,
    handleIncomingCall,
    handleAnswer,
    handleIceCandidate,
    endCall,
    fullCleanup,
  ])

  return {
    startCall,
    endCall,
    acceptCall,
    callState,
    error,
    localVideoRef,
    remoteVideoRef,
  }
}
