import classNames from "./Blackout.module.scss"

export const Blackout = (props) => {
  return <div className={classNames.blackout} onClick={props.onClick}></div>
}
