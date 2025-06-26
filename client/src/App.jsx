/* global SmoothScroll */
import "./App.scss"
import MainPage from "./components/MainPage/MainPage"
// import MessengerPage from "./components/MessengerPage/MessengerPage"
// import ErrorPage from "./components/ErrorPage/ErrorPage"
import { useTheme } from "./Hooks/useTheme"
import { lazy, Suspense, useEffect, useState } from "react"
import { useResize } from "./Hooks/useResize"
import { useFontSize } from "./Hooks/useFontSize"
import { useDispatch, useSelector } from "react-redux"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { fetchAuthMe } from "./redux/slices/thunks/userThunks"
import { fetchChatroomsThunk } from "./redux/slices/thunks/chatroomsThunks"
import { fetchContactsThunk } from "./redux/slices/thunks/contactsThunks"
import { GlobalPreloader } from "./components/Elements/GlobalPreloader/GlobalPreloader"
const MessengerPage = lazy(
  () => import("./components/MessengerPage/MessengerPage"),
)
const ErrorPage = lazy(() => import("./components/ErrorPage/ErrorPage"))

const App = () => {
  const { theme, color } = useTheme()
  const { fontSize } = useFontSize()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const me = useSelector((state) => state.user)

  const [checkedAuth, setCheckedAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMeLoading, setIsMeLoading] = useState(true)

  const MIN_LOADING_TIME = 2000

  const adjustViewportHeight = () => {
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty(
        "--viewport-height",
        `${window.innerHeight}px`,
      )
    })
  }

  useEffect(() => {
    if (window.localStorage.getItem("token")) {
      dispatch(fetchAuthMe())
    }

    adjustViewportHeight()
    window.addEventListener("resize", adjustViewportHeight)
    document.addEventListener("visibilitychange", adjustViewportHeight)

    if (typeof SmoothScroll !== "undefined") {
      SmoothScroll({
        // Тривалість скролла 800 = 0.8 секунди
        animationTime: 800,
        // Розмір кроку в пікселях
        stepSize: 75,

        // Додаткові налаштування:
        // Прискорення
        accelerationDelta: 30,
        // Максимальне прискорення
        accelerationMax: 2,

        // Підтримка клавиатури
        keyboardSupport: true,
        // Крок скролла стрілками на клавиатурі в пікселях
        arrowScroll: 50,

        // Налаштування пулсу
        pulseAlgorithm: true,
        pulseScale: 4,
        pulseNormalize: 1,

        // Підтримка тачпада
        touchpadSupport: true,
      })
    }
    return () => {
      window.removeEventListener("resize", adjustViewportHeight)
      document.removeEventListener("visibilitychange", adjustViewportHeight)
    }
  }, [])

  useEffect(() => {
    const html = document.querySelector("html")
    html.setAttribute("data-theme", theme)
    document.documentElement.style.setProperty("--initial-font-size", fontSize)
    document.documentElement.style.setProperty("--color", color)
  }, [theme, color, fontSize])

  useEffect(() => {
    const startTime = Date.now()
    const hasToken = localStorage.getItem("token") !== null
    console.log(hasToken)
    const isAuth = Object.keys(me).length !== 0 && !me.err

    if (isMeLoading && hasToken) return // Ждем загрузки `me`

    if (me.err) {
      localStorage.removeItem("token")
    }

    setTimeout(
      () => setLoading(false),
      Math.max(0, MIN_LOADING_TIME - (Date.now() - startTime)),
    )

    if (!checkedAuth) {
      if (location.pathname === "/" && hasToken && isAuth) {
        navigate("/messenger", { replace: true })
      } else if (location.pathname.startsWith("/messenger")) {
        if (!hasToken || !isAuth) {
          navigate("/", { replace: true })
        } else if (location.pathname !== "/messenger") {
          navigate("/messenger", { replace: true })
        }
      }
      setCheckedAuth(true)
    }
    // if (location.pathname.startsWith("/api")) {
    //   navigate("/api", { replace: true })
    // }
  }, [me, checkedAuth, navigate, isMeLoading])

  useEffect(() => {
    if (!me.loading || !localStorage.getItem("token")) {
      setIsMeLoading(false) // `me` загружен или нет токена, значит можно продолжать
    }
  }, [me])

  if (loading) {
    return <GlobalPreloader />
  }

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/messenger" element={<MessengerPage />} />
      <Route path="/messenger/:chatroomId" element={<MessengerPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default App
