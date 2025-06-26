import { RightClickMenu } from "../../../../../Elements/RightClickMenu/RightClickMenu"
import { markAsReadThunk } from "../../../../../../redux/slices/thunks/messagesThunks"
import { FieldNotification } from "../../../../../Elements/FieldNotification/FieldNotification"
import { ButtonComponent } from "../../../../../Elements/ButtonComponent/ButtonComponent"
import { CSSTransition } from "react-transition-group"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { leaveChatroomThunk } from "../../../../../../redux/slices/thunks/chatroomsThunks"
import { deleteContactThunk } from "../../../../../../redux/slices/thunks/contactsThunks"

export const ContextMenuBlock = (props) => {
  const [attentionMenuActive, setAttentionMenuActive] = useState(false)
  const dispatch = useDispatch()

  const leaveChatroom = () => {
    dispatch(leaveChatroomThunk(props.dataId))
    setAttentionMenuActive(false)
  }
  const deleteContact = () => {
    dispatch(deleteContactThunk(props.dataId))
    setAttentionMenuActive(false)
  }
  return (
    <>
      <CSSTransition
        in={props.menuVisible}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <RightClickMenu
          setMenuVisible={props.setMenuVisible}
          top={props.position.y}
          left={props.position.x}
          menuVisible={props.menuVisible}
          clickedElementRef={props.clickedElementRef}
        >
          {props.activeChatsMenuScreen === "Chats" ? (
            <>
              {props.unreadCount > 0 && (
                <div
                  onClick={() => {
                    dispatch(markAsReadThunk(props.dataId))
                    props.setMenuVisible(false)
                  }}
                >
                  <p>Позначити як прочитане</p>
                </div>
              )}
              <div
                onClick={() => {
                  setAttentionMenuActive(true)
                  props.setMenuVisible(false)
                }}
              >
                <p>Вийти з чату</p>
              </div>
            </>
          ) : (
            <>
              {
                <div
                  onClick={() => {
                    setAttentionMenuActive(true)
                    props.setMenuVisible(false)
                  }}
                >
                  <p>Видалити з контактів</p>
                </div>
              }
            </>
          )}
        </RightClickMenu>
      </CSSTransition>
      <CSSTransition
        in={attentionMenuActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <FieldNotification isActive={() => setAttentionMenuActive(false)}>
          {props.activeChatsMenuScreen === "Chats" ? (
            <>
              <h3>Ви впевнені, що хочете вийти з групи?</h3>
              <div>
                <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
                  Ні
                </ButtonComponent>
                <ButtonComponent
                  onClick={(e) => {
                    e.stopPropagation()
                    leaveChatroom()
                  }}
                >
                  Так
                </ButtonComponent>
              </div>
            </>
          ) : (
            <>
              <h3>Ви впевнені, що хочете видалити користувача з контактів?</h3>
              <div>
                <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
                  Ні
                </ButtonComponent>
                <ButtonComponent
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteContact()
                  }}
                >
                  Так
                </ButtonComponent>
              </div>
            </>
          )}
        </FieldNotification>
      </CSSTransition>
    </>
  )
}
