import { Members } from "../../../../Elements/Members/Members"
import { ButtonComponent } from "../../../../Elements/ButtonComponent/ButtonComponent"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { createChatroomThunk } from "../../../../../redux/slices/thunks/chatroomsThunks"
import { useTranslation } from "react-i18next"

export const MembersScreen = (props) => {
  const [data, setData] = useState(props.data)
  const [isErr, setIsErr] = useState(false)
  const dispatch = useDispatch()
  const [t] = useTranslation()

  const sendData = () => {
    if (data.users.length === 0) {
      setIsErr(true)
    } else {
      setIsErr(false)
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("tag", data.tag)
      formData.append("type", "group")
      if (Array.isArray(data.users)) {
        formData.append("users", JSON.stringify(data.users))
      }
      if (data.imageUrl instanceof File) {
        formData.append("imageUrl", data.imageUrl)
      }
      dispatch(createChatroomThunk(formData))
      props.setIsNewGroupActive(false)
    }
  }
  return (
    <>
      <Members
        setIsNewGroupActive={props.setIsNewGroupActive}
        data={data}
        setData={setData}
        members={props.members}
      />
      {isErr ? <p>{t("elements.fieldComponent.err.invalidMembers")}</p> : null}
      <div>
        <ButtonComponent onClick={() => props.setIsNewGroupActive(false)}>
          {t("elements.buttonComponent.cansel")}
        </ButtonComponent>
        <ButtonComponent onClick={() => sendData()}>
          {t("elements.buttonComponent.save")}
        </ButtonComponent>
      </div>
    </>
  )
}
