import {getTradeOptions} from 'components/common/options'
import {createApiDate} from 'components/common/input'
import {date} from 'quasar'
const tradeOptions = getTradeOptions()

const businessRelationOptions = [
  { label: 'Kunde', value: 'customer' },
  { label: 'Mitbewerber', value: 'competitor' },
  { label: 'Partner', value: 'partner' },
  { label: 'Lieferant', value: 'supplier' },
  { label: 'Makler', value: 'broker' },
  { label: 'Finanzierer', value: 'financier' },
  { label: 'Subunternehmer', value: 'subcontractor' },
  { label: 'Energieberater', value: 'energyConsultant' },
  { label: 'Sachverständiger', value: 'expert' },
  { label: 'Kalkulator', value: 'calculator' },
  { label: 'Andere', value: 'other' }
]

const legalTypeOptions = [
  { label: 'Öffentliche Hand', value: 'publicOrganization' },
  { label: 'Privatwirtschaftliches Unternehmen', value: 'company' },
  { label: 'e.V.', value: 'ev' }
]

function getLegalTypeOptions(){
  return legalTypeOptions
}

function getBusinessRelationOptions (){
  return businessRelationOptions
}

function getBusinessRelationLabel(value){
 return  businessRelationOptions.find(relation=>  relation.value === value)?.label
}

function mapOptionLabelLegalEntity (obj, type) {
  let option = obj.find(option => option.value === type)
  return option.label
}

function mapTradeLabelLegalEntity (trades) {
  return trades.map(trade => {
    return mapOptionLabelLegalEntity(tradeOptions, trade)
  })
}

