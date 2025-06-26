import { useEffect, useRef, useState } from "react"
import shaka from "shaka-player"
import classNames from "./ShakaVideoPlayer.module.scss"
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  FastForward,
  Rewind,
  Expand,
  Minimize,
  Settings,
} from "lucide-react"
import { RightClickMenu } from "../RightClickMenu/RightClickMenu"
import { CSSTransition } from "react-transition-group"
import { Thumbnail } from "../Thumbnail/Thumbnail"

export const ShakaVideoPlayer = (props) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(
    +window.localStorage.getItem("volume") || 0.5,
  )
  const [speed, setSpeed] = useState(1)
  const [qualities, setQualities] = useState([])
  const [selectedQuality, setSelectedQuality] = useState(null)
  const [isLoaded, setIsLoaded] = useState(props.autoPlay || false)
  const [progress, setProgress] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const clickedElementRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const controlsTimeout = useRef(null)
  const [controlsHeight, setControlsHeight] = useState(0)

  useEffect(() => {
    if (!isLoaded) return
    const video = videoRef.current
    const player = new shaka.Player(video)
    playerRef.current = player

    if (!shaka.Player.isBrowserSupported()) {
      console.error("Shaka Player не поддерживается в этом браузере.")
      return
    }

    player
      .load(props.src)
      .then(() => {
        const tracks = player.getVariantTracks()
        if (tracks.length > 1) {
          setQualities(tracks.map((t) => ({ id: t.id, label: `${t.height}p` })))
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки видео:", error)
      })

    return () => {
      player.destroy()
    }
  }, [props.src, isLoaded])

  // const generateThumbnail = async () => {
  //   try {
  //     const response = await fetch(props.src)
  //     const blob = await response.blob()
  //     const url = URL.createObjectURL(blob)
  //
  //     const video = document.createElement("video")
  //     video.src = url
  //     video.crossOrigin = "anonymous"
  //     video.muted = true
  //     video.currentTime = 2
  //
  //     video.addEventListener("seeked", () => {
  //       const canvas = document.createElement("canvas")
  //       canvas.width = video.videoWidth / 2
  //       canvas.height = video.videoHeight / 2
  //       const ctx = canvas.getContext("2d")
  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  //       setThumbnail(canvas.toDataURL("image/png"))
  //       URL.revokeObjectURL(url)
  //     })
  //
  //     video.load()
  //   } catch (error) {
  //     console.error("Ошибка генерации эскиза:", error)
  //   }
  // }
  //
  // useEffect(() => {
  //   generateThumbnail()
  // }, [props.src])

  const handleActivate = () => {
    setIsLoaded(true)

    if (videoRef.current) {
      playerRef.current = new shaka.Player(videoRef.current)

      playerRef.current.addEventListener("error", (event) => {
        console.error("Ошибка Shaka Player:", event.detail)
      })

      playerRef.current.load(props.src).then(() => {
        const tracks = playerRef.current.getVariantTracks()
        setQualities(tracks)
        setSelectedQuality(tracks[0]?.id)
      })
    }
  }

  const volumeButton = () => {
    if (isMuted) {
      return <VolumeX />
    } else if (volume < 0.5 && volume > 0) {
      return <Volume1 />
    } else {
      return <Volume2 />
    }
  }

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
    setVolume(0)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    window.localStorage.setItem("volume", newVolume)
    setIsMuted(newVolume === 0)
  }

  const skip = (time) => {
    videoRef.current.currentTime += time
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.parentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    // Обработчик события для нажатия клавиш
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        event.preventDefault()
        toggleFullscreen() // Закрытие полноэкранного режима по ESC
      } else if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault()
        togglePlay() // Включение/выключение видео по пробелу
      } else if (event.key === "ArrowLeft") {
        skip(-5) // Перемотка на 5 секунд назад при нажатии на стрелку влево
      } else if (event.key === "ArrowRight") {
        skip(5) // Перемотка на 5 секунд вперед при нажатии на стрелку вправо
      }
    }

    // Добавляем обработчик нажатия клавиш
    document.addEventListener("keydown", handleKeyDown)

    // Убираем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen])

  const changeSpeed = (e) => {
    const newSpeed = parseFloat(e.target.value)
    videoRef.current.playbackRate = newSpeed
    setSpeed(newSpeed)
  }

  const changeQuality = (qualityId) => {
    if (!playerRef.current) return
    playerRef.current.selectVariantTrack(
      playerRef.current.getVariantTracks().find((t) => t.id === qualityId),
      true,
    )
    setSelectedQuality(qualityId)
  }

  const handleProgress = () => {
    setCurrentTime(videoRef.current.currentTime)
    const newProgress =
      (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(newProgress)
    if (newProgress >= 100) setIsPlaying(false)
  }

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration)
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    setIsSettingsOpen(true)
    clickedElementRef.current = event.target
    document.activeElement.blur()
    document.body.focus()
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleMouseMove = () => {
    // Показываем элементы управления при движении мыши
    if (!isFullscreen) return // Только в полноэкранном режиме

    setIsControlsVisible(true)

    // Сбросить таймер, если пользователь двигает мышь
    clearTimeout(controlsTimeout.current)

    // Установить новый таймер на 3 секунды
    controlsTimeout.current = setTimeout(() => {
      setIsControlsVisible(false) // Скрыть контролы через 3 секунды бездействия
    }, 3000)
  }

  // Сбрасываем таймер при выходе из полноэкранного режима
  useEffect(() => {
    // Скрыть элементы управления, когда мы выходим из полноэкранного режима
    if (!isFullscreen) {
      setIsControlsVisible(true)
      clearTimeout(controlsTimeout.current)
    }
  }, [isFullscreen])

  const handleDoubleClick = () => {
    if (isFullscreen) {
      // Если видео в полноэкранном режиме, выходим из него
      document.exitFullscreen()
      setIsFullscreen(false)
    } else {
      // Если видео не в полноэкранном режиме, включаем его
      toggleFullscreen()
    }
  }

  useEffect(() => {
    const controlsContainer = document.getElementById("controlsContainer")
    if (controlsContainer) {
      setControlsHeight(controlsContainer.offsetHeight)
    }
  }, [controlsHeight, isLoaded])

  return (
    <div
      className={`${classNames.videoContainer} ${isFullscreen ? classNames.fullscreen : ""}`}
      onMouseMove={handleMouseMove}
    >
      {!isLoaded ? (
        <Thumbnail src={props.thumbnail} onClick={handleActivate} />
      ) : (
        <>
          <video
            ref={videoRef}
            className={classNames.videoPlayer}
            onTimeUpdate={handleProgress}
            onLoadedMetadata={handleLoadedMetadata}
            autoPlay
            onClick={isControlsVisible && togglePlay} // пауза при клике на видео
            onDoubleClick={handleDoubleClick} // Добавляем событие для двойного щелчка
            style={{
              height: `calc(100% - ${controlsHeight}px)`,
            }}
          />
          {!isPlaying && (
            <div
              className={classNames.play}
              onClick={isControlsVisible && togglePlay}
              onDoubleClick={handleDoubleClick}
            >
              <Play />
            </div>
          )}
          <div
            className={classNames.left}
            onClick={isControlsVisible && togglePlay}
            onDoubleClick={() => skip(-5)}
          />
          <div
            className={classNames.center}
            onClick={isControlsVisible && togglePlay}
            onDoubleClick={handleDoubleClick}
          />
          <div
            className={classNames.right}
            onClick={isControlsVisible && togglePlay}
            onDoubleClick={() => skip(5)}
          />
          <div
            className={`${classNames.controlsContainer} ${isControlsVisible ? classNames.visible : classNames.hidden}`}
            id={"controlsContainer"}
          >
            <div className={classNames.controls}>
              <button onClick={togglePlay}>
                {isPlaying ? <Pause /> : <Play />}
              </button>
              <div className={classNames.timeDisplay}>
                <span>{formatTime(currentTime)}</span>
                <span> / </span>
                <span>{formatTime(duration)}</span>
              </div>
              <button onClick={() => skip(-5)}>
                <Rewind />
              </button>
              <button onClick={() => skip(5)}>
                <FastForward />
              </button>

              {/* Полоса звука появляется при наведении */}
              <div className={classNames.volumeControl}>
                <button
                  onClick={toggleMute}
                  className={classNames.volumeButton}
                >
                  {volumeButton()}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  style={{ "--progress": volume }}
                  onChange={handleVolumeChange}
                  className={classNames.volumeSlider}
                />
              </div>

              {/* Подменю настроек */}
              <button
                onClick={(e) => handleContextMenu(e)}
                className={classNames.settings}
              >
                <Settings />
                <CSSTransition
                  in={isSettingsOpen}
                  unmountOnExit
                  timeout={150}
                  classNames="fade"
                >
                  <RightClickMenu
                    setMenuVisible={setIsSettingsOpen}
                    top={-50}
                    left={-80}
                    //position="fixed"
                    menuVisible={isSettingsOpen}
                    clickedElementRef={clickedElementRef}
                  >
                    <div>
                      <label>Скорость:</label>
                      <select onChange={changeSpeed} value={speed}>
                        {[0.5, 1, 1.5, 2].map((s) => (
                          <option key={s} value={s}>
                            {s}x
                          </option>
                        ))}
                      </select>
                    </div>

                    {qualities.length > 0 && (
                      <div>
                        <label>Качество:</label>
                        <select
                          onChange={(e) =>
                            changeQuality(Number(e.target.value))
                          }
                          value={selectedQuality || ""}
                        >
                          {qualities.map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </RightClickMenu>
                </CSSTransition>
              </button>

              <button onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize /> : <Expand />}
              </button>
            </div>

            {/* Полоса прокрутки на всю ширину */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                videoRef.current.currentTime =
                  (e.target.value / 100) * videoRef.current.duration
              }}
              className={classNames.progressBar}
              style={{ "--progress": `${progress}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}
