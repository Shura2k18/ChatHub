import { useTranslation } from "react-i18next"
import "./LanguageScreen.scss"
import { ButtonComponent } from "../../ButtonComponent/ButtonComponent"
import { useEffect, useRef } from "react"

export const LanguageScreen = (props) => {
  const [t, i18n] = useTranslation()
  const isSaved = useRef(false)
  const oldLanguage = i18n.language

  useEffect(() => {
    console.log(oldLanguage)
    return () => {
      if (!isSaved.current) {
        i18n.changeLanguage(oldLanguage)
      }
    }
  }, [])
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        props.setActiveScreen("mainScreen")
      }
    }

    // Добавляем обработчик события
    window.addEventListener("keydown", handleEsc)

    // Очистка: удаляем обработчик события при размонтировании компонента
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])
  const saveOnClick = () => {
    isSaved.current = true
    props.setActiveScreen("mainScreen")
  }
  return (
    <>
      <div className="languagesContainer">
        <p
          className={i18n.language === "uk" ? "active" : null}
          onClick={() =>
            i18n.language !== "uk" ? i18n.changeLanguage("uk") : null
          }
        >
          Українська
        </p>
        <p
          className={i18n.language === "ru" ? "active" : null}
          onClick={() =>
            i18n.language !== "ru" ? i18n.changeLanguage("ru") : null
          }
        >
          Русский
        </p>
        <p
          className={i18n.language === "en" ? "active" : null}
          onClick={() =>
            i18n.language !== "en" ? i18n.changeLanguage("en") : null
          }
        >
          English
        </p>
        <p
          className={i18n.language === "fr" ? "active" : null}
          onClick={() =>
            i18n.language !== "fr" ? i18n.changeLanguage("fr") : null
          }
        >
          Français
        </p>
        <p
          className={i18n.language === "es" ? "active" : null}
          onClick={() =>
            i18n.language !== "es" ? i18n.changeLanguage("es") : null
          }
        >
          Español
        </p>
        <p
          className={i18n.language === "de" ? "active" : null}
          onClick={() =>
            i18n.language !== "de" ? i18n.changeLanguage("de") : null
          }
        >
          Deutsch
        </p>
      </div>
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
