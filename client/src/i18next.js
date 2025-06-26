import i18next from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import uk from "./locales/uk/translations.json"
import en from "./locales/en/translations.json"
import fr from "./locales/fr/translations.json"
import de from "./locales/de/translations.json"
import es from "./locales/es/translations.json"
import ru from "./locales/ru/translations.json"
import { initReactI18next } from "react-i18next"

const resources = {
  uk: {
    translation: uk,
  },
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  es: {
    translation: es,
  },
  de: {
    translation: de,
  },
  ru: {
    translation: ru,
  },
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: resources,
    fallback: "uk",
    debug: false,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage", "cookie"],
    },
    interpolate: {
      escapeValue: false,
    },
  })

export default i18next
