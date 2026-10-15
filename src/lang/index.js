// import Vue from 'vue'
import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import elementEnLocale from 'element-plus/es/locale/lang/en' // element-plus lang
import elementZhLocale from 'element-plus/es/locale/lang/zh-cn' // element-plus lang
import enLocale from './EN'
import zhLocale from './CH'
// Vue.use(VueI18n)

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale,
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale,
  },
}
export function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage

  // if has not choose language
  const language = (
    navigator.language || navigator.browserLanguage
  ).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'zh'
}

const i18n = createI18n({
  locale: getLanguage(), //默认显示的语言
  legacy: false,
  globalInjection: true,
  messages,
})

export default i18n
