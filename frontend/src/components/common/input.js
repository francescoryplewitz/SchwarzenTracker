import { date } from 'quasar'

function checkRuleDecimal (value, min, max) {
  if (!value) return true
  let floatedValue = 0
  if (typeof value === 'string') {
    floatedValue = parseFloat(value.replace(',', '.'))
  } else {
    floatedValue = value
  }
  if (floatedValue < min || floatedValue > max) return `Der Wert muss zwischen ${min} und ${max} liegen.`
  return /^\d*(,\d{1,2})?$/.test(value) || 'Zahlen müssen im Format 1000,00 angegeben werden!'
}

function checkRuleDate (value, max) {
  if (!value) return true
  if (value < 1700 || value > max) return `Der Wert muss zwischen 1700 und ${max} liegen.`
  return /^\d{4}$/.test(value) || 'Jahreszahlen müssen im Format 2023 angegeben werden!'
}

function checkRuleDateLength (value) {
  if (!value) return true
  if (value.length !== 10) return `Erforderliches Format: 12.12.2000`
  return true
}

function checkRuleInteger (value, min, max) {
  if (!value) return true
  if (value < min || value > max) return `Der Wert muss zwischen ${min} und ${max} liegen.`
  return /^\d*$/.test(value) || 'Ganze Zahlen müssen im Format 1000 (ohne Dezimalstellen) angegeben werden!'
}

function checkRuleZipCode (value) {
  if (!value) return true
  return /^\d{5}$/.test(value) || 'Postleitzahlen müssen im Format 12345 angegeben werden!'
}

function checkPhonenumber (value) {
  if (!value) return true
  return /^\+\d{2}\d*/.test(value) || 'Telefonnummern müssen im Format +49 171 2323234 angegeben werden!'
}

function createApiDate (value) {
  const extract = date.extractDate(value, 'DD.MM.YYYY')
  return date.formatDate(extract, 'YYYY-MM-DDT12:00:00.000Z')
}

export { checkRuleDecimal, checkRuleDate, checkRuleDateLength, checkRuleInteger, checkRuleZipCode, checkPhonenumber, createApiDate }
