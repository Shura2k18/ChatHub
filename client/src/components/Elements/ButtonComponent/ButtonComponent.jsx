import className from "./ButtonComponent.module.scss"

export const ButtonComponent = (props) => {
  return (
    <>
      <button
        className={className.btn}
        type={props.type ? props.type : "button"}
        onClick={props.onClick ? props.onClick : null}
      >
        {props.children}
      </button>
    </>
  )
}
