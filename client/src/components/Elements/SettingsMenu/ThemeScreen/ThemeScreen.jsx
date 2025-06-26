import "./ThemeScreen.scss"
import { ThemeSwitcher } from "./ThemeSwitcher/ThemeSwitcher"
import { FontSizeSelector } from "./FontSizeSelector/FontSizeSelector"
import { ButtonComponent } from "../../ButtonComponent/ButtonComponent"
import { useTranslation } from "react-i18next"
import { useRef } from "react"

export const ThemeScreen = (props) => {
  const [t] = useTranslation()
  const isSaved = useRef(false)

  const saveOnClick = () => {
    isSaved.current = true
    props.setActiveScreen("mainScreen")
  }

  return (
    <>
      <ThemeSwitcher
        setActiveScreen={props.setActiveScreen}
        isSaved={isSaved}
      />
      <FontSizeSelector />
      <div className="buttons">
        <ButtonComponent onClick={() => props.setActiveScreen("mainScreen")}>
          {t("elements.buttonComponent.cansel")}
        </ButtonComponent>
        <ButtonComponent onClick={() => saveOnClick()}>
          {t("elements.buttonComponent.save")}
        </ButtonComponent>
      </div>
    </>
  )
}
