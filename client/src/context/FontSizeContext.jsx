import React, { createContext, useState, useEffect } from "react"

// Создаем контекст для темы
export const FontSizeContext = createContext()

// Обертка для компонента провайдера, который предоставляет данные о теме
export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || 1,
  )

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize)
  }, [fontSize])

  const toggleFontSize = (fs) => {
    setFontSize(fs)
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, toggleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}
