const supportedLocales = ['en', 'de']
const defaultLocale = 'en'

const isSupportedLocale = (locale) => supportedLocales.includes(locale)

const normalizeLocale = (locale) => {
  return isSupportedLocale(locale) ? locale : defaultLocale
}

const getRequestLocale = (req) => {
  return normalizeLocale(req.session?.user?.locale)
}

const getCopySuffix = (locale) => {
  return locale === 'de' ? 'Kopie' : 'Copy'
}

module.exports = {
  supportedLocales,
  defaultLocale,
  isSupportedLocale,
  normalizeLocale,
  getRequestLocale,
  getCopySuffix
}
