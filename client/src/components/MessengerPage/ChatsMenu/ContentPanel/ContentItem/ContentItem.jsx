import "./ContentItem.scss"
import { useEffect, useMemo, useRef, useState } from "react"
import { ContextMenuBlock } from "./ContextMenuBlock/ContextMenuBlock"
import { markAsReadThunk } from "../../../../../redux/slices/thunks/messagesThunks"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { Read, Unread } from "../../../../Elements/SVGComponents/SVGComponents"
import { Typing } from "../../../../Elements/Typing/Typing"
import { IsOnlineIndicator } from "../../../../Elements/IsOnlineIndicator/IsOnlineIndicator"
import { InfoMenu } from "../../../../Elements/InfoMenu/InfoMenu"
import { CSSTransition } from "react-transition-group"

export const ContentItem = (props) => {
  const [menuVisible, setMenuVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const clickedElementRef = useRef(null)
  const contentItem = useRef(null)
  const dispatch = useDispatch()
  const [t] = useTranslation()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(false)
  const [isInfoMenuActive, setIsInfoMenuActive] = useState(false)
  const [type, setType] = useState()

  // Chats
  const { chatroomId } = useParams()
  // const members = useSelector(state => state.members.data?.find(member => member.chatroomId === props.data._id)) || {}
  const onlineStatus = useSelector((state) => state.onlineStatus.data)

  const messageIds = useSelector(
    (state) => state.messages.chatMessages[props.data._id] || [],
  )
  const messages = useSelector(
    (state) =>
      messageIds.map((id) => state.messages.messages[id]).filter(Boolean) || [],
  )
  const lastMessage = messages.reduce(
    (latest, msg) =>
      new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest,
    messages[0] || null,
  )
  const meId = useSelector((state) => state.user.data._id)

  const members =
    useSelector((state) =>
      state.members.data?.filter(
        (member) => member.chatroomId === props.data._id,
      ),
    ) || []
  const privateChatroomMember = useMemo(() => {
    if (props.data.type === "private" && members.length > 0) {
      return (
        members.find(
          (member) =>
            member.user._id !== meId && props.data._id === member.chatroomId,
        ) || null
      )
    }
    return null
  }, [props.data, members, meId])
  const contactChatroomId = useSelector((state) => {
    if (props.type === "myChat") {
      const ids = state.members.data.filter(
        (member) => member.user._id === props.data._id,
      )
      return state.chatrooms.data.find((chatroom) => {
        return ids.find(
          (id) => id.chatroomId === chatroom._id && chatroom.type === "private",
        )
      })
    }
  })

  useEffect(() => {
    if (props.activeChatsMenuScreen === "Chats") {
      if (onlineStatus.length !== 0 && privateChatroomMember) {
        const isUserOnline = onlineStatus.some(
          (user) =>
            user.userId === privateChatroomMember.user._id &&
            user.status === "online",
        )
        if (isUserOnline !== isOnline) {
          setIsOnline(isUserOnline)
        }
      } else {
        if (isOnline !== false) {
          setIsOnline(false)
        }
      }
    }
  }, [onlineStatus, privateChatroomMember, isOnline])
  const changeChatroom = (id = null) => {
    props.setIsChatAreaActive(true)
    // props.setActiveChat(props.data._id)
    navigate(`/messenger/${id ? id : props.data._id}`, { replace: true })
    if (props.data.unreadCount > 0) {
      dispatch(markAsReadThunk(id ? id : props.data._id))
    }
  }

  const onClickHandler = () => {
    switch (props.type) {
      case "myChat": {
        if (contactChatroomId) {
          changeChatroom(contactChatroomId._id)
          props.setActiveChatsMenuScreen("Chats")
          setType("private")
        } else {
          if (!privateChatroomMember) {
            if (props.data.type === "group") {
              changeChatroom()
              setType("group")
            } else {
              setIsInfoMenuActive(true)
              setType("user")
            }
          } else {
            changeChatroom()
            setType("private")
          }
        }
        break
      }
      case "otherChat": {
        setIsInfoMenuActive(true)
        setType(props.type)
        break
      }
      case "user": {
        setIsInfoMenuActive(true)
        setType(props.type)
        break
      }
      default:
        break
    }
  }
  // Contacts
  useEffect(() => {
    if (props.activeChatsMenuScreen === "Contacts") {
      if (onlineStatus.length !== 0) {
        const isUserOnline = onlineStatus.some(
          (user) => user.userId === props.data._id && user.status === "online",
        )
        setIsOnline(isUserOnline)
      } else {
        setIsOnline(false)
      }
    }
  }, [onlineStatus, props.data._id])

  const handleContextMenu = (event) => {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY }) // Запоминаем позицию клика
    setMenuVisible(true)
    clickedElementRef.current = event.target
    document.activeElement.blur()
    document.body.focus()
  }

  useEffect(() => {
    if (!contentItem.current) {
      return
    }
    if (menuVisible) {
      contentItem.current.style.backgroundColor = "var(--search) !important"
    } else {
      contentItem.current.style.backgroundColor = "transparent"
    }
  }, [menuVisible])

  return (
    <>
      <div
        className={`contentItem ${chatroomId === props.data._id ? "active" : ""} ${menuVisible ? "menu-open" : ""}`}
        onClick={() => onClickHandler()}
        ref={contentItem}
        onContextMenu={handleContextMenu}
      >
        <div className={"left"}>
          <div className="img">
            <img
              src={
                props.data.type !== "private"
                  ? `${process.env.REACT_APP_SERVER_URL}${props.data.imageUrl}`
                  : `${process.env.REACT_APP_SERVER_URL}${privateChatroomMember.user.imageUrl}`
              }
            />
            {isOnline &&
              (props.data.type === "private" ||
                props.activeChatsMenuScreen === "Contacts") && (
                // <div className="circle"></div>
                <IsOnlineIndicator />
              )}
          </div>
          <div className={"message"}>
            <h3>
              {props.data.type !== "private"
                ? props.data.name
                : privateChatroomMember.user.name}
            </h3>
            {props.activeChatsMenuScreen === "Contacts" ? (
              <p>
                {isOnline
                  ? t("messenger.chatArea.online")
                  : t("messenger.chatArea.offline")}
              </p>
            ) : (
              <>
                {privateChatroomMember?.isTyping &&
                props.data.type === "private" ? (
                  <Typing />
                ) : (
                  <>
                    {lastMessage ? (
                      // props.isTyping && props.data.type === "private" ? (
                      //   <p>{t("messenger.chatsMenu.typing")}</p>
                      // ) : (
                      <p>
                        {props.data.type !== "private"
                          ? `${lastMessage.user.name}: `
                          : ""}
                        {lastMessage.content ||
                          `${lastMessage.messageType} файл`}
                      </p>
                    ) : (
                      <>
                        {props.data.membersCount ? (
                          <p>{props.data.membersCount} учасників</p>
                        ) : (
                          <p>Група була створена</p>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {props.activeChatsMenuScreen === "Chats" && (
          <>
            {lastMessage ? (
              <div className={"right"}>
                <p>
                  {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {lastMessage.user._id === meId && (
                  <div className={"svg"}>
                    {lastMessage.isRead ? <Read /> : <Unread />}
                  </div>
                )}
                {props.data.unreadCount > 0 && (
                  <div className={"unreadMessages"}>
                    {props.data.unreadCount}
                  </div>
                )}
              </div>
            ) : (
              <div className={"right"}>
                <p>
                  {new Date(props.data.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {props.data.unreadCount > 0 && (
                  <div>{props.data.unreadCount}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ContextMenuBlock
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        position={position}
        clickedElementRef={clickedElementRef}
        activeChatsMenuScreen={props.activeChatsMenuScreen}
        dataId={props.data._id}
        unreadCount={props.data.unreadCount}
        type={type}
      />
      <CSSTransition
        in={isInfoMenuActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <InfoMenu
          setIsInfoMenuActive={setIsInfoMenuActive}
          chatroom={props.data}
          privateChatMember={privateChatroomMember}
          user={props.data}
          onlineStatus={onlineStatus}
          members={members}
          type={type}
          id={
            privateChatroomMember
              ? privateChatroomMember.user._id
              : props.data._id
          }
        />
      </CSSTransition>
    </>
  )
}
