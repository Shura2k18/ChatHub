import { useEffect } from "react"
import styles from "./VideoCallComponent.module.scss"

export const VideoCallComponent = ({
  localVideoRef,
  remoteVideoRef,
  startCall,
  endCall,
  acceptCall,
  callState,
  error,
}) => {
  // Автовоспроизведение видео
  useEffect(() => {
    const playVideos = () => {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current
          .play()
          .catch((e) => console.log("Local play error:", e))
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current
          .play()
          .catch((e) => console.log("Remote play error:", e))
      }
    }

    playVideos()
    const interval = setInterval(playVideos, 1000)
    return () => clearInterval(interval)
  }, [callState])

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.videoContainer}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={styles.remoteVideo}
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={styles.localVideo}
        />
      </div>

      <div className={styles.controls}>
        {(callState === "idle" || callState === "ended") && (
          <button onClick={startCall} className={styles.callButton}>
            Start Call
          </button>
        )}

        {callState === "incoming" && (
          <div className={styles.incomingControls}>
            <button onClick={acceptCall} className={styles.acceptButton}>
              Accept
            </button>
            <button onClick={endCall} className={styles.rejectButton}>
              Reject
            </button>
          </div>
        )}

        {(callState === "calling" || callState === "in_call") && (
          <button onClick={endCall} className={styles.endButton}>
            End Call
          </button>
        )}
      </div>
    </div>
  )
}
