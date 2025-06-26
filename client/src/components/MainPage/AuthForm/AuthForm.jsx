import "./AuthForm.scss"
import Login from "./Login/Login"
import Register from "./Register/Register"
import { useTranslation } from "react-i18next"
import { FormContainerComponent } from "../../Elements/FormContainerComponent/FormContainerComponent"

const AuthForm = (props) => {
  const [t] = useTranslation()

  return (
    <FormContainerComponent setIsActive={props.setIsAuthActive}>
      <div className="block">
        {props.isLogin ? <Login /> : <Register />}
        <p onClick={() => props.setIsLogin((prev) => !prev)}>
          {props.isLogin
            ? t("main.authForm.anotherForm.reg")
            : t("main.authForm.anotherForm.login")}
        </p>
      </div>
    </FormContainerComponent>
  )
}

export default AuthForm
