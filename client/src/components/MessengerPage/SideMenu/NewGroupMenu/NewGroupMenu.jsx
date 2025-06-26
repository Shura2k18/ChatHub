import "./NewGroupMenu.scss"
import { FormContainerComponent } from "../../../Elements/FormContainerComponent/FormContainerComponent"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { MembersScreen } from "./MembersScreen/MembersScreen"
import { NameAndLogoScreen } from "./NameAndLogoScreen/NameAndLogoScreen"
import { useSelector } from "react-redux"
import { TopBlockInFormContainer } from "../../../Elements/TopBlockInFormContainer/TopBlockInFormContainer"

export const NewGroupMenu = (props) => {
  const { t } = useTranslation()
  const [data, setData] = useState(false)
  const contacts = useSelector((state) => state.contacts.data)

  return (
    <FormContainerComponent setIsActive={props.setIsNewGroupActive}>
      <TopBlockInFormContainer
        title={
          !data
            ? t(`messenger.newGroupMenu.title`)
            : t(`messenger.newGroupMenu.users.title`)
        }
        closeHandler={() => props.setIsNewGroupActive(false)}
        additionalHandler={() => setData(false)}
        additionalButtonCondition={data}
        additionalButton={"back"}
      />
      {!data ? (
        <NameAndLogoScreen setData={setData} />
      ) : (
        <MembersScreen
          setIsNewGroupActive={props.setIsNewGroupActive}
          data={data}
          members={contacts}
        />
      )}
    </FormContainerComponent>
  )
}
