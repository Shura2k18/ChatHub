import "./MessagesPreloader.scss"
import { Fragment } from "react"

export const MessagesPreloader = () => {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <Fragment key={index}>
          <div className={"messageContainer myMess messagePreloader"}>
            <div className={"message"}>
              <div className={"messContainer"}></div>
            </div>
          </div>
          <div className={"messageContainer notMyMess messagePreloader"}>
            <div className={"message"}>
              <div className={"messContainer"}></div>
            </div>
          </div>
        </Fragment>
      ))}
    </>
  )
}
