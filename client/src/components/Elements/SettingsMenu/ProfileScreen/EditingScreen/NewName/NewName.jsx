import { useTranslation } from "react-i18next"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { FieldComponent } from "../../../../FieldComponent/FieldComponent"
import { ButtonComponent } from "../../../../ButtonComponent/ButtonComponent"
import { useDispatch } from "react-redux"
import { editUserData } from "../../../../../../redux/slices/thunks/userThunks"

const NewName = (props) => {
  const [t] = useTranslation()
  const dispatch = useDispatch()

  const NameSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, `${t("main.authForm.err.tooShort")}2`)
      .max(50, `${t("main.authForm.err.tooLong")}50`)
      .required(t("main.authForm.err.required")),
  })

  const disableEditingActive = () => {
    props.setIsEditingActive(false)
  }
  return (
    <>
      <h1>{t("messenger.settingsMenu.editingScreen.name.title")}</h1>
      <Formik
        initialValues={{
          name: "",
        }}
        validationSchema={NameSchema}
        onSubmit={(values) => {
          dispatch(editUserData(values))
        }}
      >
        {({ errors, touched, handleBlur }) => (
          <Form>
            <FieldComponent
              name={"name"}
              placeholder={t("elements.fieldComponent.newName")}
              handleBlur={handleBlur}
            />
            {errors.name && touched.name ? <div>{errors.name}</div> : null}
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

export default NewName
