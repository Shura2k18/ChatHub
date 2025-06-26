import classNames from "./GlobalPreloader.module.scss"
import { Logo } from "../SVGComponents/SVGComponents"

export const GlobalPreloader = () => {
  return (
    <div className={classNames.preloader}>
      <Logo />
    </div>
  )
}
