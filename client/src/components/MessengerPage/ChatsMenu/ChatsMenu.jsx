import "./ChatsMenu.scss"
import { SearchMenu } from "./SearchMenu/SearchMenu"
import { useLayoutEffect, useRef, useState } from "react"
import { useResize } from "../../../Hooks/useResize"
import { ContentPanel } from "./ContentPanel/ContentPanel"
import { useSelector } from "react-redux"

const ChatsMenu = (props) => {
  const resize = useResize()

  const isResizing = useRef(false)
  let chatsMenuRef = useRef()
  let containerRef = useRef()
  let messRef = useRef()

  const [chatsMenuWidth, setChatsMenuWidth] = useState()
  const search = useSelector((state) => state.search.data)

  const vwToPx = (vw) => {
    const viewportWidth = window.innerWidth
    return (vw / 100) * viewportWidth
  }

  // Начало перетаскивания
  const handleMouseDown = () => {
    isResizing.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none" // Отключаем выделение текста
  }

  // Обработка движения мыши
  const handleMouseMove = (e) => {
    const oldWidth = chatsMenuRef.current.offsetWidth
    const container = containerRef.current
    const gridTemplateColumns = window
      .getComputedStyle(container, null)
      .getPropertyValue("grid-template-columns")
    let w = gridTemplateColumns
      ? Math.round(gridTemplateColumns.split(" ")[1]?.replace("px", "") || 0)
      : 0
    if (!isResizing.current) return
    const newWidth = Math.round(
      Math.max(400, Math.min(e.clientX - 130, window.innerWidth / 2 - 80)),
    )
    container.style.gridTemplateColumns = `80px ${newWidth}px calc(100vw - ${newWidth}px - 80px)`
    messRef.current.forEach((el) => {
      let maxw = Math.round(
        +window
          .getComputedStyle(el, null)
          .getPropertyValue("max-width")
          .replace("px", ""),
      )
      let minw = Math.round(
        +window
          .getComputedStyle(el, null)
          .getPropertyValue("min-width")
          .replace("px", ""),
      )
      let i = oldWidth - newWidth
      if (w !== newWidth) {
        if (minw > maxw) {
          el.style.maxWidth = `150px`
        } else {
          el.style.maxWidth = `${maxw - i - 30}px`
        }
      }
    })
    localStorage.setItem("chatsMenu", newWidth)
    const vw = vwToPx(100)
    if (vw - newWidth - 80 > 0) {
      setChatsMenuWidth(vw - newWidth - 80)
    } else {
      setChatsMenuWidth(0)
    }
  }

  const handleMouseUp = () => {
    isResizing.current = false
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }

  useLayoutEffect(() => {
    chatsMenuRef.current = document.getElementById("chatsMenu")
    containerRef.current = document.getElementById("container")
    messRef.current = document.querySelectorAll(".contentItem .left .message p")
    const cMenu = +localStorage.getItem("chatsMenu")
    const vw = vwToPx(100)

    if (!resize.isScreenMd) {
      if (cMenu) {
        containerRef.current.style.gridTemplateColumns = `80px ${cMenu}px calc(100vw - ${cMenu}px - 80px)`
        messRef.current.forEach((el) => {
          el.style.maxWidth = `${cMenu - 200 - 30}px`
        })
        if (vw - chatsMenuRef.current.offsetWidth - 80 > 0) {
          setChatsMenuWidth(vw - chatsMenuRef.current.offsetWidth - 80)
        } else {
          setChatsMenuWidth(0)
          console.log(1)
        }
      } else {
        setChatsMenuWidth(vw - chatsMenuRef.current.offsetWidth - 80)
      }
    } else {
      setChatsMenuWidth(0)
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resize.width, chatsMenuWidth, props.activeChatsMenuScreen, search])

  return (
    <div className={"chatsMenu"} id={"chatsMenu"}>
      <div>
        <SearchMenu
          setIsSideMenuActive={props.setIsSideMenuActive}
          activeChatsMenuScreen={props.activeChatsMenuScreen}
        />
        <ContentPanel
          setIsChatAreaActive={props.setIsChatAreaActive}
          chatsMenuWidth={chatsMenuWidth}
          activeChatsMenuScreen={props.activeChatsMenuScreen}
          setActiveChatsMenuScreen={props.setActiveChatsMenuScreen}
        />
      </div>
      <div
        className="resizer"
        style={!resize.isScreenMd ? { display: "block" } : { display: "none" }}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  )
}

export default ChatsMenu
