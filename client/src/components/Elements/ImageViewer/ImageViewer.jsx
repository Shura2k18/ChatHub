import classNames from "./ImageViewer.module.scss"
import { Blackout } from "../Blackout/Blackout"
import { Close } from "../SVGComponents/SVGComponents"

export const ImageViewer = (props) => {
  return (
    <div className={classNames.mediaViewer}>
      <div className={classNames.content}>
        {props.type === "img" ? (
          <img src={props.fileURL} alt="a" />
        ) : (
          <video controls>
            <source src={props.fileURL} type="video/mp4" />
            <source src={props.fileURL} type="video/ogg" />
            <source src={props.fileURL} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <div
        className={classNames.svg}
        onClick={() => props.setIsMediaViewerActive(false)}
      >
        <Close />
      </div>
      <Blackout onClick={() => props.setIsMediaViewerActive(false)} />
    </div>
  )
}
