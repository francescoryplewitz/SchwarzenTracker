import { LocalStorage } from 'quasar'

const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles]
    }
    let user = LocalStorage.getItem('user')
    let output = false
    if (!user?.roles) return
    user.roles.forEach(role => {
      if (roles.includes(role)) output = true
    })
    return output
}
  
function mailTo(email) { window.open(`mailto:${email}`, '_self') }

function phoneTo(phone) { window.open(`tel:${phone}`, '_self') }

function openInMaps(address) {
  const encodedAddress = encodeURIComponent(address)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  window.open(mapsUrl, '_blank')
}
function isOdd(num) { return num % 2 }

function copyToClipboard(value) {
  navigator.clipboard.writeText(value)
}

function downloadFileFromBase64(data, fileName) {
  const binaryString = atob(data);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
  }
  return startDownload(uint8Array, fileName)
}
function startDownload(data, fileName) {
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('target', '_blank')
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
}

function getChecksumOfObject(object, blacklist=[]){
  const copy = Object.assign({},object)
  blacklist.forEach(property=> {delete copy[property]})
  return JSON.stringify(copy)
}

export { 
  hasRole,
  mailTo,
  phoneTo,
  openInMaps,
  isOdd,
  copyToClipboard,
  downloadFileFromBase64,
  getChecksumOfObject
  }