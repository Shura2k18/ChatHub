import classNames from "./DataContainer.module.scss"
import { useTranslation } from "react-i18next"
import { At, Call } from "../../SVGComponents/SVGComponents"
import { Members } from "../../Members/Members"
import { useSelector } from "react-redux"
import { useEffect } from "react"

export const DataContainer = (props) => {
  const [t] = useTranslation()
  const messagesList = useSelector(
    (state) => state.messages.chatMessages[props.chatroom._id],
  )
  const images = useSelector((state) =>
    (messagesList ?? [])
      .map((id) => state.messages.messages[id])
      .filter((msg) => msg.messageType === "image"),
  )
  const videos = useSelector((state) =>
    (messagesList ?? [])
      .map((id) => state.messages.messages[id])
      .filter((msg) => msg.messageType === "video"),
  )
  const audios = useSelector((state) =>
    (messagesList ?? [])
      .map((id) => state.messages.messages[id])
      .filter((msg) => msg.messageType === "audio"),
  )

  return (
    <>
      <div className={classNames.dataContainer}>
        {(props.type === "private" || props.type === "user") && (
          <div className={classNames.phone}>
            <div className={classNames.left}>
              <div className={"svg"}>
                <Call />
              </div>
              <p>{t("messenger.settingsMenu.profileScreen.email")}</p>
            </div>
            <p>
              {props.type === "private"
                ? props.privateChatMember.phone
                : props.user.phone}
            </p>
          </div>
        )}
        <div className={classNames.tag}>
          <div className={classNames.left}>
            <div className={"svg"}>
              <At />
            </div>
            <p>
              {props.type === "group" || props.type === "otherChat"
                ? "Тег групи"
                : "Тег користувача"}
            </p>
          </div>
          <p>
            {props.type === "group" || props.type === "otherChat"
              ? props.chatroom.tag
              : props.type === "private"
                ? props.privateChatMember.tag
                : props.user.tag}
          </p>
        </div>
        {images.length > 0 && (
          <div>
            <h3>Зображення</h3>
          </div>
        )}
        {videos.length > 0 && (
          <div>
            <h3>Відео</h3>
          </div>
        )}
        {audios.length > 0 && (
          <div>
            <h3>Аудіо</h3>
          </div>
        )}
        {props.members && props.type === "group" && (
          <div className={classNames.membersContainer}>
            <h3>Учасники групи</h3>
            <Members members={props.members} type={props.type} />
          </div>
        )}
      </div>
    </>
  )
}
