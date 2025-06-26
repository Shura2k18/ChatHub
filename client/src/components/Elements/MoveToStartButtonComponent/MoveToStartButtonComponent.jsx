import classNames from "./MoveToStartButtonComponent.module.scss"
import { Arrow } from "../SVGComponents/SVGComponents"

export const MoveToStartButtonComponent = (props) => {
  return (
    <div
      className={classNames.btnContainer}
      onClick={() => props.onClick()}
      style={{
        right: `calc(15px + ${props.right})`,
        bottom: `calc(10px + ${props.bottom})`,
      }}
    >
      <div className={props.direction === "up" ? classNames.up : null}>
        <Arrow />
      </div>
    </div>
  )
}
