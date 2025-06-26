import "./Chat.scss"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useMemo, useRef, useState } from "react"
import { CSSTransition } from "react-transition-group"
import { RightClickMenu } from "../../../../Elements/RightClickMenu/RightClickMenu"
import { FieldNotification } from "../../../../Elements/FieldNotification/FieldNotification"
import { ButtonComponent } from "../../../../Elements/ButtonComponent/ButtonComponent"
import { leaveChatroomThunk } from "../../../../../redux/slices/thunks/chatroomsThunks"
import { markAsReadThunk } from "../../../../../redux/slices/thunks/messagesThunks"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import { Read, Unread } from "../../../../Elements/SVGComponents/SVGComponents"

export const Chat = (props) => {
  const [t] = useTranslation()
  const navigate = useNavigate()
  const { chatroomId } = useParams()

  const members =
    useSelector((state) =>
      state.members.data?.filter(
        (member) => member.chatroomId !== props.chatroom._id,
      ),
    ) || []
  // const members = useSelector(state => state.members.data?.find(member => member.chatroomId === props.chatroom._id)) || {}
  const onlineStatus = useSelector((state) => state.onlineStatus.data)
  const [isOnline, setIsOnline] = useState(false)
  const dispatch = useDispatch()

  const messageIds = useSelector(
    (state) => state.messages.chatMessages[props.chatroom._id] || [],
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

  const [menuVisible, setMenuVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const clickedElementRef = useRef(null)
  const [attentionMenuActive, setAttentionMenuActive] = useState(false)
  const privateChatroomMember = useMemo(() => {
    if (props.chatroom.type === "private" && members.length > 0) {
      return members.find((member) => member.user._id !== meId).user || null
    }
    return null
  }, [props.chatroom.type, members, meId])
  //const sender = useSelector(state => state.messages.messages[lastMessage._id].user) || null;

  useEffect(() => {
    if (onlineStatus.length !== 0 && privateChatroomMember) {
      const isUserOnline = onlineStatus.some(
        (user) =>
          user.userId === privateChatroomMember._id && user.status === "online",
      )
      if (isUserOnline !== isOnline) {
        setIsOnline(isUserOnline)
      }
    } else {
      if (isOnline !== false) {
        setIsOnline(false)
      }
    }
  }, [onlineStatus, privateChatroomMember, isOnline])

  const handleContextMenu = (event) => {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY }) // Запоминаем позицию клика
    setMenuVisible(true)
    clickedElementRef.current = event.target
    document.activeElement.blur()
    document.body.focus()
  }
  const leaveChatroom = () => {
    dispatch(leaveChatroomThunk(props.chatroom._id))
    setAttentionMenuActive(false)
  }

  const changeChatroom = () => {
    props.setIsChatAreaActive(true)
    // props.setActiveChat(props.chatroom._id)
    navigate(`/messenger/${props.chatroom._id}`, { replace: true })
    if (props.chatroom.unreadCount > 0) {
      dispatch(markAsReadThunk(props.chatroom._id))
    }
  }
  return (
    <div
      className={`chat ${chatroomId === props.chatroom._id ? "active" : ""} ${menuVisible ? "menu-open" : ""}`}
      onClick={() => changeChatroom()}
      onContextMenu={handleContextMenu}
    >
      <div className={"left"}>
        <div className="img">
          <img
            src={
              props.chatroom.type !== "private"
                ? `${process.env.REACT_APP_SERVER_URL}${props.chatroom.imageUrl}`
                : `${process.env.REACT_APP_SERVER_URL}${privateChatroomMember.imageUrl}`
            }
            alt=""
          />
          {isOnline && props.chatroom.type === "private" ? (
            <div className="circle"></div>
          ) : null}
        </div>
        <div className={"message"}>
          <h3>
            {props.chatroom.type !== "private"
              ? props.chatroom.name
              : privateChatroomMember.name}
          </h3>
          {lastMessage ? (
            props.isTyping && props.chatroom.type === "private" ? (
              <p>{t("messenger.chatsMenu.typing")}</p>
            ) : (
              <p>
                {props.chatroom.type !== "private"
                  ? `${lastMessage.user.name}: `
                  : ""}
                {lastMessage.content || `${lastMessage.messageType} файл`}
              </p>
            )
          ) : (
            <p>Група була створена</p>
          )}
        </div>
      </div>
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
          {props.chatroom.unreadCount > 0 && (
            <div className={"unreadMessages"}>{props.chatroom.unreadCount}</div>
          )}
        </div>
      ) : (
        <div className={"right"}>
          <p>
            {new Date(props.chatroom.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {props.chatroom.unreadCount > 0 && (
            <div>{props.chatroom.unreadCount}</div>
          )}
        </div>
      )}
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
        >
          {props.chatroom.unreadCount > 0 && (
            <div
              onClick={() => {
                dispatch(markAsReadThunk(props.chatroom._id))
                setMenuVisible(false)
              }}
            >
              <p>Позначити як прочитане</p>
            </div>
          )}
          <div
            onClick={() => {
              setAttentionMenuActive(true)
              setMenuVisible(false)
            }}
          >
            <p>Вийти з чату</p>
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
          <h3>Ви впевнені, що хочете вийти з групи?</h3>
          <div>
            <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
              Ні
            </ButtonComponent>
            <ButtonComponent
              onClick={(e) => {
                e.stopPropagation()
                leaveChatroom()
              }}
            >
              Так
            </ButtonComponent>
          </div>
        </FieldNotification>
      </CSSTransition>
    </div>
  )
}
