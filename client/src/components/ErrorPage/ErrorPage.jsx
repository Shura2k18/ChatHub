import "./ErrorPage.scss"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"

const ErrorPage = () => {
  const [t] = useTranslation()

  return (
    <div className={"err"}>
      <div className="errText">
        <h1>404</h1>
      </div>
      {/*<a href="#">{t("err.text")}</a>*/}
      <NavLink to="/">{t("err.text")}</NavLink>
    </div>
  )
}

export default ErrorPage
