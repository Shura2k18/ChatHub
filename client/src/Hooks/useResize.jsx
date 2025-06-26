import { useState, useEffect } from "react"

export const useResize = () => {
  const breakpoints = {
    SCREEN_SM: 576,
    SCREEN_MD: 768,
    SCREEN_LG: 992,
    SCREEN_XL: 1200,
    SCREEN_XXL: 1400,
  }

  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = (event) => {
      setWidth(event.target.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return {
    width,
    isScreenSm: width <= breakpoints.SCREEN_SM,
    isScreenMd: width <= breakpoints.SCREEN_MD,
    isScreenLg: width <= breakpoints.SCREEN_LG,
    isScreenXl: width <= breakpoints.SCREEN_XL,
    isScreenXxl: width <= breakpoints.SCREEN_XXL,
  }
}
