import "./Register.scss"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { useTranslation } from "react-i18next"
import { FieldComponent } from "../../../Elements/FieldComponent/FieldComponent"
import { ButtonComponent } from "../../../Elements/ButtonComponent/ButtonComponent"
import { registerThunk } from "../../../../redux/slices/thunks/userThunks"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { useEffect } from "react"

const Register = (props) => {
  const [t] = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const me = useSelector((state) => state.user.data)

  const RegisterSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, `${t("elements.fieldComponent.err.tooShort")}2`)
      .max(50, `${t("elements.fieldComponent.err.tooLong")}50`)
      .required(t("elements.fieldComponent.err.required")),
    tag: Yup.string()
      .min(5, `${t("elements.fieldComponent.err.tooShort")}5`)
      .max(20, `${t("elements.fieldComponent.err.tooLong")}20`)
      .required(t("elements.fieldComponent.err.required"))
      .test(
        "starts-with-symbol",
        `${t("elements.fieldComponent.err.startsWithSymbol")} @`,
        (value) => /^@/.test(value),
      ),
    email: Yup.string()
      .email(t("elements.fieldComponent.err.invalidEmail"))
      .required(t("elements.fieldComponent.err.required")),
    phone: Yup.string().required(t("elements.fieldComponent.err.required")),
    password: Yup.string()
      .min(8, `${t("elements.fieldComponent.err.tooShort")}8`)
      .max(20, `${t("elements.fieldComponent.err.tooLong")}20`)
      .required(t("elements.fieldComponent.err.required")),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password")],
        t("elements.fieldComponent.err.confirmPassword"),
      )
      .required(t("elements.fieldComponent.err.required")),
  })

  useEffect(() => {
    if (Object.keys(me).length !== 0) {
      navigate("/messenger", { replace: true })
    }
  }, [me])

  return (
    <>
      <h1>Register</h1>
      <Formik
        initialValues={{
          name: "",
          tag: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={RegisterSchema}
        onSubmit={(values) => {
          delete values.confirmPassword
          console.log(values)
          dispatch(registerThunk({ ...values }))
        }}
      >
        {({ errors, touched, handleBlur }) => (
          <Form>
            <FieldComponent
              name={"name"}
              placeholder={t("elements.fieldComponent.name")}
              handleBlur={handleBlur}
            />
            {errors.name && touched.name ? <div>{errors.name}</div> : null}
            <FieldComponent
              name={"tag"}
              placeholder={t("elements.fieldComponent.tag")}
              handleBlur={handleBlur}
            />
            {errors.tag && touched.tag ? <div>{errors.tag}</div> : null}
            <FieldComponent
              name={"email"}
              type={"email"}
              placeholder={t("elements.fieldComponent.email")}
              handleBlur={handleBlur}
            />
            {errors.email && touched.email ? <div>{errors.email}</div> : null}
            <FieldComponent
              name={"phone"}
              placeholder={t("Phone")}
              handleBlur={handleBlur}
            />
            {errors.phone && touched.phone ? <div>{errors.phone}</div> : null}
            <FieldComponent
              name={"password"}
              type={"password"}
              placeholder={t("elements.fieldComponent.password")}
              handleBlur={handleBlur}
            />
            {errors.password && touched.password ? (
              <div>{errors.password}</div>
            ) : null}
            <FieldComponent
              name={"confirmPassword"}
              type={"password"}
              placeholder={t("elements.fieldComponent.confirmPassword")}
              handleBlur={handleBlur}
            />
            {errors.confirmPassword && touched.confirmPassword ? (
              <div>{errors.confirmPassword}</div>
            ) : null}
            <ButtonComponent type={"submit"}>
              {t("elements.buttonComponent.reg")}
            </ButtonComponent>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default Register
