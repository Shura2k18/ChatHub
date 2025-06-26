import "./MainPage.scss"
import Header from "./Header/Header"
import { useTranslation } from "react-i18next"
import { FirstBlock } from "./FirstBlock/FirstBlock"
import AuthForm from "./AuthForm/AuthForm"
import { useState } from "react"

const MainPage = () => {
  const [t, i18n] = useTranslation()
  const [isAuthActive, setIsAuthActive] = useState(false)
  const [isLogin, setIsLogin] = useState()
  const btnHandler = () => {
    if (i18n.language === "uk") {
      i18n.changeLanguage("fr")
    } else {
      i18n.changeLanguage("uk")
    }
  }

  return (
    <>
      <Header setIsAuthActive={setIsAuthActive} setIsLogin={setIsLogin} />
      <FirstBlock btnHandler={btnHandler} />
      {isAuthActive && (
        <AuthForm
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          setIsAuthActive={setIsAuthActive}
        />
      )}
    </>
  )
}

export default MainPage
