import "./TopMenu.scss"
import { useTranslation } from "react-i18next"
import { useEffect, useMemo, useRef, useState } from "react"
import { useResize } from "../../../../Hooks/useResize"
import { CSSTransition } from "react-transition-group"
import { InfoMenu } from "../../../Elements/InfoMenu/InfoMenu"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import { Typing } from "../../../Elements/Typing/Typing"
import {
  AdditionMenu,
  Back,
  Call,
  VideoCall,
} from "../../../Elements/SVGComponents/SVGComponents"
import { RightClickMenu } from "../../../Elements/RightClickMenu/RightClickMenu"
import { FieldNotification } from "../../../Elements/FieldNotification/FieldNotification"
import { ButtonComponent } from "../../../Elements/ButtonComponent/ButtonComponent"
import { useDispatch } from "react-redux"
import {
  deleteChatroomThunk,
  leaveChatroomThunk,
} from "../../../../redux/slices/thunks/chatroomsThunks"
import { useVideoCall } from "../../../../Hooks/useVideoCall"
import { VideoCallComponent } from "../../../Elements/VideoCall/VideoCallComponent"

export const TopMenu = (props) => {
  const [t] = useTranslation()
  const { chatroomId } = useParams()
  const navigate = useNavigate()
  const { isScreenMd } = useResize()

  const [menuVisible, setMenuVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const clickedElementRef = useRef(null)
  const [attentionMenuActive, setAttentionMenuActive] = useState(false)
  const dispatch = useDispatch()

  // const [isMediaViewerActive, setIsMediaViewerActive] = useState(false)
  const [isInfoMenuActive, setIsInfoMenuActive] = useState(false)
  const meId = useSelector((state) => state.user.data._id)
  const chatroom = useSelector((state) =>
    state.chatrooms.data.find((chat) => chat._id === chatroomId),
  )
  const members = useSelector((state) =>
    state.members.data.filter((member) => member.chatroomId === chatroomId),
  )
  const onlineStatusData = useSelector((state) => state.onlineStatus.data)
  //const onlineStatus = useSelector(state => state.onlineStatus.data.find(user => user.userId === privateChatMember._id));

  const privateChatMember = useMemo(() => {
    if (chatroom && chatroom.type === "private" && members.length > 0) {
      return members.find((member) => member.user._id !== meId) || null
    }
    return null
  }, [chatroom, members, meId])
  // const {
  //   callUser,
  //   endCall,
  //   isCalling,
  //   isInCall,
  //   localVideoRef,
  //   remoteVideoRef,
  // } = useVideoCall(meId, privateChatMember?.user._id || null)
  const {
    startCall,
    endCall,
    callState,
    error,
    localVideoRef,
    remoteVideoRef,
    acceptCall,
  } = useVideoCall(privateChatMember?.user._id || null)
  if (!chatroom) {
    return navigate("/messenger", { replace: true })
  }
  const onlineStatus = privateChatMember
    ? onlineStatusData.find(
        (user) => user.userId === privateChatMember.user._id,
      )
    : null

  const handleContextMenu = (event) => {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY }) // Запоминаем позицию клика
    setMenuVisible(true)
    clickedElementRef.current = event.target
    document.activeElement.blur()
    document.body.focus()
  }

  const deleteChatHandler = () => {
    if (chatroom.type === "private") {
      dispatch(deleteChatroomThunk(chatroomId))
    } else {
      dispatch(leaveChatroomThunk(chatroomId))
    }
    setAttentionMenuActive(false)
    navigate("/messenger", { replace: true })
  }

  return (
    <>
      <div className={"topMenu"}>
        <div className="left" onClick={() => setIsInfoMenuActive(true)}>
          {isScreenMd && (
            <div
              className={"svg"}
              onClick={() => {
                props.setIsChatAreaActive(false)
                navigate("/messenger", { replace: true })
              }}
            >
              <Back />
            </div>
          )}
          <img
            src={
              chatroom.type !== "private"
                ? `${process.env.REACT_APP_SERVER_URL}${chatroom.imageUrl}`
                : `${process.env.REACT_APP_SERVER_URL}${privateChatMember.user.imageUrl}`
            }
          />
          <div>
            <h3>
              {chatroom.type !== "private"
                ? chatroom.name
                : privateChatMember.user.name}
            </h3>
            {chatroom.type !== "private" ? (
              <p>
                {
                  members.filter((member) => member.chatroomId === chatroom._id)
                    .length
                }{" "}
                учасників
              </p>
            ) : privateChatMember.isTyping ? (
              <Typing />
            ) : onlineStatus.status === "online" ? (
              <p>{t("messenger.chatArea.online")}</p>
            ) : (
              <p>{t("messenger.chatArea.offline")}</p>
            )}
          </div>
        </div>
        <div className="right">
          {chatroom.type === "private" && (
            <>
              <div className={"svg"}>
                <Call />
              </div>
              {!props.isCalling && !props.isInCall && (
                // <div className={"svg"} onClick={callUser}>
                <div className={"svg"}>
                  <VideoCall />
                </div>
              )}
            </>
          )}
          <div
            className={"svg additionalMenu"}
            ref={clickedElementRef}
            onClick={handleContextMenu}
          >
            <AdditionMenu />
          </div>
        </div>
      </div>
      {/*Video call*/}
      {/*<CSSTransition*/}
      {/*  in={isCalling || isInCall}*/}
      {/*  unmountOnExit*/}
      {/*  timeout={150}*/}
      {/*  classNames="fade"*/}
      {/*>*/}
      {/*  <VideoCallComponent*/}
      {/*    localVideoRef={localVideoRef}*/}
      {/*    remoteVideoRef={remoteVideoRef}*/}
      {/*    endCall={endCall}*/}
      {/*    isInCall={isInCall}*/}
      {/*    isCalling={isCalling}*/}
      {/*  />*/}
      {/*</CSSTransition>*/}
      {/*<VideoCallComponent*/}
      {/*  localVideoRef={localVideoRef}*/}
      {/*  remoteVideoRef={remoteVideoRef}*/}
      {/*  startCall={startCall}*/}
      {/*  endCall={endCall}*/}
      {/*  callState={callState}*/}
      {/*  error={error}*/}
      {/*  acceptCall={acceptCall}*/}
      {/*/>*/}

      <CSSTransition
        in={isInfoMenuActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <InfoMenu
          setIsInfoMenuActive={setIsInfoMenuActive}
          chatroom={chatroom}
          privateChatMember={privateChatMember}
          onlineStatus={onlineStatus}
          members={members}
          type={chatroom.type}
          id={privateChatMember ? privateChatMember.user._id : chatroomId}
        />
      </CSSTransition>
      <CSSTransition
        in={menuVisible}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <RightClickMenu
          setMenuVisible={setMenuVisible}
          top={position.y + 30}
          left={position.x}
          menuVisible={menuVisible}
          clickedElementRef={clickedElementRef}
          position={"fixed"}
        >
          <div
            onClick={() => {
              setIsInfoMenuActive(true)
              setMenuVisible(false)
            }}
          >
            <p>Відкрити інформацію про чат</p>
          </div>
          <div
            onClick={() => {
              setAttentionMenuActive(true)
              setMenuVisible(false)
            }}
          >
            <p>{privateChatMember ? "Стерти дані про чат" : "Покинути чат"}</p>
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
          <h3>
            Ви впевнені, що хочете{" "}
            {privateChatMember ? "стерти дані про чат?" : "покинути чат?"}
          </h3>
          <div>
            <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
              Ні
            </ButtonComponent>
            <ButtonComponent
              onClick={(e) => {
                e.stopPropagation()
                deleteChatHandler()
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
