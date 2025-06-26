import { useTranslation } from "react-i18next"
import "./MainScreen.scss"
import { useEffect, useState } from "react"
import { ImageViewer } from "../../ImageViewer/ImageViewer"
import { CSSTransition } from "react-transition-group"
import { useSelector } from "react-redux"
import { Color, Language, Profile } from "../../SVGComponents/SVGComponents"

export const MainScreen = (props) => {
  const [t] = useTranslation()
  const [isMediaViewerActive, setIsMediaViewerActive] = useState(false)
  const me = useSelector((state) => state.user.data)

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        props.setIsSettingsActive(false)
      }
    }

    // Добавляем обработчик события
    window.addEventListener("keydown", handleEsc)

    // Очистка: удаляем обработчик события при размонтировании компонента
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])
  return (
    <>
      <div className="user">
        <img
          src={`${process.env.REACT_APP_SERVER_URL}${me.imageUrl}`}
          alt={me.imageUrl}
          onClick={() => setIsMediaViewerActive(true)}
        />
        <div className="data">
          <p className={"name"}>{me.name}</p>
          <p className={"phone"}>{me.phone}</p>
          <p className={"tag"}>{me.tag}</p>
        </div>
      </div>
      <div className="screens">
        <div
          className="profile"
          onClick={() => props.setActiveScreen("profileScreen")}
        >
          <div className={"svg"}>
            <Profile />
          </div>
          <p>{t("messenger.settingsMenu.mainScreen.profile")}</p>
        </div>
        <div
          className="theme"
          onClick={() => props.setActiveScreen("themeScreen")}
        >
          <div className={"svg"}>
            <Color />
          </div>
          <p>{t("messenger.settingsMenu.mainScreen.theme")}</p>
        </div>
        <div
          className="language"
          onClick={() => props.setActiveScreen("languageScreen")}
        >
          <div className={"svg"}>
            <Language />
          </div>
          <p>{t("messenger.settingsMenu.mainScreen.language")}</p>
        </div>
      </div>
      <CSSTransition
        in={isMediaViewerActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <ImageViewer
          type={"img"}
          fileURL={`${process.env.REACT_APP_SERVER_URL}${me.imageUrl}`}
          setIsMediaViewerActive={setIsMediaViewerActive}
        />
      </CSSTransition>
    </>
  )
}
