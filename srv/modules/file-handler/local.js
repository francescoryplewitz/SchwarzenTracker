const fs = require('fs')
const path = require('path')

const createDirectory = () => {
  const localPath = path.resolve(__dirname, `../../../.local-development/${env.localFileStorage}`)
  if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath)
  }
}

const saveDocument = (id, file) => {
  createDirectory()
  fs.writeFileSync(path.resolve(__dirname, `../../../.local-development/${env.localFileStorage}/${id}.pdf`), file)
  return true
}

const readDocument = (id) => {
  createDirectory()
  const documentPath = path.resolve(__dirname, `../../../.local-development/${env.localFileStorage}/${id}.pdf`)
  if (!fs.existsSync(documentPath)) {
    if (process.env.NODE_ENV === 'development') {
      return fs.readFileSync(path.resolve(__dirname, '../../static/static-image.jpg'))
    }
    return false
  }

  return fs.readFileSync(documentPath)
}
const deleteDocument = (id) => {
  const deletePath = path.resolve(__dirname, `../../../.local-development/${env.localFileStorage}/${id}.pdf`)
  createDirectory()
  if (!fs.existsSync(deletePath)) return true
  fs.unlinkSync(deletePath)
  return true
}

module.exports = {
  saveDocument,
  readDocument,
  deleteDocument
}
