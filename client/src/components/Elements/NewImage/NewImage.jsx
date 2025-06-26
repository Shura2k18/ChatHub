import "./NewImage.scss"
import { Field } from "formik"
import { UploadPhoto } from "./UploadPhoto/UploadPhoto"
import { useEffect, useState } from "react"
import { CSSTransition } from "react-transition-group"
import { ImageViewer } from "../ImageViewer/ImageViewer"

export const NewImage = (props) => {
  const [preview, setPreview] = useState(props.defaultIMG)
  const [isMediaViewerActive, setIsMediaViewerActive] = useState(false)

  useEffect(() => {
    setPreview(props.defaultIMG)
  }, [props.defaultIMG])

  return (
    <>
      <div className="newImage">
        <img
          src={preview}
          alt="a"
          onClick={() => setIsMediaViewerActive(true)}
        />
        <Field
          name={props.name}
          component={UploadPhoto}
          setPreview={setPreview}
          errors={props.errors}
          defaultIMG={props.defaultIMG}
        />
      </div>
      <CSSTransition
        in={isMediaViewerActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <ImageViewer
          setIsMediaViewerActive={setIsMediaViewerActive}
          type={"img"}
          fileURL={preview}
        />
      </CSSTransition>
    </>
  )
}
