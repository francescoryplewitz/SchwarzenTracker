function generateRandomString (length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function getRandomIntInclusive(min=0, max=999) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatObject(object){
  if(typeof object === 'object') return JSON.stringify(object)
  return ''
}

module.exports = {
  generateRandomString,
  getRandomIntInclusive,
  formatObject
}
