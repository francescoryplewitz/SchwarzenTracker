import { createI18n } from 'vue-i18n'
import messagesEn from './messagesEn'
import messagesDe from './messagesDe'

const supportedLocales = ['en', 'de']
const defaultLocale = 'en'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en: messagesEn,
    de: messagesDe
  }
})

const setLocale = (locale) => {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}

export { i18n, supportedLocales, defaultLocale, setLocale }
