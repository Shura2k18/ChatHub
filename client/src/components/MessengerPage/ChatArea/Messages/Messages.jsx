import "./Messages.scss"
import { Message } from "./Message/Message"
import { useEffect, useRef, useState } from "react"
import { MoveToStartButtonComponent } from "../../../Elements/MoveToStartButtonComponent/MoveToStartButtonComponent"
import { useObserver } from "../../../../Hooks/useObserver"
import { CSSTransition } from "react-transition-group"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import {
  fetchMessagesThunk,
  markAsReadThunk,
} from "../../../../redux/slices/thunks/messagesThunks"
import { MediaGallery } from "../../../Elements/MediaGallery/MediaGallery"
import { FileLoader } from "./FileLoader/FileLoader"
import { MessagesPreloader } from "./MessagesPreloader/MessagesPreloader"

export const Messages = (props) => {
  const [isBtnActive, setIsBtnActive] = useState(false)
  const { chatroomId } = useParams()
  const membersColor = useSelector((state) =>
    state.members.data
      .map(
        (member) =>
          member.chatroomId === chatroomId && {
            _id: member.user._id,
          },
      )
      .filter(Boolean),
  )
  const dispatch = useDispatch()

  const messageIds = useSelector(
    (state) => state.messages.chatMessages[chatroomId] || [],
  )
  const messages = useSelector((state) =>
    messageIds.map((id) => state.messages.messages[id]),
  )

  const mediaMessages = messages.filter(
    (msg) => msg.messageType === "image" || msg.messageType === "video",
  )
  const mediaFiles = mediaMessages.map((msg) => ({
    url: msg.fileUrl,
    thumbnail: msg.thumbnail || null,
    type: msg.messageType,
    _id: msg._id,
  }))

  const { page, hasMore, loading } = useSelector(
    (state) =>
      state.messages.chatPagination[chatroomId] || {
        page: 1,
        hasMore: true,
        loading: false,
      },
  )

  const me = useSelector((state) => state.user.data) // Данные текущего пользователя
  const chatroom =
    useSelector((state) =>
      state.chatrooms.data.find((chat) => chat._id === chatroomId),
    ) || {} // Получаем информацию о чате
  const mediaCounter = useSelector((state) =>
    Object.values(state.messages.mediaCounters?.[chatroomId] || {}).reduce(
      (acc, num) => acc + num,
      0,
    ),
  )
  const isGroup = chatroom?.type === "group"

  const { elementRef, isVisible } = useObserver([chatroomId])
  const [isUserAtBottom, setIsUserAtBottom] = useState(true)
  const [isMediaGalleryActive, setIsMediaGalleryActive] = useState()
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showPreloader, setShowPreloader] = useState(messages.length <= 1)
  const messageContainerRef = useRef(null)
  const prevScrollHeight = useRef(0)
  const messagesRef = useRef(messages)

  useEffect(() => {
    if (messages.length > 1 || !hasMore || !loading) {
      // setTimeout(100, () => setShowPreloader(false))
      setShowPreloader(false) // Отключаем прелоадер после первой загрузки
    }
  }, [messages.length])

  const openGallery = (index) => {
    setGalleryIndex(index)
    setIsMediaGalleryActive(true)
  }

  useEffect(() => {
    const colors = {
      red: "#FF2929",
      orange: "#f48225",
      yellow: "#FAD02E",
      green: "#91FA49",
      turquoise: "#36D8B7",
      blue: "#3B8AFF",
      purple: "#991EF9",
      pink: "#FF5DCD",
    }
    membersColor.map((member) => {
      const keys = Object.keys(colors)
      const randomColor =
        Object.keys(colors)[Math.floor(Math.random() * keys.length)]
      member.color = colors[randomColor]
      return member
    })
  }, [membersColor])
  useEffect(() => {
    if (chatroomId && page === 1 && !loading && showPreloader) {
      dispatch(fetchMessagesThunk({ chatroomId, page: 1 }))
    }
  }, [chatroomId, dispatch, loading])

  // useEffect(() => {
  //   if (isVisible && hasMore && !loading) {
  //     prevScrollHeight.current = messageContainerRef.current?.scrollHeight || 0
  //     dispatch(fetchMessagesThunk({ chatroomId, page }))
  //   }
  // }, [isVisible, hasMore, loading, page, chatroomId, dispatch])
  // useEffect(() => {
  //   if (isVisible && hasMore && !loading) {
  //     prevScrollHeight.current = messageContainerRef.current?.scrollHeight || 0
  //     dispatch(fetchMessagesThunk({ chatroomId, page }))
  //   }
  // }, [isVisible, hasMore, loading, page, chatroomId, dispatch])

  useEffect(() => {
    if (isVisible && hasMore && !loading && !showPreloader) {
      // console.log("👀 elementRef видим, начинаем загрузку...")

      const container = messageContainerRef.current
      if (!container) return

      // Фиксируем старые значения
      prevScrollHeight.current = container.scrollHeight

      // console.log("📏 Текущая высота:", prevScrollHeight.current)
      setShowPreloader(true)
      setTimeout(() => {
        // const newScrollHeight = container.scrollHeight
        // console.log("📏 Новая высота:", newScrollHeight)
        // console.log("📏 Новая высота112111:", container.clientHeight)
        // container.scrollTop = newScrollHeight - prevScrollHeight.current
        // console.log("📏 Новый скролл:", container.scrollTop)
        dispatch(fetchMessagesThunk({ chatroomId, page })).then(() => {
          requestAnimationFrame(() => {
            setShowPreloader(false)
            container.scrollTop =
              container.scrollHeight - prevScrollHeight.current
            // console.log("📏 Новая высота x2:", container.scrollHeight)
            // console.log("📏 Новый скролл x2:", container.scrollTop)
            // const newScrollHeight = container.scrollHeight
            // const scrollOffset = newScrollHeight - prevScrollHeight.current
            //
            // console.log("📏 Новая высота после загрузки:", newScrollHeight)
            // console.log(
            //   "📏 Новая высота после загрузки:",
            //   prevScrollHeight.current,
            // )
            // console.log(
            //   "📍 Новый скролл после загрузки:",
            //   newScrollHeight - prevScrollHeight.current,
            // )
            //
            // // Восстанавливаем позицию скролла
            // container.scrollTop = scrollOffset
          })
        })
      }, 50)
      // Загружаем сообщения
    }
  }, [isVisible, hasMore, loading, page, chatroomId, dispatch])
  // useEffect(() => {
  //   if (
  //     messagesRef.current !== messages &&
  //     messages.length > messagesRef.current.length
  //   ) {
  //     console.log("Сообщения изменились, обновляем скролл")
  //     const container = messageContainerRef.current
  //     if (!container) return
  //
  //     const newScrollHeight = container.scrollHeight
  //     const scrollOffset = newScrollHeight - prevScrollHeight.current
  //
  //     console.log(" Новая высота после загрузки:", newScrollHeight)
  //     console.log(" Новый скролл после загрузки:", scrollOffset)
  //
  //     container.scrollTop = scrollOffset
  //     prevScrollHeight.current = newScrollHeight
  //   }
  //   messagesRef.current = messages
  // }, [messages, prevScrollHeight])

  useEffect(() => {
    if (loading) return
    const container = messageContainerRef.current
    if (!container) return

    // Запоминаем текущую высоту перед загрузкой

    requestAnimationFrame(() => {
      if (isUserAtBottom) {
        moveToLastMess(false) // Резкий скролл вниз
      }
    })
  }, [messages])

  const moveToLastMess = (smooth = true) => {
    const el = messageContainerRef.current
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      })
    }
  }

  const isScrollAtBottom = (el) => {
    return Math.round(el.scrollTop) + 1 + el.clientHeight >= el.scrollHeight
  }

  useEffect(() => {
    const el = document.getElementById("messages")
    if (!el) return

    const handleScroll = () => {
      // Слушаем прокрутку (в том числе колесиком мыши)
      requestAnimationFrame(() => {
        const atBottom = isScrollAtBottom(el)
        setIsUserAtBottom(atBottom)
        setIsBtnActive(!atBottom)
      })
    }

    const handleWheel = () => {
      setTimeout(() => {
        const atBottom = isScrollAtBottom(el)
        setIsUserAtBottom(atBottom)
        setIsBtnActive(!atBottom)
      }, 50) // небольшой таймаут для обработки прокрутки
    }

    el.addEventListener("scroll", handleScroll)
    el.addEventListener("wheel", handleWheel) // обработка колесика мыши

    return () => {
      el.removeEventListener("scroll", handleScroll)
      el.removeEventListener("wheel", handleWheel)
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.user._id !== me._id && chatroom.unreadCount > 0) {
        dispatch(markAsReadThunk(chatroomId))
      }
      if (isUserAtBottom) {
        moveToLastMess(false)
      }
    }
  }, [messages, isUserAtBottom, me._id, chatroomId, dispatch])

  // Важно добавить вызов moveToLastMess при монтировании компонента или обновлении сообщений
  useEffect(() => {
    moveToLastMess(false) // Прокрутка вниз при первом рендере компонента
    setIsUserAtBottom(true)
  }, [chatroomId])
  // useEffect(() => {
  //   moveToLastMess(false) // Прокрутка вниз при первом рендере компонента
  // }, [])

  return (
    <div className={"messages"} id={"messages"} ref={messageContainerRef}>
      <div>
        {hasMore && !showPreloader && (
          <div ref={elementRef} style={{ height: "1px" }} />
        )}
        {/*{loading && <MessagesPreloader />}*/}
        {(hasMore || loading) && (
          <CSSTransition
            in={showPreloader && messages.length <= 1}
            timeout={100} // Плавное исчезновение
            classNames="fade"
            unmountOnExit
          >
            <MessagesPreloader />
          </CSSTransition>
        )}
        {messages.map((msg) => (
          <Message
            key={msg._id}
            isMyMess={msg.user._id === me._id}
            data={msg}
            isGroup={isGroup}
            membersColor={membersColor}
            mediaMessages={mediaMessages}
            openGallery={openGallery}
            // chatroomId={props.chatroomId}
            setMessageEditing={props.setMessageEditing}
            setText={props.setText}
          />
        ))}

        {Object.keys(props.uploadProgress).map((fileName, index) => (
          <>
            {props.uploadProgress[fileName].progress !== 100 &&
              props.uploadProgress[fileName].chatroomId === chatroomId && (
                <FileLoader
                  key={index}
                  data={props.uploadProgress[fileName]}
                  // data={{ progress: 90 }}
                  fileName={fileName}
                  // chatroomId={props.chatroomId}
                  abortControllers={props.abortControllers}
                  setUploadProgress={props.setUploadProgress}
                />
              )}
          </>
        ))}
      </div>
      <CSSTransition
        in={isBtnActive}
        timeout={150}
        classNames="fade"
        unmountOnExit
      >
        <MoveToStartButtonComponent
          direction={"down"}
          onClick={moveToLastMess}
          right={`0px`}
          bottom={`${props.bottomMenuHeight}px`}
        />
      </CSSTransition>
      <CSSTransition
        in={isMediaGalleryActive}
        timeout={150}
        classNames="fade"
        unmountOnExit
      >
        <MediaGallery
          media={mediaFiles}
          onClose={setIsMediaGalleryActive}
          initialIndex={galleryIndex}
          autoPlay={true}
          mediaCounter={mediaCounter}
        />
      </CSSTransition>
    </div>
  )
}
