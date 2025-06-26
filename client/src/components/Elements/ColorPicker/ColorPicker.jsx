import "./ColorPicker.scss"
import { FieldNotification } from "../FieldNotification/FieldNotification"
import { HexColorPicker } from "react-colorful"
import { ButtonComponent } from "../ButtonComponent/ButtonComponent"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

export const ColorPicker = (props) => {
  const { t } = useTranslation()
  const [oldColor, setOldColor] = useState(props.color)

  useEffect(() => {
    props.toggleColor(props.customColor)
  }, [props.customColor])

  const abolishСhanges = () => {
    props.toggleColor(oldColor)
    props.setIsColorPickerActiver(false)
  }

  return (
    <FieldNotification isActive={() => abolishСhanges()}>
      <HexColorPicker
        color={props.customColor}
        onChange={props.setcustomColor}
      />

      <div className={"buttons"}>
        <ButtonComponent onClick={() => abolishСhanges()}>
          {t("elements.buttonComponent.cansel")}
        </ButtonComponent>
        <ButtonComponent
          type={"submit"}
          onClick={() => props.setIsColorPickerActiver(false)}
        >
          {t("elements.buttonComponent.save")}
        </ButtonComponent>
      </div>
    </FieldNotification>
  )
}
