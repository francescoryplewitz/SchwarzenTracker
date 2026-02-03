import { boot } from 'quasar/wrappers'
import { LocalStorage, Quasar } from 'quasar'
import { watch } from 'vue'
import langEn from 'quasar/lang/en-US'
import langDe from 'quasar/lang/de'
import { i18n, supportedLocales, defaultLocale, setLocale } from 'src/i18n'

const quasarLangMap = {
  en: langEn,
  de: langDe
}

const resolveLocale = (locale) => {
  if (supportedLocales.includes(locale)) return locale
  return defaultLocale
}

const resolveStoredLocale = () => {
  const storedUser = LocalStorage.getItem('user')
  const storedLocale = storedUser?.locale
  return resolveLocale(storedLocale)
}

export default boot(({ app }) => {
  app.use(i18n)

  const initialLocale = resolveStoredLocale()
  setLocale(initialLocale)
  Quasar.lang.set(quasarLangMap[initialLocale])

  watch(() => i18n.global.locale.value, (value) => {
    const nextLocale = resolveLocale(value)
    Quasar.lang.set(quasarLangMap[nextLocale])
    document.documentElement.lang = nextLocale
  })
})
