import { useTranslation } from "react-i18next"
import "./ProfileScreen.scss"
import { useEffect, useState } from "react"
import { EditingMenu } from "./EditingScreen/EditingMenu"
import { CSSTransition } from "react-transition-group"
import { NewImage } from "../../NewImage/NewImage"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { useDispatch, useSelector } from "react-redux"
import { editUserData } from "../../../../redux/slices/thunks/userThunks"
import { At, Call, Password, Profile } from "../../SVGComponents/SVGComponents"

export const ProfileScreen = (props) => {
  const [t] = useTranslation()
  const [isEditingActive, setIsEditingActive] = useState(false)
  const [activeEditingScreen, setActiveEditingScreen] = useState()
  const me = useSelector((state) => state.user.data)
  const dispatch = useDispatch()

  const newImgSchema = Yup.object().shape({
    imageUrl: Yup.mixed()
      .test(
        "fileFormat",
        "Недопустимый тип файла. Допустимы только PNG и JPEG",
        (value) => value && ["image/jpeg", "image/png"].includes(value.type),
      )
      .test(
        "fileSize",
        "Размер файла не должен превышать 10MB",
        (value) => value && value.size <= 10 * 1024 * 1024,
      ),
  })

  const handleEsc = (event) => {
    if (event.key === "Escape") {
      props.setActiveScreen("mainScreen")
    }
  }
  useEffect(() => {
    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])
  useEffect(() => {
    if (isEditingActive) {
      window.removeEventListener("keydown", handleEsc)
    } else {
      window.addEventListener("keydown", handleEsc)
    }
  }, [isEditingActive])
  return (
    <>
      <div className={"userContainer"}>
        <Formik
          initialValues={{
            imageUrl: "",
          }}
          validationSchema={newImgSchema}
          onSubmit={(values) => {
            dispatch(editUserData(values))
          }}
        >
          {({ errors }) => (
            <Form>
              <NewImage
                name={"imageUrl"}
                defaultIMG={`${process.env.REACT_APP_SERVER_URL}${me.imageUrl}`}
              />
              {errors.imageUrl ? <div>{errors.imageUrl}</div> : null}
            </Form>
          )}
        </Formik>
        <p className={"name"}>{me.name}</p>
        <p className={"isOnline"}>{t("messenger.chatArea.online")}</p>
      </div>
      <div className="dataContainer">
        <div
          className="name"
          onClick={() => {
            setActiveEditingScreen("nameScreen")
            setIsEditingActive((prev) => !prev)
          }}
        >
          <div className={"left"}>
            <div className={"svg"}>
              <Profile />
            </div>
            <p>{t("messenger.settingsMenu.profileScreen.name")}</p>
          </div>
          <p>{me.name}</p>
        </div>
        <div
          className="phone"
          onClick={() => {
            setActiveEditingScreen("emailScreen")
            setIsEditingActive((prev) => !prev)
          }}
        >
          <div className={"left"}>
            <div className={"svg"}>
              <Call />
            </div>
            <p>{t("messenger.settingsMenu.profileScreen.email")}</p>
          </div>
          <p>{me.phone}</p>
        </div>
        <div
          className="tag"
          onClick={() => {
            setActiveEditingScreen("tagScreen")
            setIsEditingActive((prev) => !prev)
          }}
        >
          <div className={"left"}>
            <div className={"svg"}>
              <At />
            </div>
            <p>{t("messenger.settingsMenu.profileScreen.tag")}</p>
          </div>
          <p>{me.tag}</p>
        </div>
        <div
          className="password"
          onClick={() => {
            setActiveEditingScreen("passwordScreen")
            setIsEditingActive(true)
          }}
        >
          <div className={"svg"}>
            <Password />
          </div>
          <p>{t("messenger.settingsMenu.profileScreen.password")}</p>
        </div>
      </div>
      <CSSTransition
        in={isEditingActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <EditingMenu
          setIsEditingActive={setIsEditingActive}
          activeEditingScreen={activeEditingScreen}
        />
      </CSSTransition>
    </>
  )
}
