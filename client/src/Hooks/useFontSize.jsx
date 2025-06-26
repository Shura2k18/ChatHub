import { useContext } from "react"
import { FontSizeContext } from "../context/FontSizeContext"

export const useFontSize = () => useContext(FontSizeContext)
