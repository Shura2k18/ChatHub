import classNames from "./CustomArrow.module.scss"
import { Arrow } from "../../SVGComponents/SVGComponents"

export const CustomArrow = (props) => {
  return (
    <>
      <button
        type={"button"}
        onClick={props.onClick}
        aria-label={props.direction === "next" ? "Next" : "Previous"}
        className={`${classNames.btn} ${props.isHidden ? classNames.hidden : ""}`}
        id={"customArrow"}
      >
        <div
          className={
            props.direction === "next" ? classNames.next : classNames.down
          }
        >
          <Arrow />
        </div>
      </button>
    </>
  )
}
