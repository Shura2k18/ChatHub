import { useTranslation } from "react-i18next"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { FieldComponent } from "../../../../FieldComponent/FieldComponent"
import { ButtonComponent } from "../../../../ButtonComponent/ButtonComponent"
import { editUserData } from "../../../../../../redux/slices/thunks/userThunks"
import { useDispatch } from "react-redux"

const NewTag = (props) => {
  const [t] = useTranslation()
  const dispatch = useDispatch()

  const TagSchema = Yup.object().shape({
    tag: Yup.string()
      .min(5, `${t("main.authForm.err.tooShort")}5`)
      .max(20, `${t("main.authForm.err.tooLong")}20`)
      .required(t("main.authForm.err.required"))
      .test(
        "starts-with-symbol",
        t("main.authForm.err.startsWithSymbol"),
        (value) => /^@/.test(value),
      ),
  })

  const disableEditingActive = () => {
    props.setIsEditingActive(false)
  }
  return (
    <>
      <h1>{t("messenger.settingsMenu.editingScreen.tag.title")}</h1>
      <Formik
        initialValues={{
          tag: "",
        }}
        validationSchema={TagSchema}
        onSubmit={(values) => {
          dispatch(editUserData(values))
        }}
      >
        {({ errors, touched, handleBlur }) => (
          <Form>
            <FieldComponent
              name={"tag"}
              placeholder={t("elements.fieldComponent.newTag")}
              handleBlur={handleBlur}
            />
            {errors.tag && touched.tag ? <div>{errors.tag}</div> : null}
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

export default NewTag
