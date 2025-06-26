import classNames from "./FieldNotification.module.scss"
import { Blackout } from "../Blackout/Blackout"

export const FieldNotification = (props) => {
  return (
    <div className={classNames.container}>
      <Blackout onClick={props.isActive} />
      <div className={classNames.block}>{props.children}</div>
    </div>
  )
}
