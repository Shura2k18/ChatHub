import { useTranslation } from "react-i18next"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { FieldComponent } from "../../../../FieldComponent/FieldComponent"
import { ButtonComponent } from "../../../../ButtonComponent/ButtonComponent"
import { editUserData } from "../../../../../../redux/slices/thunks/userThunks"
import { useDispatch } from "react-redux"

const NewNumber = (props) => {
  const [t] = useTranslation()
  const dispatch = useDispatch()

  const EmailSchema = Yup.object().shape({
    phone: Yup.string()
      .min(2, `${t("main.authForm.err.tooShort")}2`)
      .max(20, `${t("main.authForm.err.tooLong")}50`)
      .required(t("main.authForm.err.required")),
  })

  const disableEditingActive = () => {
    props.setIsEditingActive(false)
  }
  return (
    <>
      <h1>{t("messenger.settingsMenu.editingScreen.email.title")}</h1>
      <Formik
        initialValues={{
          phone: "",
        }}
        validationSchema={EmailSchema}
        onSubmit={(values) => {
          dispatch(editUserData(values))
        }}
      >
        {({ errors, touched, handleBlur }) => (
          <Form>
            <FieldComponent
              name={"phone"}
              type={"phone"}
              placeholder={t("elements.fieldComponent.newEmail")}
              handleBlur={handleBlur}
            />
            {errors.phone && touched.phone ? <div>{errors.phone}</div> : null}
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

export default NewNumber
