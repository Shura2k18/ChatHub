import { Field } from "formik"
import { useState } from "react"
import className from "./FieldComponent.module.scss"
import { useTranslation } from "react-i18next"

export const FieldComponent = (props) => {
  const [isInputActive, setIsInputActive] = useState(false)
  return (
    <>
      <Field
        name={props.name}
        type={props.type ? props.type : ""}
        className={
          isInputActive
            ? `${className.fieldComponent} ${className.active}`
            : className.fieldComponent
        }
        onFocus={() => setIsInputActive(true)}
        onBlur={(e) => {
          setIsInputActive(false)
          props.handleBlur(e)
        }}
        placeholder={props.placeholder}
      />
    </>
  )
}
