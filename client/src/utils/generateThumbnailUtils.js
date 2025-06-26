export const generateThumbnail = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.src = URL.createObjectURL(videoFile)
    video.crossOrigin = "anonymous"
    video.currentTime = 1
    video.muted = true
    video.play()

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob), "image/jpeg")
      video.pause()
    }

    video.onerror = reject
  })
}
