import classNames from "./TopBlockInFormContainer.module.scss"
import { AdditionMenu, Back, Close } from "../SVGComponents/SVGComponents"

export const TopBlockInFormContainer = (props) => {
  return (
    <div className={classNames.topBlock}>
      <div
        className={
          props.additionalButtonCondition
            ? `${classNames.svg} ${classNames.active}`
            : classNames.svg
        }
        onClick={props.additionalHandler}
        ref={props.clickedElementRef ? props.clickedElementRef : null}
      >
        {props.additionalButton === "back" ? <Back /> : <AdditionMenu />}
      </div>
      <h1>{props.title}</h1>
      <div className={classNames.svg} onClick={props.closeHandler}>
        <Close />
      </div>
    </div>
  )
}
