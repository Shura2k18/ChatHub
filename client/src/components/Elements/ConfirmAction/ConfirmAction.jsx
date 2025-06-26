import classNames from "./ConfirmAction.module.scss"
import { FieldNotification } from "../FieldNotification/FieldNotification"
import { ButtonComponent } from "../ButtonComponent/ButtonComponent"
import { useTranslation } from "react-i18next"
import { Close } from "../SVGComponents/SVGComponents"

export const ConfirmAction = (props) => {
  const { t } = useTranslation()

  return (
    <FieldNotification isActive={props.isActive}>
      <div className={classNames.topBlock}>
        <div className={"svg"} onClick={props.isActive}>
          <Close />
        </div>
      </div>
      <div className={classNames.confirmAction}>
        {props.img ? <img src={props.img} /> : null}
        <p>Хочете зберегти зміни?</p>
        <div className={classNames.buttons}>
          <ButtonComponent onClick={props.isActive}>Ні</ButtonComponent>
          <ButtonComponent onClick={props.acceptChanges} type={"submit"}>
            Так
          </ButtonComponent>
        </div>
      </div>
    </FieldNotification>
  )
}
