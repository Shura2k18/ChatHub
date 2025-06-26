import "./Chats.scss"
import { Chat } from "./Chat/Chat"
import { useEffect, useState } from "react"
import { useResize } from "../../../../Hooks/useResize"
import { MoveToStartButtonComponent } from "../../../Elements/MoveToStartButtonComponent/MoveToStartButtonComponent"
import { CSSTransition } from "react-transition-group"
import { useSelector } from "react-redux"

export const Chats = (props) => {
  const resize = useResize()

  const [isBtnActive, setIsBtnActive] = useState(false)

  const chatrooms = useSelector((state) =>
    [...state.chatrooms.data].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    ),
  )

  const moveToFirstChat = () => {
    const el = document.getElementById("chats")
    el.scrollTop <= 100
      ? el.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        })
      : el.scrollTo(0, 100)
    el.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }
  const isScrollAtTop = (el) => {
    return el.scrollTop === 0 // Если скролл сверху, то его значение равно 0
  }

  useEffect(() => {
    const chats = document.getElementById("chats")
    const searchMenu = document.getElementById("searchMenu")
    chats.style.height = `calc(var(--viewport-height) - ${searchMenu.offsetHeight}px)`
  }, [resize.width])

  useEffect(() => {
    const chats = document.getElementById("chats")
    chats.addEventListener("scroll", () => {
      if (!isScrollAtTop(chats)) {
        setIsBtnActive(true)
      } else {
        setIsBtnActive(false)
      }
    })
    return () => {
      chats.removeEventListener("scroll", () => {
        if (!isScrollAtTop(chats)) {
          setIsBtnActive(true)
        } else {
          setIsBtnActive(false)
        }
      })
    }
  }, [isBtnActive])

  return (
    <div className="chats" id={"chats"}>
      {chatrooms.map((chatroom, index) => (
        <Chat
          key={index}
          setIsChatAreaActive={props.setIsChatAreaActive}
          isTyping={false}
          chatroom={chatroom}
          // setActiveChat={props.setActiveChat}
          // activeChat={props.activeChat}
        />
      ))}
      <CSSTransition
        in={isBtnActive}
        timeout={150}
        classNames="fade"
        unmountOnExit
      >
        <MoveToStartButtonComponent
          direction={"up"}
          onClick={moveToFirstChat}
          right={`${props.chatsMenuWidth}px`}
          bottom={"0px"}
        />
      </CSSTransition>
    </div>
  )
}
