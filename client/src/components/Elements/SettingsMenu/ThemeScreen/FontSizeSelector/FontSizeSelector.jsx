import "./FontSizeSelector.scss"
import { useState } from "react"
import { useFontSize } from "../../../../../Hooks/useFontSize"

export const FontSizeSelector = (props) => {
  const { fontSize, toggleFontSize } = useFontSize()
  const [editedFontSize, seteditedFontSize] = useState(fontSize)

  const handleFontSizeChange = (event) => {
    const newFontSize = event.target.value
    document.documentElement.style.setProperty(
      "--initial-font-size",
      newFontSize,
    )
    toggleFontSize(newFontSize)
    seteditedFontSize(newFontSize)
  }

  return (
    <div className={"fontSizeSelector"}>
      <h3>Розмір шрифту</h3>
      <div className="sliderContainer">
        <input
          type="range"
          min="0.8"
          max="1.5"
          step="0.1"
          value={editedFontSize}
          onChange={handleFontSizeChange}
        />
        <div className="sliderMarks">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}
