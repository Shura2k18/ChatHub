import { useTranslation } from "react-i18next"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { FieldComponent } from "../../../../FieldComponent/FieldComponent"
import { ButtonComponent } from "../../../../ButtonComponent/ButtonComponent"
import { editUserData } from "../../../../../../redux/slices/thunks/userThunks"
import { useDispatch } from "react-redux"

const NewPassword = (props) => {
  const [t] = useTranslation()
  const dispatch = useDispatch()

  const PasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, `${t("main.authForm.err.tooShort")}8`)
      .max(20, `${t("main.authForm.err.tooLong")}20`)
      .required(t("main.authForm.err.required")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("main.authForm.err.confirmPassword"))
      .required(t("main.authForm.err.required")),
  })

  const disableEditingActive = () => {
    props.setIsEditingActive(false)
  }
  return (
    <>
      <h1>{t("messenger.settingsMenu.editingScreen.password.title")}</h1>
      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
        }}
        validationSchema={PasswordSchema}
        onSubmit={(values) => {
          delete values.confirmPassword
          dispatch(editUserData(values))
        }}
      >
        {({ errors, touched, handleBlur }) => (
          <Form>
            <FieldComponent
              name={"password"}
              type={"password"}
              placeholder={t("elements.fieldComponent.newPassword")}
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
            <div>
              <ButtonComponent onClick={disableEditingActive}>
                {t("elements.buttonComponent.cansel")}
              </ButtonComponent>
              <ButtonComponent type={"submit"} onClick={disableEditingActive}>
                {t("elements.buttonComponent.save")}
              </ButtonComponent>
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default NewPassword
