import "./SideMenu.scss"
import { useResize } from "../../../Hooks/useResize"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CSSTransition } from "react-transition-group"
import { Blackout } from "../../Elements/Blackout/Blackout"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logoutUser } from "../../../redux/slices/userSlice"
import { FieldNotification } from "../../Elements/FieldNotification/FieldNotification"
import { ButtonComponent } from "../../Elements/ButtonComponent/ButtonComponent"
import { useSocket } from "../../../Hooks/useSocket"
import { clearChatroomsThunk } from "../../../redux/slices/thunks/chatroomsThunks"
import { clearContacts } from "../../../redux/slices/contactsSlice"
import { clearOnlineUsers } from "../../../redux/slices/onlineStatusSlice"
import {
  Chat,
  Contacts,
  Group,
  Hamburger,
  Logo,
  LogoFullHorizontal,
  Logout,
  Settings,
} from "../../Elements/SVGComponents/SVGComponents"
import { clearChatrooms } from "../../../redux/slices/chatroomsSlice"
import { clearMembers } from "../../../redux/slices/membersSlice"
import { clearSearch } from "../../../redux/slices/searchSlice"

const SideMenu = (props) => {
  const [t] = useTranslation()
  const resize = useResize()
  const me = useSelector((state) => state.user.data)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const logout = () => {
    localStorage.removeItem("token")
    dispatch(logoutUser())
    dispatch(clearChatrooms())
    dispatch(clearMembers())
    dispatch(clearContacts())
    dispatch(clearOnlineUsers())
    navigate("/")
  }

  return (
    <>
      <div className={"sideMenu"}>
        <div className={"top"}>
          {!resize.isScreenMd ? (
            <>
              <div className={"images"}>
                <div className={"svg logo"} onClick={() => navigate("/")}>
                  <Logo />
                </div>
                <img
                  src={`${process.env.REACT_APP_SERVER_URL}${me.imageUrl}`}
                  alt="a"
                  onClick={() => {
                    props.setIsSettingsActive(true)
                    props.setIsProfile(true)
                  }}
                />
              </div>
              <hr />
            </>
          ) : (
            <div className={"images"}>
              <div
                onClick={() => props.setIsSideMenuActive((prev) => !prev)}
                className={"svg"}
              >
                <Hamburger />
              </div>
              <div className={"logo"}>
                <LogoFullHorizontal />
              </div>
            </div>
          )}
          <div className={"svgs"}>
            <div
              className={"param"}
              onClick={() => {
                props.setActiveChatsMenuScreen("Chats")
                props.setIsSideMenuActive(false)
                dispatch(clearSearch())
              }}
            >
              <div
                className={
                  props.activeChatsMenuScreen === "Chats" ? "svg active" : "svg"
                }
              >
                <Chat />
              </div>
              {resize.isScreenMd ? (
                <p>{t("messenger.sideMenu.chats")}</p>
              ) : null}
            </div>
            <div
              className={"param"}
              onClick={() => {
                props.setActiveChatsMenuScreen("Contacts")
                props.setIsSideMenuActive(false)
                dispatch(clearSearch())
              }}
            >
              <div
                className={
                  props.activeChatsMenuScreen === "Contacts"
                    ? "svg active"
                    : "svg"
                }
              >
                <Contacts />
              </div>
              {resize.isScreenMd ? (
                <p>{t("messenger.sideMenu.contacts")}</p>
              ) : null}
            </div>
            <div
              className={"param"}
              onClick={() => {
                props.setIsNewGroupActive(true)
                props.setIsSideMenuActive(false)
              }}
            >
              <div className={"svg"}>
                <Group />
              </div>
              {resize.isScreenMd ? (
                <p>{t("messenger.sideMenu.newGroup")}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className={"bottom"}>
          <div
            className={"param"}
            onClick={() => {
              props.setIsSettingsActive((prev) => !prev)
              props.setIsSideMenuActive(false)
              props.setIsProfile(false)
            }}
          >
            <div className={"svg"}>
              <Settings />
            </div>
            {resize.isScreenMd ? (
              <p>{t("messenger.sideMenu.settings.title")}</p>
            ) : null}
          </div>
          <div className={"param"} onClick={() => setConfirmLogout(true)}>
            <div className={"svg"}>
              <Logout />
            </div>
            {resize.isScreenMd ? <p>{t("messenger.sideMenu.exit")}</p> : null}
          </div>
        </div>
      </div>
      <CSSTransition
        in={props.isSideMenuActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <Blackout onClick={() => props.setIsSideMenuActive(false)} />
      </CSSTransition>
      <CSSTransition
        in={confirmLogout}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <FieldNotification isActive={() => setConfirmLogout(false)}>
          <h3>Ви впевнені, що хочете вийти з акаунту?</h3>
          <div>
            <ButtonComponent onClick={() => setConfirmLogout(false)}>
              Ні
            </ButtonComponent>
            <ButtonComponent onClick={() => logout()}>Так</ButtonComponent>
          </div>
        </FieldNotification>
      </CSSTransition>
    </>
  )
}

export default SideMenu
