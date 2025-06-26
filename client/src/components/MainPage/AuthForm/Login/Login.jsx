import { useTranslation } from "react-i18next"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { FieldComponent } from "../../../Elements/FieldComponent/FieldComponent"
import { ButtonComponent } from "../../../Elements/ButtonComponent/ButtonComponent"
import { useDispatch } from "react-redux"
import { loginThunk } from "../../../../redux/slices/thunks/userThunks"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { useEffect } from "react"

const Login = (props) => {
  const [t] = useTranslation()
  const dispatch = useDispatch()
  const me = useSelector((state) => state.user.data)
  const navigate = useNavigate()

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email(t("elements.fieldComponent.err.invalidEmail"))
      .required(t("elements.fieldComponent.err.required")),
    password: Yup.string()
      .min(8, `${t("elements.fieldComponent.err.tooShort")}8`)
      .max(20, `${t("elements.fieldComponent.err.tooLong")}20`)
      .required(t("elements.fieldComponent.err.required")),
  })

  useEffect(() => {
    if (Object.keys(me).length !== 0) {
      navigate("/messenger", { replace: true })
    }
  }, [me])

  return (
    <>
      <h1>Login</h1>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={LoginSchema}
        onSubmit={(values) => {
          // same shape as initial values
          dispatch(loginThunk({ ...values }))
        }}
      >
        {({ errors, touched, handleBlur }) => (
          <Form>
            <FieldComponent
              name={"email"}
              type={"email"}
              placeholder={t("elements.fieldComponent.email")}
              handleBlur={handleBlur}
            />
            {errors.email && touched.email ? <div>{errors.email}</div> : null}
            <FieldComponent
              name={"password"}
              type={"password"}
              placeholder={t("elements.fieldComponent.password")}
              handleBlur={handleBlur}
            />
            {errors.password && touched.password ? (
              <div>{errors.password}</div>
            ) : null}
            <ButtonComponent type={"submit"}>
              {t("elements.buttonComponent.login")}
            </ButtonComponent>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default Login
