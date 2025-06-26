import { useObserver } from "../../../Hooks/useObserver"

export const FirstBlock = (props) => {
  const { elementRef, isVisible } = useObserver()

  return (
    <div id={"particles-js"} className="first_block" ref={elementRef}>
      <img src="/img/logo_full_v.svg" className={"logo"} alt="logo" />
      <a href="">
        <img src="/img/svg/arrow.svg" alt="arrow" />
      </a>
      <button
        onClick={() => props.btnHandler()}
        style={{ width: "50px", height: "20px" }}
      ></button>
    </div>
  )
}
