import "./BottomMenu.scss"
import { useTranslation } from "react-i18next"
import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import {
  editMessageThunk,
  sendMessageThunk,
} from "../../../../redux/slices/thunks/messagesThunks"
import { useSocket } from "../../../../Hooks/useSocket"
import { CSSTransition } from "react-transition-group"
import { UploadConfirmation } from "./UploadConfirmation/UploadConfirmation"
import * as Yup from "yup"
import { Form, Formik } from "formik"
import {
  ActiveTheme,
  AddFile,
  Send,
} from "../../../Elements/SVGComponents/SVGComponents"
import { useResize } from "../../../../Hooks/useResize"
import { useParams } from "react-router-dom"

export const BottomMenu = (props) => {
  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024
  const { chatroomId } = useParams()
  const [t] = useTranslation()
  const textareaRef = useRef(null)
  const dispatch = useDispatch()
  const { socket } = useSocket()
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const [isUploadConfirmationActive, setIsUploadConfirmationActive] =
    useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [error, setError] = useState(null)
  const inputRef = useRef()
  const isMounted = useRef(false)
  const { resize, isScreenSm, isScreenMd } = useResize()
  // const baseHeight = isScreenSm ? 60 : 70

  const filesSchema = Yup.object().shape({
    files: Yup.array()
      .max(10, "Максимум 10 файлов")
      .test("fileSize", "Один из файлов превышает 2 ГБ", (files) => {
        if (!files || files.length === 0) return true // Якщо немає файлів, пропускаємо
        return files.every((file) => file.size <= MAX_FILE_SIZE)
      }),
  })

  // useEffect(() => {
  //   const messages = document.getElementById("messages")
  //   const bottomMenu = document.getElementById("bottomMenu")
  //   const editingContainer = document.getElementById("editingContainer")
  //   const adjustHeight = () => {
  //     if (textareaRef.current) {
  //       let h = parseInt(textareaRef.current.style.height)
  //       if (messages.offsetHeight > window.innerHeight / 2) {
  //         textareaRef.current.style.overflowY = "hidden"
  //         textareaRef.current.style.height = "auto"
  //         textareaRef.current.style.height =
  //           textareaRef.current.scrollHeight + "px"
  //         h -= parseInt(textareaRef.current.style.height)
  //         bottomMenu.style.height = bottomMenu.offsetHeight - h + "px"
  //         messages.style.height = messages.offsetHeight + h + "px"
  //         if (editingContainer)
  //           editingContainer.style.bottom = bottomMenu.offsetHeight + "px"
  //       } else {
  //         let h1 = h
  //         h -= parseInt(textareaRef.current.scrollHeight)
  //         if (h >= 0) {
  //           textareaRef.current.style.overflowY = "hidden"
  //           textareaRef.current.style.height = "auto"
  //           textareaRef.current.style.height =
  //             textareaRef.current.scrollHeight + "px"
  //           h1 -= parseInt(textareaRef.current.style.height)
  //           bottomMenu.style.height = bottomMenu.offsetHeight - h + "px"
  //           messages.style.height = messages.offsetHeight + h1 + "px"
  //           if (editingContainer)
  //             editingContainer.style.bottom = bottomMenu.offsetHeight + "px"
  //         } else {
  //           textareaRef.current.style.overflowY = "auto"
  //         }
  //       }
  //       props.setBottomMenuHeight(bottomMenu.offsetHeight)
  //     }
  //   }
  //
  //   adjustHeight()
  // }, [props.text])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    const messages = document.getElementById("messages")
    const bottomMenu = document.getElementById("bottomMenu")
    const editingContainer = document.getElementById("editingContainer")
    const prevHeight = textareaRef.current.offsetHeight
    const baseHeight = isScreenSm ? 60 : 70

    textareaRef.current.style.height = "auto"
    const newHeight = textareaRef.current.scrollHeight

    const maxBottomHeight = window.innerHeight * 0.5 - baseHeight
    const maxTextareaHeight = maxBottomHeight - 20

    if (newHeight <= maxTextareaHeight) {
      textareaRef.current.style.height = `${newHeight}px`
      textareaRef.current.style.overflowY = "hidden"
    } else {
      textareaRef.current.style.height = `${maxTextareaHeight}px`
      textareaRef.current.style.overflowY = "auto"
    }

    const heightDiff = textareaRef.current.offsetHeight - prevHeight
    const newBottomHeight = bottomMenu.offsetHeight + heightDiff

    if (newBottomHeight <= maxBottomHeight) {
      bottomMenu.style.height = `${newBottomHeight}px`
      messages.style.height = `${messages.offsetHeight - heightDiff}px`
    } else {
      bottomMenu.style.height = `${maxBottomHeight}px`
      messages.style.height = `${window.innerHeight - maxBottomHeight - baseHeight * 2}px`
    }

    if (editingContainer) {
      editingContainer.style.bottom = `${bottomMenu.offsetHeight}px`
    }

    props.setBottomMenuHeight(bottomMenu.offsetHeight)
  }, [props.text])

  useEffect(() => {
    props.setText("")
  }, [chatroomId])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e) => {
    props.setText(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      socket.emit("typing", { chatroomId: chatroomId, isTyping: true })
    }

    // Если уже был таймер, сбрасываем его
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Запускаем новый таймер: если пользователь не печатает 2 секунды, отправляем "перестал печатать"
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit("typing", { chatroomId: chatroomId, isTyping: false })
    }, 2000)
  }
  const handleKeyDown = (e) => {
    // Если нажата клавиша Enter и не удерживается Shift
    if (e.key === "Enter" && !e.shiftKey && !isScreenMd) {
      e.preventDefault()
      sendMessageHandler()
      setIsTyping(false)
      socket.emit("typing", { chatroomId: chatroomId, isTyping: false })
    }
  }

  const sendMessageHandler = () => {
    if (props.text !== "") {
      if (props.messageEditing) {
        const data = {
          ...props.messageEditing,
          message: props.text,
        }
        dispatch(editMessageThunk(data))
        props.setMessageEditing(null)
      } else {
        const formData = new FormData()
        formData.append("chatroomId", chatroomId)
        formData.append("messageType", "text")
        formData.append("content", props.text)
        dispatch(sendMessageThunk({ messageData: formData }))
      }
      props.setText("")
    }
  }

  const handleFileChange = (e, setFieldValue, submitForm) => {
    setFieldValue("files", Array.from(e.target.files).slice(0, 10), true).then(
      (err) => {
        console.log(err)
        setError(err.files)
        if (err.files) setIsUploadConfirmationActive(true)
        submitForm()
      },
    )
    inputRef.current.value = null
  }

  const determineMessageType = (file) => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("video/")) return "video"
    if (file.type.startsWith("audio/")) return "audio"
    return "document"
  }

  const sendFile = async (file) => {
    const formData = new FormData()
    const messageType = determineMessageType(file)

    formData.append("chatroomId", chatroomId)
    formData.append("messageType", messageType)
    formData.append("files", file)

    props.setUploadProgress((prev) => ({
      ...prev,
      [`${chatroomId}_${formData.get("files").name}`]: {
        progress: 0,
        chatroomId,
      },
    }))
    props.abortControllers.current[
      `${chatroomId}_${formData.get("files").name}`
    ] = new AbortController()

    return dispatch(
      sendMessageThunk({
        messageData: formData,
        setUploadProgress: props.setUploadProgress,
        abortControllers: props.abortControllers.current,
      }),
    )
  }

  const handleConfirm = async (files) => {
    const progressState = {}
    files.forEach((file) => (progressState[`${chatroomId}_${file.name}`] = 0))
    props.setUploadProgress(progressState)

    for (let file of files) {
      await sendFile(file)
    }
    setSelectedFiles([])
    setError(null)
  }

  useEffect(() => {
    for (let file of selectedFiles) {
      Object.keys(props.uploadProgress).forEach((fileName) => {
        if (props.uploadProgress[`${chatroomId}_${fileName}`].progress === 100)
          props.setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[`${chatroomId}_${fileName}`]
            return newProgress
          })
      })
    }
  }, [props.uploadProgress])
  return (
    <>
      {props.messageEditing && (
        <div className="editingContainer" id={"editingContainer"}>
          <p>Редагувати повідомлення</p>
          <p>{props.messageEditing.content}</p>
        </div>
      )}
      <div className={"bottomMenu"} id={"bottomMenu"}>
        <Formik
          initialValues={{
            files: [],
          }}
          validationSchema={filesSchema}
          onSubmit={(values) => {
            handleConfirm(values.files)
          }}
        >
          {({ setFieldValue, submitForm }) => (
            <Form>
              <input
                type="file"
                id="fileInput"
                name="files"
                multiple
                hidden
                ref={inputRef}
                onChange={async (e) =>
                  await handleFileChange(e, setFieldValue, submitForm)
                }
              />
              <label htmlFor="fileInput">
                <div className={"svg"}>
                  <AddFile />
                </div>
              </label>
            </Form>
          )}
        </Formik>
        {/*<input type="text" placeholder={t("messenger.chatArea.sendMessage")}/>*/}
        <div className={"textarea"}>
          <textarea
            ref={textareaRef}
            value={props.text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            id={"inputMessage"}
            placeholder={t("messenger.chatArea.sendMessage")}
          ></textarea>
        </div>
        <button
          onClick={() => sendMessageHandler()}
          disabled={!props.text.trim()}
        >
          <div className={"svg"}>
            {props.messageEditing ? <ActiveTheme /> : <Send />}
          </div>
        </button>
      </div>
      <CSSTransition
        in={isUploadConfirmationActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <UploadConfirmation
          setIsUploadConfirmationActive={setIsUploadConfirmationActive}
          // chatroomId={props.chatroomId}
          error={error}
          setError={setError}
        />
      </CSSTransition>
    </>
  )
}
