import "./ContentPanel.scss"
import { MoveToStartButtonComponent } from "../../../Elements/MoveToStartButtonComponent/MoveToStartButtonComponent"
import { useResize } from "../../../../Hooks/useResize"
import { useEffect, useState } from "react"
import { CSSTransition } from "react-transition-group"
import { useSelector } from "react-redux"
import { ContentItem } from "./ContentItem/ContentItem"

export const ContentPanel = (props) => {
  const resize = useResize()

  const [isBtnActive, setIsBtnActive] = useState(false)
  const search = useSelector((state) => state.search.data)

  const dataList = useSelector((state) =>
    props.activeChatsMenuScreen === "Chats"
      ? [...state.chatrooms.data].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        )
      : state.contacts.data,
  )

  const moveToFirstChat = () => {
    const el = document.getElementById("contentPanel")
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
    const contentPanel = document.getElementById("contentPanel")
    const searchMenu = document.getElementById("searchMenu")
    contentPanel.style.height = `calc(var(--viewport-height) - ${searchMenu.offsetHeight}px)`
  }, [resize.width])

  useEffect(() => {
    const contentPanel = document.getElementById("contentPanel")
    contentPanel.addEventListener("scroll", () => {
      if (!isScrollAtTop(contentPanel)) {
        setIsBtnActive(true)
      } else {
        setIsBtnActive(false)
      }
    })
    return () => {
      contentPanel.removeEventListener("scroll", () => {
        if (!isScrollAtTop(contentPanel)) {
          setIsBtnActive(true)
        } else {
          setIsBtnActive(false)
        }
      })
    }
  }, [isBtnActive])
  return (
    <div className="contentPanel" id={"contentPanel"}>
      {Object.keys(search).length > 0 ? (
        <>
          {search.myData.length === 0 && search.searchResult.length === 0 && (
            <h3>Нічого не знайдено</h3>
          )}
          {search.myData.length !== 0 && (
            <>
              <h3>
                {props.activeChatsMenuScreen === "Chats"
                  ? "Ваші чати"
                  : "Ваші контакти"}
              </h3>
              {search.myData.map((item, index) => (
                <ContentItem
                  key={index}
                  setIsChatAreaActive={props.setIsChatAreaActive}
                  data={item}
                  activeChatsMenuScreen={props.activeChatsMenuScreen}
                  setActiveChatsMenuScreen={props.setActiveChatsMenuScreen}
                  type={"myChat"}
                />
              ))}
            </>
          )}
          {search.searchResult.length !== 0 && (
            <>
              <h3>Інші результати пошуку</h3>
              {search.searchResult.map((item, index) => (
                <ContentItem
                  key={index}
                  setIsChatAreaActive={props.setIsChatAreaActive}
                  data={item}
                  activeChatsMenuScreen={props.activeChatsMenuScreen}
                  type={
                    props.activeChatsMenuScreen === "Chats"
                      ? "otherChat"
                      : "user"
                  }
                />
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {dataList.length === 0 ? (
            <h3>
              {props.activeChatsMenuScreen === "Chats"
                ? "У вас ще немає чатів"
                : "У вас ще немає контактів"}
            </h3>
          ) : (
            <>
              {dataList.map((item, index) => (
                <ContentItem
                  key={index}
                  setIsChatAreaActive={props.setIsChatAreaActive}
                  data={item}
                  activeChatsMenuScreen={props.activeChatsMenuScreen}
                  type={"myChat"}
                  setActiveChatsMenuScreen={props.setActiveChatsMenuScreen}
                />
              ))}
            </>
          )}
        </>
      )}
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
