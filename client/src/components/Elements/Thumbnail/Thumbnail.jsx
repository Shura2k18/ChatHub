import classNames from "./Thumbnail.module.scss"
import { Play } from "lucide-react"

export const Thumbnail = (props) => {
  const url = props.local
    ? props.src
    : `${process.env.REACT_APP_SERVER_URL}${props.src}`
  return (
    <div className={classNames.container} onClick={props.onClick}>
      {props.src ? (
        <>
          <img src={url} />
          <div>
            <Play />
          </div>
        </>
      ) : (
        <p>Кликните, чтобы загрузить видео</p>
      )}
    </div>
  )
}
