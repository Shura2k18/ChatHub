import classNames from "./UploadPhoto.module.scss"
import { CSSTransition } from "react-transition-group"
import { useRef, useState } from "react"
import { ConfirmAction } from "../../ConfirmAction/ConfirmAction"
import { Camera } from "../../SVGComponents/SVGComponents"

export const UploadPhoto = (props) => {
  const [confirmAction, setConfirmAction] = useState({
    isActive: false,
    img: null,
    err: null,
  })
  const [tempUrl, setTempUrl] = useState()
  const inputRef = useRef()

  const revertChanges = () => {
    props.setPreview(props.defaultIMG)
  }
  const acceptChanges = () => {
    props.setPreview(tempUrl)
  }

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0]
    if (file) {
      props.form.setFieldValue(props.field.name, file)
      if (["image/jpeg", "image/png"].includes(file.type)) {
        setTempUrl(URL.createObjectURL(file))
        setConfirmAction((state) => ({
          ...state,
          err: null,
          img: tempUrl,
          isActive: true,
        }))
      } else {
        revertChanges()
        setConfirmAction((state) => ({
          ...state,
          err: "Неправильний тип даних",
          isActive: true,
        }))
      }
      inputRef.current.value = null
    }
  }
  return (
    <>
      <div className={classNames.circle}>
        <input
          id="img"
          name={props.field.name}
          type="file"
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          style={{ display: "none" }}
          ref={inputRef}
        />
        <label htmlFor="img">
          <div className={"svg"}>
            <Camera />
          </div>
        </label>
      </div>
      <CSSTransition
        in={confirmAction.isActive && !confirmAction.err}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <ConfirmAction
          img={tempUrl}
          isActive={() => {
            setConfirmAction((state) => ({
              ...state,
              isActive: false,
            }))
            revertChanges()
          }}
          acceptChanges={() => {
            setConfirmAction((state) => ({
              ...state,
              isActive: false,
            }))
            acceptChanges()
          }}
        />
      </CSSTransition>
    </>
  )
}
