import "./MessengerPage.scss"
import SideMenu from "./SideMenu/SideMenu"
import ChatsMenu from "./ChatsMenu/ChatsMenu"
import { ChatArea } from "./ChatArea/ChatArea"
import { useEffect, useRef, useState } from "react"
import { useResize } from "../../Hooks/useResize"
import { SettingsMenu } from "../Elements/SettingsMenu/SettingsMenu"
import { NewGroupMenu } from "./SideMenu/NewGroupMenu/NewGroupMenu"
import { CSSTransition } from "react-transition-group"
import { SocketProvider } from "../../context/SocketProvider"
import { fetchChatroomsThunk } from "../../redux/slices/thunks/chatroomsThunks"
import { fetchContactsThunk } from "../../redux/slices/thunks/contactsThunks"
import { useDispatch, useSelector } from "react-redux"
import StatusProvider from "../../Providers/StatusProvider"
import { fetchLastMessageThunk } from "../../redux/slices/thunks/messagesThunks"
import { GlobalPreloader } from "../Elements/GlobalPreloader/GlobalPreloader"
import { useOnlineStatus } from "../../Hooks/useOnlineStatus"
import { useSocketUserEvents } from "../../Hooks/useSocketUserEvents"
import { useSocketChatEvents } from "../../Hooks/useSocketChatEvents"
import { useSocket } from "../../Hooks/useSocket"

const MessengerPage = () => {
  const MIN_LOADING_TIME = 1000
  const resize = useResize()
  const [isLoaded, setIsLoaded] = useState(false)
  const loading = useSelector(
    (state) =>
      state.chatrooms.loading ||
      state.members.loading ||
      state.contacts.loading ||
      state.user.loading ||
      Object.values(state.messages.chatPagination).some((chat) => chat.loading),
  )
  const [isSideMenuActive, setIsSideMenuActive] = useState(false)
  const [isSettingsActive, setIsSettingsActive] = useState(false)
  const [isProfile, setIsProfile] = useState(false)
  const [isChatAreaActive, setIsChatAreaActive] = useState(false)
  const [activeChatsMenuScreen, setActiveChatsMenuScreen] = useState("Chats")
  const [isNewGroupActive, setIsNewGroupActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const abortControllers = useRef({})
  const dispatch = useDispatch()
  const chatroomIds = useSelector((state) =>
    state.chatrooms.data.map((chat) => chat._id),
  )
  const hasFetchedMessages = useRef(false)
  const { initSocket } = useSocket()

  useEffect(() => {
    initSocket.connect()
  }, [])

  useOnlineStatus()
  useSocketUserEvents()
  useSocketChatEvents()

  useEffect(() => {
    dispatch(fetchChatroomsThunk())
    dispatch(fetchContactsThunk())

    const el = document.querySelector("body")
    el.classList.add("active")
    const position = window.scrollY
    if (position !== 0) {
      window.scrollTo(0, 0)
    }
    return () => {
      el.classList.remove("active")
    }
  }, [])

  useEffect(() => {
    if (!hasFetchedMessages.current && chatroomIds.length > 0) {
      // Если флаг false и комнаты загружены
      chatroomIds.forEach((c) => {
        dispatch(fetchLastMessageThunk(c))
      })

      hasFetchedMessages.current = true // Ставим флаг, чтобы не запускать снова
    }
  }, [chatroomIds, dispatch])

  useEffect(() => {
    const startTime = Date.now()
    if (!loading) {
      setTimeout(
        () => setIsLoaded(true),
        Math.max(0, MIN_LOADING_TIME - (Date.now() - startTime)),
      )
    }
  }, [loading])

  if (!isLoaded) {
    return <GlobalPreloader />
  }

  return (
    <div className={"container"} id={"container"}>
      {/*SideMenu*/}
      <CSSTransition
        in={isSideMenuActive || !resize.isScreenMd}
        unmountOnExit
        timeout={300}
        classNames="slide-right"
      >
        <SideMenu
          isSideMenuActive={isSideMenuActive}
          setIsSideMenuActive={setIsSideMenuActive}
          setIsSettingsActive={setIsSettingsActive}
          setIsProfile={setIsProfile}
          setActiveChatsMenuScreen={setActiveChatsMenuScreen}
          activeChatsMenuScreen={activeChatsMenuScreen}
          setIsNewGroupActive={setIsNewGroupActive}
        />
      </CSSTransition>

      {/*ChatsMenu*/}
      <CSSTransition
        in={!resize.isScreenMd || !isChatAreaActive}
        unmountOnExit
        timeout={300}
        classNames="slide-right"
      >
        <ChatsMenu
          setIsSideMenuActive={setIsSideMenuActive}
          setIsChatAreaActive={setIsChatAreaActive}
          activeChatsMenuScreen={activeChatsMenuScreen}
          setActiveChatsMenuScreen={setActiveChatsMenuScreen}
        />
      </CSSTransition>

      {/*ChatArea*/}
      <CSSTransition
        in={!resize.isScreenMd || isChatAreaActive}
        unmountOnExit
        timeout={300}
        classNames="slide-left"
      >
        <ChatArea
          setIsChatAreaActive={setIsChatAreaActive}
          uploadProgress={uploadProgress}
          setUploadProgress={setUploadProgress}
          abortControllers={abortControllers}
        />
      </CSSTransition>

      {/*SettingsMenu*/}
      <CSSTransition
        in={isSettingsActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <SettingsMenu
          setIsSettingsActive={setIsSettingsActive}
          screen={isProfile ? "profileScreen" : "mainScreen"}
        />
      </CSSTransition>

      {/*NewGroup*/}
      <CSSTransition
        in={isNewGroupActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <NewGroupMenu setIsNewGroupActive={setIsNewGroupActive} />
      </CSSTransition>
    </div>
  )
}

export default MessengerPage
