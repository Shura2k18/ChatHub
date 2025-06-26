import { CSSTransition } from "react-transition-group"
import { ColorPicker } from "../../../ColorPicker/ColorPicker"
import "./ThemeSwitcher.scss"
import { useTheme } from "../../../../../Hooks/useTheme"
import { useEffect, useState } from "react"
import { ActiveTheme } from "../../../SVGComponents/SVGComponents"

export const ThemeSwitcher = (props) => {
  const { theme, toggleTheme, color, toggleColor } = useTheme()
  const oldTheme = [theme, color]
  const colors = [
    "#FF2929",
    "#f48225",
    "#FAD02E",
    "#91FA49",
    "#3B8AFF",
    "#991EF9",
    "#FF5DCD",
  ]
  const [isColorPickerActive, setIsColorPickerActiver] = useState(false)
  const [customColor, setCustomColor] = useState(color)
  const [activeCustomColor, setActiveCustomColor] = useState(
    colors.find((c) => customColor === c) ? false : true,
  )

  useEffect(() => {
    return () => {
      if (!props.isSaved.current) {
        toggleTheme(oldTheme[0])
        toggleColor(oldTheme[1])
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

  return (
    <>
      <div className="themeContainer">
        <h3>Кольорове оформлення</h3>
        <div className="systemTheme">
          <div
            className={theme === "light" ? "light active" : "light"}
            onClick={() => (theme !== "light" ? toggleTheme("light") : null)}
          ></div>
          <div
            className={theme === "dark" ? "dark active" : "dark"}
            onClick={() => (theme !== "dark" ? toggleTheme("dark") : null)}
          ></div>
        </div>
        <div className="colorTheme">
          {colors.map((c) => (
            <div
              key={c}
              style={{ background: `${c}` }}
              onClick={() =>
                color !== c
                  ? (toggleColor(c), setActiveCustomColor(false))
                  : null
              }
            >
              {color === c ? (
                <div className={"svg"}>
                  <ActiveTheme />
                </div>
              ) : null}
            </div>
          ))}
          <div
            className={"customColor"}
            onClick={() => {
              setIsColorPickerActiver(true)
              setActiveCustomColor(true)
            }}
          >
            {activeCustomColor ? (
              <div className={"svg"}>
                <ActiveTheme />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <CSSTransition
        in={isColorPickerActive}
        unmountOnExit
        timeout={150}
        classNames="fade"
      >
        <ColorPicker
          setIsColorPickerActiver={setIsColorPickerActiver}
          setcustomColor={setCustomColor}
          customColor={customColor}
          color={color}
          toggleColor={toggleColor}
        />
      </CSSTransition>
    </>
  )
}
