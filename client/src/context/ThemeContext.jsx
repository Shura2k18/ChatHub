import React, { createContext, useState, useEffect } from "react"

// Создаем контекст для темы
export const ThemeContext = createContext()

// Обертка для компонента провайдера, который предоставляет данные о теме
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")
  const [color, setColor] = useState(localStorage.getItem("color") || "#f48225")

  useEffect(() => {
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem("color", color)
  }, [color])

  // Функция для переключения темы
  const toggleTheme = (theme) => {
    setTheme(theme)
  }
  const toggleColor = (color) => {
    setColor(color)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, color, toggleColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
