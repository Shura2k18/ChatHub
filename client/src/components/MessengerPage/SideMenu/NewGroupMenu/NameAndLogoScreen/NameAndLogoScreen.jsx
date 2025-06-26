import "./NameAndLogoScreen.scss"
import { Form, Formik } from "formik"
import { FieldComponent } from "../../../../Elements/FieldComponent/FieldComponent"
import { ButtonComponent } from "../../../../Elements/ButtonComponent/ButtonComponent"
import * as Yup from "yup"
import { useTranslation } from "react-i18next"
import { NewImage } from "../../../../Elements/NewImage/NewImage"
import { useState } from "react"

export const NameAndLogoScreen = (props) => {
  const { t } = useTranslation()
  const [err, setErr] = useState(null)

  const newGroupSchema = Yup.object().shape({
    name: Yup.string()
      .max(50, `${t("elements.fieldComponent.err.tooLong")}50`)
      .required(t("elements.fieldComponent.err.required")),
    tag: Yup.string()
      .min(5, `${t("elements.fieldComponent.err.tooShort")}5`)
      .max(20, `${t("elements.fieldComponent.err.tooLong")}20`)
      .required(t("elements.fieldComponent.err.required"))
      .test(
        "starts-with-symbol",
        `${t("elements.fieldComponent.err.startsWithSymbol")} $`,
        (value) => /\$/.test(value),
      ),
    img: Yup.mixed()
      .nullable() // Указывает, что поле может быть пустым
      .test(
        "fileFormat",
        "Недопустимый тип файла. Допустимы только PNG и JPEG",
        (value) => {
          if (!value) return true // Пропускаем проверку, если значение пустое
          return ["image/jpeg", "image/png"].includes(value.type) // Проверка типа файла
        },
      )
      .test("fileSize", "Размер файла не должен превышать 2MB", (value) => {
        if (!value) return true // Пропускаем проверку, если значение пустое
        return value.size <= 2 * 1024 * 1024 // Проверка размера файла (2MB)
      }),
  })

  return (
    <div className="firstScreen">
      <Formik
        initialValues={{
          name: "",
          tag: "",
          imageUrl: null,
        }}
        validationSchema={newGroupSchema}
        onSubmit={(values) => {
          values["users"] = []
          props.setData(values)
        }}
      >
        {({ errors, touched, handleBlur }) => (
          <Form>
            <NewImage
              name={"imageUrl"}
              type={"file"}
              defaultIMG={`${process.env.REACT_APP_SERVER_URL}uploads/chats/chat.png`}
            />
            {errors.img ? <div>{errors.img}</div> : null}
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
            <div className={"buttons"}>
              <ButtonComponent type={"submit"}>
                {t("elements.buttonComponent.next")}
              </ButtonComponent>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
