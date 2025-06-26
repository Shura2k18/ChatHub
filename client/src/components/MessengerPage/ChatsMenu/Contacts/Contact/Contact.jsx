import "./Contact.scss"
import { svg } from "../../../../../SVG"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export const Contact = (props) => {
  const [t] = useTranslation()
  const onlineStatus = useSelector((state) => state.onlineStatus.data)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (onlineStatus.length !== 0) {
      const isUserOnline = onlineStatus.some(
        (user) => user.userId === props.contact._id && user.status === "online",
      )
      setIsOnline(isUserOnline)
    } else {
      setIsOnline(false)
    }
  }, [onlineStatus, props.contact._id])
  return (
    <div className={"contact"}>
      <div className="img">
        <img
          src={`${process.env.REACT_APP_SERVER_URL}${props.contact.imageUrl}`}
          alt=""
        />
        {/*<div className="circle"></div>*/}
        {isOnline && <div className="circle"></div>}
      </div>
      <div className={"message"}>
        <h3>{props.contact.name}</h3>
        <p>
          {isOnline
            ? t("messenger.chatArea.online")
            : t("messenger.chatArea.offline")}
        </p>
      </div>
    </div>
  )
}
