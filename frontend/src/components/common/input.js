import { date } from 'quasar'
import { i18n } from 'src/i18n'

const t = (...args) => i18n.global.t(...args)

function checkRuleDecimal (value, min, max) {
  if (!value) return true
  let floatedValue = 0
  if (typeof value === 'string') {
    floatedValue = parseFloat(value.replace(',', '.'))
  } else {
    floatedValue = value
  }
  if (floatedValue < min || floatedValue > max) return t('validation.valueBetween', { min, max })
  return /^\d*([.,]\d{1,2})?$/.test(value) || t('validation.decimalFormat')
}

function checkRuleDate (value, max) {
  if (!value) return true
  if (value < 1700 || value > max) return t('validation.valueBetween', { min: 1700, max })
  return /^\d{4}$/.test(value) || t('validation.yearFormat')
}

function checkRuleDateLength (value) {
  if (!value) return true
  if (value.length !== 10) return t('validation.dateFormat')
  return true
}

function checkRuleInteger (value, min, max) {
  if (!value) return true
  if (value < min || value > max) return t('validation.valueBetween', { min, max })
  return /^\d*$/.test(value) || t('validation.integerFormat')
}

function checkRuleZipCode (value) {
  if (!value) return true
  return /^\d{5}$/.test(value) || t('validation.zipFormat')
}

function checkPhonenumber (value) {
  if (!value) return true
  return /^\+\d{2}\d*/.test(value) || t('validation.phoneFormat')
}

function createApiDate (value) {
  const extract = date.extractDate(value, 'DD.MM.YYYY')
  return date.formatDate(extract, 'YYYY-MM-DDT12:00:00.000Z')
}

export { checkRuleDecimal, checkRuleDate, checkRuleDateLength, checkRuleInteger, checkRuleZipCode, checkPhonenumber, createApiDate }
