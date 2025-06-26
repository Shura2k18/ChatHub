import { FormContainerComponent } from "../FormContainerComponent/FormContainerComponent"
import { useEffect, useState } from "react"
import { MainScreen } from "./MainScreen/MainScreen"
import { useTranslation } from "react-i18next"
import classNames from "./SettingsMenu.module.scss"
import { ProfileScreen } from "./ProfileScreen/ProfileScreen"
import { ThemeScreen } from "./ThemeScreen/ThemeScreen"
import { LanguageScreen } from "./LanguageScreen/LanguageScreen"
import { TopBlockInFormContainer } from "../TopBlockInFormContainer/TopBlockInFormContainer"

export const SettingsMenu = (props) => {
  const [t] = useTranslation()
  const [activeScreen, setActiveScreen] = useState(props.screen)
  const [isBackButtonActive, setIsBackButtonActive] = useState()

  useEffect(() => {
    activeScreen === "mainScreen"
      ? setIsBackButtonActive(false)
      : setIsBackButtonActive(true)
  }, [activeScreen])
  return (
    <FormContainerComponent setIsActive={props.setIsSettingsActive}>
      <TopBlockInFormContainer
        title={t(`messenger.settingsMenu.${activeScreen}.title`)}
        closeHandler={() => props.setIsSettingsActive(false)}
        additionalHandler={() => setActiveScreen("mainScreen")}
        additionalButtonCondition={isBackButtonActive}
        additionalButton={"back"}
      />
      <div className={classNames.container}>
        {
          {
            mainScreen: (
              <MainScreen
                setActiveScreen={setActiveScreen}
                setIsSettingsActive={props.setIsSettingsActive}
              />
            ),
            profileScreen: <ProfileScreen setActiveScreen={setActiveScreen} />,
            themeScreen: <ThemeScreen setActiveScreen={setActiveScreen} />,
            languageScreen: (
              <LanguageScreen setActiveScreen={setActiveScreen} />
            ),
          }[activeScreen]
        }
      </div>
    </FormContainerComponent>
  )
}
