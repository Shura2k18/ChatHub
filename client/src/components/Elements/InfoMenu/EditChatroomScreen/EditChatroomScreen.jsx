import classNames from "./EditChatroomScreen.module.scss"
import { FormContainerComponent } from "../../FormContainerComponent/FormContainerComponent"
import { RightClickMenu } from "../../RightClickMenu/RightClickMenu"
import { useEffect, useState } from "react"
import { FieldNotification } from "../../FieldNotification/FieldNotification"
import { ButtonComponent } from "../../ButtonComponent/ButtonComponent"
import { CSSTransition } from "react-transition-group"
import { TopBlockInFormContainer } from "../../TopBlockInFormContainer/TopBlockInFormContainer"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import {
  addContactThunk,
  deleteContactThunk,
} from "../../../../redux/slices/thunks/contactsThunks"

export const EditChatroomScreen = (props) => {
  const [attentionMenuActive, setAttentionMenuActive] = useState(false)
  const [activeMenuButton, setActiveMenuButton] = useState("")
  const dispatch = useDispatch()
  const contact = useSelector(
    (state) =>
      props.type !== "group" &&
      state.contacts.data.find((contact) => contact._id === props.id),
  )

  const deleteChatHandler = () => {
    // if (chatroom.type === "private") {
    //   dispatch(deleteChatroomThunk(chatroomId))
    // } else {
    //   dispatch(leaveChatroomThunk(chatroomId))
    // }
    setAttentionMenuActive(false)
  }
  const deleteContactHandler = () => {
    dispatch(deleteContactThunk(props.id))
    setAttentionMenuActive(false)
    props.setMenuVisible(false)
    props.setIsEditMenuActive(false)
  }
  const addContactHandler = () => {
    dispatch(addContactThunk(props.id))
    setAttentionMenuActive(false)
    props.setMenuVisible(false)
    props.setIsEditMenuActive(false)
  }
  useEffect(() => {
    console.log(props.id)
  }, [props.id])
  return (
    <>
      {props.type === "group" ? (
        <FormContainerComponent setIsActive={props.setIsEditMenuActive}>
          <TopBlockInFormContainer
            title={"Редагування чату"}
            closeHandler={() => props.setIsEditMenuActive(false)}
            additionalButtonCondition={false}
          />
        </FormContainerComponent>
      ) : (
        <CSSTransition
          in={props.menuVisible}
          unmountOnExit
          timeout={150}
          classNames="fade"
        >
          <RightClickMenu
            setMenuVisible={props.setIsEditMenuActive}
            top={props.position.y + 30}
            left={props.position.x}
            menuVisible={props.menuVisible}
            clickedElementRef={props.clickedElementRef}
            position={"fixed"}
          >
            {props.type === "otherChat" ? (
              <div
                onClick={() => {
                  setAttentionMenuActive(true)
                  props.setMenuVisible(false)
                  setActiveMenuButton("joinChat")
                }}
              >
                <p>Приєднатись до групи</p>
              </div>
            ) : (
              <>
                <div
                  onClick={() => {
                    setAttentionMenuActive(true)
                    props.setMenuVisible(false)
                    setActiveMenuButton("deleteChat")
                  }}
                >
                  <p>
                    {props.type !== "group"
                      ? "Стерти дані про чат"
                      : "Покинути чат"}
                  </p>
                </div>
                {contact && (
                  <div
                    onClick={() => {
                      setAttentionMenuActive(true)
                      props.setMenuVisible(false)
                      setActiveMenuButton("deleteContact")
                    }}
                  >
                    <p>Видалити користувача з контактів</p>
                  </div>
                )}
                {!contact && (
                  <div
                    onClick={() => {
                      setAttentionMenuActive(true)
                      props.setMenuVisible(false)
                      setActiveMenuButton("addContact")
                    }}
                  >
                    <p>Додати користувача в контакти</p>
                  </div>
                )}
                <div
                  onClick={() => {
                    setAttentionMenuActive(true)
                    props.setMenuVisible(false)
                    setActiveMenuButton("blockUser")
                  }}
                >
                  <p>Заблокувати користувача</p>
                </div>
              </>
            )}
          </RightClickMenu>
        </CSSTransition>
      )}
      <CSSTransition
        in={attentionMenuActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <>
          {activeMenuButton === "deleteChat" && (
            <FieldNotification isActive={() => setAttentionMenuActive(false)}>
              <h3>
                Ви впевнені, що хочете{" "}
                {props.type !== "group"
                  ? "стерти дані про чат?"
                  : "покинути чат?"}
              </h3>
              <div>
                <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
                  Ні
                </ButtonComponent>
                <ButtonComponent
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChatHandler()
                  }}
                >
                  Так
                </ButtonComponent>
              </div>
            </FieldNotification>
          )}
          {activeMenuButton === "deleteContact" && (
            <FieldNotification isActive={() => setAttentionMenuActive(false)}>
              <h3>Ви впевнені, що хочете видалити користувачів з контактів?</h3>
              <div>
                <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
                  Ні
                </ButtonComponent>
                <ButtonComponent
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteContactHandler()
                  }}
                >
                  Так
                </ButtonComponent>
              </div>
            </FieldNotification>
          )}
          {activeMenuButton === "addContact" && (
            <FieldNotification isActive={() => setAttentionMenuActive(false)}>
              <h3>Ви впевнені, що хочете додати користувача в контакти?</h3>
              <div>
                <ButtonComponent onClick={() => setAttentionMenuActive(false)}>
                  Ні
                </ButtonComponent>
                <ButtonComponent
                  onClick={(e) => {
                    e.stopPropagation()
                    addContactHandler()
                  }}
                >
                  Так
                </ButtonComponent>
              </div>
            </FieldNotification>
          )}
        </>
      </CSSTransition>
    </>
  )
}
