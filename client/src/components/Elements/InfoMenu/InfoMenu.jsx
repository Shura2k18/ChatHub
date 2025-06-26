import classNames from "./InfoMenu.module.scss"
import { FormContainerComponent } from "../FormContainerComponent/FormContainerComponent"
import { useTranslation } from "react-i18next"
import { useEffect, useRef, useState } from "react"
import { ImageViewer } from "../ImageViewer/ImageViewer"
import { CSSTransition } from "react-transition-group"
import { DataContainer } from "./DataContainer/DataContainer"
import { TopBlockInFormContainer } from "../TopBlockInFormContainer/TopBlockInFormContainer"
import { EditChatroomScreen } from "./EditChatroomScreen/EditChatroomScreen"

export const InfoMenu = (props) => {
  const [t] = useTranslation()
  const [isMediaViewerActive, setIsMediaViewerActive] = useState(false)
  const privateChatMember = props.privateChatMember?.user || {}
  const [isEditMenuActive, setIsEditMenuActive] = useState(false)

  const [menuVisible, setMenuVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const clickedElementRef = useRef(null)

  const handleContextMenu = (event) => {
    event.preventDefault()
    setPosition({ x: event.pageX, y: event.pageY }) // Запоминаем позицию клика
    setMenuVisible(true)
    clickedElementRef.current = event.target
    document.activeElement.blur()
    document.body.focus()
  }
  return (
    <FormContainerComponent setIsActive={props.setIsInfoMenuActive}>
      <TopBlockInFormContainer
        title={props.type === "group" ? "Про групу" : "Про користувача"}
        closeHandler={() => {
          props.setIsInfoMenuActive(false)
          setMenuVisible(true)
        }}
        additionalHandler={(event) => {
          setIsEditMenuActive(true)
          handleContextMenu(event)
        }}
        additionalButtonCondition={true}
        additionalButton={"additionMenu"}
        clickedElementRef={clickedElementRef}
      />
      <div className={classNames.chatName}>
        <img
          src={
            props.type === "group" || props.type === "otherChat"
              ? `${process.env.REACT_APP_SERVER_URL}${props.chatroom.imageUrl}`
              : props.type === "private"
                ? `${process.env.REACT_APP_SERVER_URL}${privateChatMember.imageUrl}`
                : `${process.env.REACT_APP_SERVER_URL}${props.user.imageUrl}`
          }
          onClick={() => setIsMediaViewerActive(true)}
        />
        <div>
          <h2 className={classNames.name}>
            {props.chatroom.type !== "private"
              ? props.chatroom.name
              : privateChatMember.name}
          </h2>
          {props.chatroom.type === "private" ? (
            <p className={classNames.isOnline}>
              {props.onlineStatus.status === "online"
                ? t("messenger.chatArea.online")
                : t("messenger.chatArea.offline")}
            </p>
          ) : null}
        </div>
      </div>
      <DataContainer
        privateChatMember={privateChatMember}
        chatroom={props.chatroom}
        members={props.members}
        user={props.user}
        type={props.type ? props.type : props.chatroom.type}
      />
      <CSSTransition
        in={isMediaViewerActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <ImageViewer
          setIsMediaViewerActive={setIsMediaViewerActive}
          type={"img"}
          fileURL={
            props.chatroom.type !== "private"
              ? `${process.env.REACT_APP_SERVER_URL}${props.chatroom.imageUrl}`
              : `${process.env.REACT_APP_SERVER_URL}${privateChatMember.imageUrl}`
          }
        />
      </CSSTransition>
      <CSSTransition
        in={isEditMenuActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <EditChatroomScreen
          setMenuVisible={setMenuVisible}
          menuVisible={menuVisible}
          position={position}
          clickedElementRef={clickedElementRef}
          setIsEditMenuActive={setIsEditMenuActive}
          isEditMenuActive={isEditMenuActive}
          type={props.type}
          id={props.id}
        />
      </CSSTransition>
    </FormContainerComponent>
  )
}
