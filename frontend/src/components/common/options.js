const federalStateOptions = [
 { label: "Baden-Württemberg", value: "DE-BW" },
{ label: "Bayern", value: "DE-BY" },
{ label: "Berlin", value: "DE-BE" },
{ label: "Brandenburg", value: "DE-BB" },
{ label: "Bremen", value: "DE-HB" },
{ label: "Hamburg", value: "DE-HH" },
{ label: "Hessen", value: "DE-HE" },
{ label: "Mecklenburg-Vorpommern", value: "DE-MV" },
{ label: "Niedersachsen", value: "DE-NI" },
{ label: "Nordrhein-Westfalen", value: "DE-NW" },
{ label: "Rheinland-Pfalz", value: "DE-RP" },
{ label: "Saarland", value: "DE-SL" },
{ label: "Sachsen", value: "DE-SN" },
{ label: "Sachsen-Anhalt", value: "DE-ST" },
{ label: "Schleswig-Holstein", value: "DE-SH" },
{ label: "Thüringen", value: "DE-TH" }
]

const tradeOptions = [
  { label: 'Erdbauarbeiten', value: 'earthwork' },
  { label: 'Maurer- und Betonarbeiten', value: 'bricklayer' },
  { label: 'Dachdecker- und Klempnerarbeiten', value: 'roofer' },
  { label: 'Dämm- und Putzarbeiten', value: 'insulation' },
  { label: 'Elektroarbeiten', value: 'electric' },
  { label: 'Heizungs- und Sanitärarbeiten', value: 'heating' },
  { label: 'Anstrich- und Malerarbeiten', value: 'painting' },
  { label: 'Solateur', value: 'solateur' },
  { label: 'Trockenbauarbeiten', value: 'dryConstruction' },
  { label: 'Fensterarbeiten', value: 'windowConstruction' },
  { label: 'Tischlerarbeiten', value: 'carpenter' },
  { label: 'Gerüstbauarbeiten', value: 'scaffolding' },
  { label: 'Estricharbeiten', value: 'screed' },
  { label: 'Entsorgung', value: 'disposal' },
  { label: 'Fliesen', value: 'tiling' },
  { label: 'Gebäudereinigung', value: 'buildingCleaning' },
  { label: 'Blower Door Test', value: 'blowerDoorTest' },
  { label: 'Innentreppe', value: 'interiorStairs' },
  { label: 'Sonstiges', value: 'miscellaneous' },
  { label: 'Bauleistungen', value: 'constructionServices' },
  { label: 'Klinker', value: 'clinker' },
  { label: 'Parkett', value: 'parquet' },
  { label: 'Geländer', value: 'railings' },
  { label: 'Schlosser', value: 'metalwork' },
  { label: 'Garage/Sektionaltor', value: 'garageSectionalDoor' },
  { label: 'Erschließung', value: 'siteDevelopment' },
  { label: 'Zimmerei', value: 'carpentry' }
]
const titleOptions =  [
  { label: 'Herr', value: 'Herr' },
  { label: 'Frau', value: 'Frau' }
]


function getTradeOptions  (){return tradeOptions}

function getFederalStateOptions (){return federalStateOptions}

function getTitleOptions(){return titleOptions}

function mapFederalStateLabel(value) {
  if (value !== null) {
    let federalState = federalStateOptions.find(state => state.value === value)
    return federalState?.label
  }
}

export {
  getTradeOptions,
  getFederalStateOptions,
  mapFederalStateLabel,
  getTitleOptions
}