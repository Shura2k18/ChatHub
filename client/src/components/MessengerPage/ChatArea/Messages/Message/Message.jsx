import "./Message.scss"
import { Thumbnail } from "../../../../Elements/Thumbnail/Thumbnail"
import { useEffect, useRef, useState } from "react"
import ReactPlayer from "react-player"
import { useDispatch, useSelector } from "react-redux"
import { LinksPlayer } from "../../../../Elements/LinksPlayer/LinksPlayer"
import { RightClickMenu } from "../../../../Elements/RightClickMenu/RightClickMenu"
import { FieldNotification } from "../../../../Elements/FieldNotification/FieldNotification"
import { ButtonComponent } from "../../../../Elements/ButtonComponent/ButtonComponent"
import { CSSTransition } from "react-transition-group"
import { deleteMessageThunk } from "../../../../../redux/slices/thunks/messagesThunks"
import { useParams } from "react-router-dom"
import { Read, Unread } from "../../../../Elements/SVGComponents/SVGComponents"

export const Message = (props) => {
  const { chatroomId } = useParams()
  const sender = useSelector(
    (state) => state.messages.messages[props.data._id].user,
  )
  const isMyMess = useSelector(
    (state) =>
      state.messages.messages[props.data._id].user._id === state.user.data._id,
  )

  const myRole = useSelector(
    (state) =>
      state.members.data.find(
        (member) =>
          member.user._id === state.user.data._id &&
          member.chatroomId === chatroomId,
      ).role,
  )

  const nameColor = props.membersColor.find(
    (member) => member._id === sender._id,
  )
  const containerRef = useRef(null)
  const [columns, setColumns] = useState(3)

  const fileType = props.data.messageType
  const [urls, setUrls] = useState([])

  const [menuVisible, setMenuVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const clickedElementRef = useRef(null)
  const [attentionMenuActive, setAttentionMenuActive] = useState(false)
  const dispatch = useDispatch()

  const extractUrls = (text) => {
    if (typeof text !== "string") {
      return [] // Если это не строка, возвращаем пустой массив
    }
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.match(urlRegex) || [] // Возвращаем массив ссылок или пустой массив
  }
  const isVideoUrl = (url) => {
    return ReactPlayer.canPlay(url) // Проверяем, поддерживается ли видео
  }

  useEffect(() => {
    const allUrls = extractUrls(props.data.content)
    if (allUrls) {
      setUrls(allUrls)
    }
  }, [props.data.content])

  const handleContextMenu = (event) => {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY }) // Запоминаем позицию клика
    setMenuVisible(true)
    clickedElementRef.current = event.target
    document.activeElement.blur()
    document.body.focus()
  }

  const deleteMessage = () => {
    dispatch(
      deleteMessageThunk({
        messageId: props.data._id,
        chatroomId: chatroomId,
      }),
    )
    setAttentionMenuActive(false)
  }

  const editMessage = () => {
    props.setMessageEditing({
      messageId: props.data._id,
      chatroomId: chatroomId,
      content: props.data.content,
    })
    props.setText(props.data.content)
    setMenuVisible(false)
  }

  // useEffect(() => {
  //   const resizeObserver = new ResizeObserver((entries) => {
  //     const width = entries[0].contentRect.width
  //
  //     // Динамически меняем количество колонок в зависимости от ширины родителя
  //     if (width < 300) {
  //       setColumns(1)
  //     } else if (width < 600) {
  //       setColumns(2)
  //     } else {
  //       setColumns(3)
  //     }
  //   })
  //
  //   if (containerRef.current) {
  //     resizeObserver.observe(containerRef.current)
  //   }
  //
  //   return () => {
  //     if (containerRef.current) {
  //       resizeObserver.unobserve(containerRef.current)
  //     }
  //   }
  // }, [])
  //
  // const isLandscape = (image) => {
  //   // Проверяем ориентацию изображения (пример)
  //   const img = new Image()
  //   img.src = image
  //   return img.width > img.height // Если ширина больше высоты — ландшафтная ориентация
  // }

  return (
    <>
      <div
        className={
          isMyMess ? "messageContainer myMess" : "messageContainer notMyMess"
        }
      >
        {props.isGroup && !isMyMess && sender.name && (
          <img
            src={`${process.env.REACT_APP_SERVER_URL}${sender.imageUrl}`}
            alt="avatar"
            className={"avatar"}
          />
        )}
        <div
          className="message"
          onContextMenu={
            isMyMess || myRole !== "member" ? handleContextMenu : null
          }
        >
          {props.isGroup && !isMyMess && sender.name && (
            <p className="name" style={{ color: nameColor.color }}>
              {sender.name}
            </p>
          )}
          <div className="messContainer" ref={containerRef}>
            {/*Тест галереї в повідомленні (відправка багатьох фото)*/}
            {/*<PhotosGallery images={images} />*/}

            {fileType === "image" && (
              <img
                src={`${process.env.REACT_APP_SERVER_URL}${props.data.fileUrl}`}
                alt="sent-file"
                className="file-image"
                onClick={() =>
                  props.openGallery(
                    props.mediaMessages.findIndex(
                      (m) => m._id === props.data._id,
                    ),
                  )
                }
              />
            )}

            {fileType === "video" && (
              <Thumbnail
                src={props.data.thumbnail}
                onClick={() =>
                  props.openGallery(
                    props.mediaMessages.findIndex(
                      (m) => m._id === props.data._id,
                    ),
                  )
                }
              />
            )}

            {fileType === "audio" && (
              <audio controls className="file-audio">
                <source
                  src={`${process.env.REACT_APP_SERVER_URL}${props.data.fileUrl}`}
                  type="audio/mpeg"
                />
              </audio>
            )}

            {fileType === "document" && (
              <div className="file-document">
                <p>📄 Файл: {props.data.fileUrl.split("/").pop()}</p>
                <button
                  onClick={() =>
                    window.open(
                      `${process.env.REACT_APP_SERVER_URL}${props.data.fileUrl}`,
                      "_blank",
                    )
                  }
                >
                  Открыть
                </button>
                /
                <button
                  onClick={() => {
                    const link = document.createElement("a") // Создаем ссылку
                    link.href = `${process.env.REACT_APP_SERVER_URL}${props.data.fileUrl}` // Устанавливаем путь к файлу
                    link.download = props.data.fileUrl.split("/").pop() // Имя файла для скачивания
                    link.click() // Инициируем клик по ссылке
                  }}
                >
                  Скачать
                </button>
              </div>
            )}

            {props.data.content && (
              <p className="mess">
                {props.data.content
                  .split(/(https?:\/\/[^\s]+)/g)
                  .map((part, index) => {
                    if (part.match(/https?:\/\/[^\s]+/)) {
                      return (
                        <a key={index} href={part}>
                          {part}
                        </a>
                      )
                    }
                    return (
                      <span
                        key={index}
                        style={{ userSelect: "auto !important" }}
                      >
                        {part}
                      </span>
                    )
                  })}
              </p>
            )}
            {urls.map(
              (url, index) =>
                isVideoUrl(url) && <LinksPlayer key={index} url={url} />,
            )}
          </div>
          <div className="status">
            {props.data.isChanged && <p className={"changed"}>Змінено</p>}
            <p>
              {new Date(props.data.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {isMyMess && (
              <div className="svg">
                {props.data.isRead ? <Read /> : <Unread />}
              </div>
            )}
          </div>
        </div>
      </div>
      <CSSTransition
        in={menuVisible}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <RightClickMenu
          setMenuVisible={setMenuVisible}
          top={position.y}
          left={position.x}
          menuVisible={menuVisible}
          clickedElementRef={clickedElementRef}
          position={"fixed"}
        >
          {isMyMess && props.data.content && (
            <div onClick={() => editMessage()}>
              <p>Редагувати повідомлення</p>
            </div>
          )}
          <div
            onClick={() => {
              setAttentionMenuActive(true)
              setMenuVisible(false)
            }}
          >
            <p>Видалити повідомлення</p>
          </div>
        </RightClickMenu>
      </CSSTransition>
      <CSSTransition
        in={attentionMenuActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <FieldNotification isActive={() => setAttentionMenuActive(false)}>
          <h3>Ви впевнені, що хочете видалити повідомлення?</h3>
          <div>
            <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
              Ні
            </ButtonComponent>
            <ButtonComponent
              onClick={(e) => {
                e.stopPropagation()
                deleteMessage()
              }}
            >
              Так
            </ButtonComponent>
          </div>
        </FieldNotification>
      </CSSTransition>
    </>
  )
}
