import classNames from "./FormContainerComponent.module.scss"
import { useResize } from "../../../Hooks/useResize"
import { Blackout } from "../Blackout/Blackout"

export const FormContainerComponent = (props) => {
  const resize = useResize()

  return (
    <div className={classNames.container}>
      {!resize.isScreenMd ? (
        <Blackout onClick={() => props.setIsActive(false)} />
      ) : null}
      <div className={classNames.formContainer}>{props.children}</div>
    </div>
  )
}
