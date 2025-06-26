import "./Header.scss"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Close, Hamburger } from "../../Elements/SVGComponents/SVGComponents"

const Header = (props) => {
  const [t] = useTranslation()
  const [isActive, setIsActive] = useState(false)
  const navigate = useNavigate()
  const me = useSelector((state) => state.user.data)

  useEffect(() => {
    const toggleClass = () => {
      const el = document.querySelector("header")
      const position = window.scrollY
      if (position === 0) {
        el.classList.remove("active")
      } else {
        el.classList.add("active")
      }
    }
    window.addEventListener("scroll", toggleClass)
    return () => {
      window.removeEventListener("scroll", toggleClass)
    }
  }, [])

  return (
    <header>
      <img src="/img/logo.svg" alt="logo" />
      <div className={"hamburger"} onClick={() => setIsActive((prev) => !prev)}>
        <Hamburger />
      </div>
      <div className={isActive ? "container active" : "container"}>
        <div className={"close"} onClick={() => setIsActive((prev) => !prev)}>
          <Close />
        </div>
        <div className={"left_block"}>
          {t("main.header", { returnObjects: true }).map((h, index) => (
            <p key={index}>{h}</p>
          ))}
        </div>
        <div className={"right_block"}>
          {Object.keys(me).length !== 0 &&
          window.localStorage.getItem("token") !== null ? (
            <p onClick={() => navigate("/messenger")}>Messenger</p>
          ) : (
            <div>
              <p
                onClick={() => {
                  props.setIsAuthActive(true)
                  props.setIsLogin(true)
                }}
              >
                Login
              </p>
              <p>/</p>
              <p
                onClick={() => {
                  props.setIsAuthActive(true)
                  props.setIsLogin(false)
                }}
              >
                Reg
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
