import "./SearchMenu.scss"
import { useTranslation } from "react-i18next"
import { useResize } from "../../../../Hooks/useResize"
import { NavLink } from "react-router-dom"
import {
  Hamburger,
  LogoFullHorizontal,
  Search,
} from "../../../Elements/SVGComponents/SVGComponents"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  searchChatroomsThunk,
  searchUsersThunk,
} from "../../../../redux/slices/thunks/searchThunks"
import { clearSearch } from "../../../../redux/slices/searchSlice"

export const SearchMenu = (props) => {
  const [t] = useTranslation()
  const resize = useResize()
  const typingTimeoutRef = useRef(null)
  const dispatch = useDispatch()
  const search = useSelector((state) => state.search.data)
  const inputRef = useRef()

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])
  const handleChange = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      searchHandler()
    }, 1000)
  }
  const handleKeyDown = (e) => {
    // Если нажата клавиша Enter и не удерживается Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      searchHandler()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }
  const searchHandler = () => {
    if (inputRef.current.value !== "") {
      if (props.activeChatsMenuScreen === "Chats") {
        dispatch(searchChatroomsThunk(inputRef.current.value))
      } else {
        dispatch(searchUsersThunk(inputRef.current.value))
      }
    } else if (Object.keys(search).length > 0) {
      dispatch(clearSearch())
    }
  }

  useEffect(() => {
    if (Object.keys(search).length === 0) {
      inputRef.current.value = ""
    }
  }, [search])

  useEffect(() => {
    return () => {
      dispatch(clearSearch())
    }
  }, [dispatch])

  return (
    <div className="searchMenu" id={"searchMenu"}>
      {resize.isScreenMd === true ? (
        <div className={"topLogo"}>
          <div
            onClick={() => props.setIsSideMenuActive((prev) => !prev)}
            className={"svg"}
          >
            <Hamburger />
          </div>
          <div className={"logo"}>
            <NavLink to="/">
              <LogoFullHorizontal />
            </NavLink>
          </div>
        </div>
      ) : null}
      <div className="search">
        <input
          type="text"
          placeholder={
            props.activeChatsMenuScreen === "Chats"
              ? "Пошук чатів"
              : "Пошук користувачів"
          }
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
        />
        <div className={"svg"}>
          <div onClick={() => searchHandler()}>
            <Search />
          </div>
        </div>
      </div>
    </div>
  )
}
