const LOG = new Logger('DOCUMENTS')
const prisma = require('../../data/prisma')
const fileHandler = require('../file-handler/index')

const self = (module.exports = {
  validateFileArrayObject: (files) => {
    return files.every(file => {
      if (!file.content && typeof file.content !== 'string') return false
      const content = file.content.split(',')[1]
      return content && file.fileName && self.isFileNameValid(file.fileName) && typeof file.fileName === 'string' && file.fileName.length < 200
    })
  },
  isFileNameValid: (text) => {
    if (typeof text !== 'string') {
      return false
    }
    if (text.includes('/')) {
      return false
    }
    if (/(?:^\s|\s$)/.test(text)) {
      return false
    }
    return true
  },
  validateDocumentTarget: (target) => {
    if (!target || typeof target !== 'object') return
    return 'id' in target && 'entity' in target && ['LegalEntity'].includes(target.entity)
  },
  transformFiles: async (files, type) => {
    const transformedDocuments = await Promise.all(files.map(file => {
      return self.proceedDocumentContent(file.buffer, file.fileName, type)
    }))
    let error = false
    transformedDocuments.forEach((doc, index) => {
      if (!doc.proceededBuffer) {
        error = true
      }
      if (doc.hadConversion) {
        files[index].fileName = doc.convertedFileName
      }
      files[index].buffer = doc.proceededBuffer
    })
    return error || files
  },
  proceedDocumentContent: async (buffer) => {
    const mediaType = self.getMediaTypeOfBuffer(buffer)
    if (['pdf', 'eml', 'office'].includes(mediaType)) return { proceededBuffer: buffer, hadConversion: false }

    if (['png', 'jpeg'].includes(mediaType)) {
      return { proceededBuffer: buffer }
    }
    return { proceededBuffer: null }
  },
  checkIfEml: (buffer) => {
    const indicators = ['From:', 'To:', 'Subject:', 'Date:']
    const content = buffer.toString('utf8')
    return indicators.reduce((isEml, indicator) => {
      if (!content.includes(indicator)) {
        return false
      }
      return isEml
    }, true)
  },
  getMediaTypeOfBuffer: (buffer) => {
    const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF]) // JPEG
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47]) // PNG

    const officeZipHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04]) // PKZIP (für .xlsx, .pptx, .docx)
    const officeOldHeader = Buffer.from([0xD0, 0xCF, 0x11, 0xE0]) // Compound File (für .xls, .ppt, .doc)

    const bufferHeader = buffer.slice(0, 4)

    if (bufferHeader.compare(pdfHeader) === 0) return 'pdf'
    if (bufferHeader.compare(jpegHeader, 0, 3, 0, 3) === 0) return 'jpeg'
    if (bufferHeader.compare(pngHeader) === 0) return 'png'
    if (bufferHeader.compare(officeZipHeader) === 0) return 'office'
    if (bufferHeader.compare(officeOldHeader) === 0) return 'office'
    if (self.checkIfEml(buffer)) return 'eml'
  },
  alterDuplicateFilenames: (documents) => {
    const fileNames = documents.reduce((acc, document) => {
      if (!acc[document.fileName]) {
        acc[document.fileName] = []
      }
      acc[document.fileName].push(document)
      return acc
    }, {})

    return Object.entries(fileNames).map(([key, value]) => {
      if (value.length === 1) return value[0]
      return self.uniquefyFilenames(key, value)
    }).flat()
  },
  uniquefyFilenames: (fileName, documents) => {
    const fileNameSplit = fileName.split('.')
    return documents.map((document, index) => {
      document.fileName = `${fileNameSplit[0]}_${index}.${fileNameSplit[1]}`
      return document
    })
  },
  parseFiles: (files) => {
    return files.map(file => {
      return {
        fileName: file.fileName,
        buffer: Buffer.from(file.content.split(',')[1], 'base64')
      }
    })
  },
  checkDocumentsTargetEntity: async (target) => {
    const targetEntity = await prisma[target.entity].findUnique({
      where: {
        id: target.id
      }
    })
    LOG.debug(`Upload document: Found ${target.entity}: ${JSON.stringify(targetEntity)}`)
    return targetEntity
  },

  getDocumentCreationBase: (target, type) => {
    const documentCreationBaseData = {
      documentTypeId: type
    }
    if (target.entity === 'LegalEntity') {
      documentCreationBaseData.legalEntityId = target.id
    }
    return documentCreationBaseData
  },
  transformFileName: (fileName) => {
    const splitted = fileName.split('.')
    splitted[splitted.length - 1] = splitted[splitted.length - 1].toLowerCase()
    return splitted.join('.').replace(/\//g, '_')
  },
  setDocumentContentById: async (id, buffer, fileName) => {
    const result = await fileHandler.save(id, buffer)
    LOG.debug(`Filehandler save result: ${result}`)
    if (!result) return false

    await prisma.Document.update({
      where: {
        id
      },
      data: {
        uploadStatus: 'Complete',
        fileName
      }
    })
    return true
  }
})