function getLegalEntityPayload(v) {
  return {
    ...(v.name &&                { name: v.name }),
    ...(v.type &&                { type: v.type }),
    ...(v.businessRelation &&    { businessRelation: v.businessRelation }),
    ...(v.isActive !== undefined &&       { isActive: v.isActive }),
    ...(v.allowsNewsletter !== undefined && { allowsNewsletter: v.allowsNewsletter }),
    ...(v.hasCustomerAccount !== undefined && { hasCustomerAccount: v.hasCustomerAccount }),
    ...(v.street &&              { street: v.street }),
    ...(v.zip &&                 { zip: v.zip }),
    ...(v.city &&                { city: v.city }),
    ...(v.federalState &&        { federalState: v.federalState }),
    ...(v.email &&               { email: v.email }),
    ...(v.emailSecondary &&      { emailSecondary: v.emailSecondary }),
    ...(v.mobile &&              { mobile: v.mobile }),
    ...(v.mobileSecondary &&     { mobileSecondary: v.mobileSecondary }),
    ...(v.fax &&                 { fax: v.fax }),
    ...(v.web &&                 { web: v.web }),
    ...(v.notes &&               { notes: v.notes }),

    // Neue Datumsfelder aus Schema (Quasar Date Picker)
    ...(v.exemptionCertificate13bDocsValidTo &&       { exemptionCertificate13bDocsValidTo: createApiDate(v.exemptionCertificate13bDocsValidTo) }),
    ...(v.exemptionCertificate48bDocsValidTo &&       { exemptionCertificate48bDocsValidTo: createApiDate(v.exemptionCertificate48bDocsValidTo) }),
    ...(v.clearanceCertificateDocsValidTo &&          { clearanceCertificateDocsValidTo: createApiDate(v.clearanceCertificateDocsValidTo) }),
    ...(v.businessRegistrationDocsValidTo &&          { businessRegistrationDocsValidTo: createApiDate(v.businessRegistrationDocsValidTo) }),
    ...(v.guaranteeDocsValidTo &&                     { guaranteeDocsValidTo: createApiDate(v.guaranteeDocsValidTo) }),
    ...(v.priceAgreementDocsValidTo &&                { priceAgreementDocsValidTo: createApiDate(v.priceAgreementDocsValidTo) }),

    // Numerische Felder als Integer konvertieren:
    ...(v.maxOrdersPerYear != null &&   { maxOrdersPerYear: parseInt(v.maxOrdersPerYear, 10) }),
    ...(v.housesInReserve != null &&    { housesInReserve:   parseInt(v.housesInReserve, 10) }),
    ...(v.teamsCount != null &&         { teamsCount:        parseInt(v.teamsCount, 10) }),
    ...(v.virtualTeamsCount != null &&  { virtualTeamsCount: parseInt(v.virtualTeamsCount, 10) }),
    ...(v.catchmentAreaRadius != null &&{ catchmentAreaRadius: parseInt(v.catchmentAreaRadius, 10) }),

    ...(v.nameOfBank &&          { nameOfBank: v.nameOfBank }),
    ...(v.iban &&                { iban: v.iban }),
    ...(v.bic &&                 { bic: v.bic }),

    ...(v.cashDiscount != null &&       { cashDiscount:           parseInt(v.cashDiscount, 10) }),
    ...(v.paymentPeriod != null &&      { paymentPeriod:          parseInt(v.paymentPeriod, 10) }),
    ...(v.paymentPersiodDiscount != null && { paymentPersiodDiscount: parseInt(v.paymentPersiodDiscount, 10) }),

    // Trades als Array von Strings
    ...(Array.isArray(v.trades) && v.trades.length > 0 && { trades: v.trades })
  };
}

  
 function getContactPersonPayload(v){
  return {
    ...(v.namePrefix &&                { namePrefix: v.namePrefix }),
    ...(v.title &&                { title: v.title }),
    ...(v.firstName &&                { firstName: v.firstName }),
    ...(v.lastName &&                { lastName: v.lastName }),
    ...(v.type &&                { type: v.type }),
    ...(v.email &&               { email: v.email }),
    ...(v.mobile &&              { mobile: v.mobile }),
    ...(v.description &&               { notes: v.description }),
    ...(v.postion &&               { postion: v.postion }),
  }
 }

 const legalEntityDocuments = [
  {
    label: 'Freistellungsbescheinigung §13b',
    type: 'exemptionCertificate13bDocs',
    fileName: `${date.formatDate(new Date, 'DD.MM.YY')}_ Nachweis_zur_Steuerschuldnerschaft_§13b`
  },
  {
    label: 'Freistellungsbescheinigung §48b',
    type: 'exemptionCertificate48bDocs',
    fileName: `${date.formatDate(new Date, 'DD.MM.YY')}_Freistellungsbescheinigung_§48b`
  },
  {
    label: 'Unbedenklichkeitsbescheinigung',
    type: 'clearanceCertificateDocs',
    fileName: `${date.formatDate(new Date, 'DD.MM.YY')}_Unbedenklichkeitsbescheinigung`
  },
  {
    label: 'Gewerbeanmeldung',
    type: 'businessRegistrationDocs',
    fileName: `${date.formatDate(new Date, 'DD.MM.YY')}_Gewerbeanmeldung`
  },
  {
    label: 'Bürgschaft',
    type: 'guaranteeDocs',
    fileName: `${date.formatDate(new Date, 'DD.MM.YY')}_Bürgschaft`
  },
  {
    label: 'Preisvereinbarungen',
    type: 'priceAgreementDocs',
    fileName: `${date.formatDate(new Date, 'DD.MM.YY')}_Preisvereinbarung`
  }
]

function getLegalEntityDocuments(){
  return legalEntityDocuments
}

function getDocumentStatusColor(dateString) {
  if(!dateString) return 'grey'
  // 1) Datum parsen (Tag.Monat.Jahr)
  const [day, month, year] = dateString
    .split('.')
    .map(s => Number(s.trim()));
  if ([day, month, year].some(isNaN)) {
    throw new Error(`Ungültiges Datum: "${dateString}"`);
  }

  // 2) Date-Objekte auf 00:00 setzen
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3) Differenz in Tagen
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((date - today) / msPerDay);
  // 4) Status zurückgeben
  if (diffDays < 0) {
    // Datum liegt in der Vergangenheit
    return 'red';
  }
  if (diffDays <= 28) {
    // Datum liegt heute oder innerhalb der nächsten 4 Wochen
    return 'orange';
  }
  // Datum liegt mehr als 4 Wochen in der Zukunft
  return 'positive';
}


export {
  mapOptionLabelLegalEntity,
  mapTradeLabelLegalEntity,
  getBusinessRelationLabel,
  getBusinessRelationOptions,
  getLegalTypeOptions,
  getLegalEntityPayload,
  getContactPersonPayload,
  getLegalEntityDocuments,
  getDocumentStatusColor
}