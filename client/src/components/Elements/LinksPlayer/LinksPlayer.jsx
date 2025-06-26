import classNames from "./LinksPlayer.module.scss"
import ReactPlayer from "react-player"
import { Play } from "lucide-react"

export const LinksPlayer = (props) => {
  return (
    <div className={classNames.videoWrapper}>
      <ReactPlayer
        url={props.url}
        light
        width="100%" // Ширина 100% от контейнера
        height="100%" // Высота будет вычисляться пропорционально ширине
        className={classNames.reactPlayer}
        controls
        playing
        playIcon={<Play scale={1.8} />}
      />
    </div>
  )
}
