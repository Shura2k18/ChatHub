import "./FileLoader.scss"
import { FieldNotification } from "../../../../Elements/FieldNotification/FieldNotification"
import { ButtonComponent } from "../../../../Elements/ButtonComponent/ButtonComponent"
import { CSSTransition } from "react-transition-group"
import { useState } from "react"
import { useResize } from "../../../../../Hooks/useResize"
import { useParams } from "react-router-dom"

export const FileLoader = (props) => {
  const { chatroomId } = useParams()
  const [confirmCancelUpload, setConfirmCancelUpload] = useState(false)
  const { isScreenMd } = useResize()
  const fileName = props.fileName.replace(`${chatroomId}_`, "")

  const handleCancelUpload = () => {
    const fileKey = `${chatroomId}_${fileName}`
    console.log(fileKey)
    console.log(props.abortControllers.current)
    console.log(props.abortControllers.current[fileKey])
    if (props.abortControllers.current[fileKey]) {
      props.abortControllers.current[fileKey].abort() // Отменяем загрузку конкретного файла
      console.log(`Загрузка ${fileName} отменена`)

      // Убираем файл из состояния загрузки
      props.setUploadProgress((prev) => {
        const updatedProgress = { ...prev }
        delete updatedProgress[fileKey]
        return updatedProgress
      })
    }
    setConfirmCancelUpload(false)
  }
  return (
    <>
      <div className={"messageContainer myMess"}>
        <div className={"message"}>
          <div className={"messContainer"}>
            <div className={"preloaderContainer"}>
              <svg
                className="progress-circle"
                viewBox="0 0 36 36"
                onClick={
                  !isScreenMd
                    ? () => setConfirmCancelUpload(true)
                    : () => handleCancelUpload()
                }
              >
                <path
                  className="circle-bg"
                  d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                />
                <path
                  className="circle"
                  d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                  style={{
                    strokeDasharray: `${props.data.progress}, 100`,
                  }}
                />
                <line x1="12" y1="12" x2="24" y2="24" className="cross" />
                <line x1="12" y1="24" x2="24" y2="12" className="cross" />
              </svg>
              <span className="progress-text">
                {fileName}: {props.data.progress}%{/*{props.data.progress}%*/}
              </span>
            </div>
          </div>
        </div>
      </div>
      <CSSTransition
        in={confirmCancelUpload}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <FieldNotification isActive={() => setConfirmCancelUpload(false)}>
          <h3>Ви впевнені, що хочете перервати завантаження?</h3>
          <div>
            <ButtonComponent onClick={() => setConfirmCancelUpload(false)}>
              Ні
            </ButtonComponent>
            <ButtonComponent onClick={() => handleCancelUpload()}>
              Так
            </ButtonComponent>
          </div>
        </FieldNotification>
      </CSSTransition>
    </>
  )
}
