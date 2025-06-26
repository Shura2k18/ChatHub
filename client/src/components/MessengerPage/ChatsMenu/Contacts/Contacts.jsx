import "./Contacts.scss"
import { Contact } from "./Contact/Contact"
import { useEffect, useState } from "react"
import { useResize } from "../../../../Hooks/useResize"
import { MoveToStartButtonComponent } from "../../../Elements/MoveToStartButtonComponent/MoveToStartButtonComponent"
import { CSSTransition } from "react-transition-group"
import { useSelector } from "react-redux"

export const Contacts = (props) => {
  const resize = useResize()
  const contacts = useSelector((state) => state.contacts.data)

  const [isBtnActive, setIsBtnActive] = useState(false)

  const moveToFirstChat = () => {
    const el = document.getElementById("contacts")
    el.scrollTo(0, 0)
  }
  const isScrollAtTop = (el) => {
    return el.scrollTop === 0 // Если скролл сверху, то его значение равно 0
  }

  useEffect(() => {
    const contacts = document.getElementById("contacts")
    const searchMenu = document.getElementById("searchMenu")
    contacts.style.height = `calc(var(--viewport-height) - ${searchMenu.offsetHeight}px)`
  }, [resize.width])

  useEffect(() => {
    const contacts = document.getElementById("contacts")
    contacts.addEventListener("scroll", () => {
      if (!isScrollAtTop(contacts)) {
        setIsBtnActive(true)
      } else {
        setIsBtnActive(false)
      }
    })
    return () => {
      contacts.removeEventListener("scroll", () => {
        if (!isScrollAtTop(contacts)) {
          setIsBtnActive(true)
        } else {
          setIsBtnActive(false)
        }
      })
    }
  }, [isBtnActive])

  return (
    <div className="contacts" id={"contacts"}>
      {contacts.map((contact, index) => (
        <Contact contact={contact} key={index} />
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
          isShow={isBtnActive}
        />
      </CSSTransition>
    </div>
  )
}
