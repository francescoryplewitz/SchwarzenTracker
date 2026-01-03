const prisma = require('../data/prisma')
const LOG = new Logger('DOCUMENTS')
const fileHandler = require('../modules/file-handler/index')
const sharp = require('sharp')
const archiver = require('archiver')
const { addDescriptionToImages } = require('../modules/documents/image-description')
const {
  validateFileArrayObject,
  validateDocumentTarget,
  transformFiles,
  alterDuplicateFilenames,
  checkDocumentsTargetEntity,
  parseFiles,
  getDocumentCreationBase,
  transformFileName,
  getMediaTypeOfBuffer,
  isFileNameValid,
  setDocumentContentById
} = require('../modules/documents/helper')

const createDocument = async (req, res) => {
  const { type, files, target } = req.body

  if (!files || !type || !validateFileArrayObject(files) || !validateDocumentTarget(target)) return res.status(400).send('')

  const transformedDocuments = await transformFiles(parseFiles(files), type)
  LOG.debug(`Transformed documents. Object length ${transformedDocuments?.length}`)

  if (!Array.isArray(transformedDocuments)) {
    return res.status(400).send('Invalid document type')
  }

  const targetEntity = await checkDocumentsTargetEntity(target)
  if (!targetEntity) return res.status(400).send('Invalid target entity')

  const documentCreationBaseData = getDocumentCreationBase(target, type)

  const creations = await Promise.all(transformedDocuments.map(file => {
    return createDocumentInDb(Object.assign({}, documentCreationBaseData, {
      fileName: transformFileName(file.fileName)
    })
    )
  }))

  if (creations.filter(creation => creation === false)?.length > 0) return res.status(400).send()

  await Promise.all(transformedDocuments.map((file, index) => {
    return setDocumentContentById(creations[index].id, file.buffer, file.fileName)
  }))
  return res.status(201).send(creations)
}

const createDocumentInDb = async (data) => {
  try {
    const creation = await prisma.Document.create({
      data
    })
    return creation
  } catch (e) {
    LOG.error('Could not create document')
    LOG.error(`Error is ${e}`)
    return false
  }
}

const getDocumentContentById = async (req, res) => {
  const id = req.params.id
  const isPreview = req.query.isPreview === 'true'
  if (!id) return res.status(400).send('No documentId was provided')
  const document = await prisma.Document.findUnique({
    where: { id, uploadStatus: 'Complete' }
  })

  if (!document) return res.status(404).send()
  const content = await fileHandler.read(id)
  const mimeType = getMediaTypeOfBuffer(content)

  if (!isPreview || (mimeType !== 'png' && mimeType !== 'jpeg')) return res.status(200).send(content.toString('base64'))

  const thumbnail = await sharp(content)
    .resize({ width: 300 })
    .jpeg({ quality: 100 })
    .toBuffer()

  return res.status(200).send(thumbnail.toString('base64'))
}

const updateDocumentById = async (req, res) => {
  const id = req.params.id
  if (!id) return res.status(400).send('No documentId was provided')
  const { fileName, description, isRecent } = req.body
  if (!fileName && !description && isRecent === undefined) return res.status(400).send()

  if (fileName && !isFileNameValid(fileName)) return res.status(400).send()

  const document = await prisma.Document.findUnique({
    include: { type: true },
    where: {
      id
    }
  })
  if (!document) return res.status(200).send()
  const data = {
    ...fileName && { fileName: transformFileName(fileName) },
    ...description && { description },
    ...isRecent !== undefined && { isRecent }
  }

  // if (document.type.usesSharepointHandler && fileName && !isFileNameValid(fileName)) {
  //   return res.status(400).send()
  // }
  // if (document.type.usesSharepointHandler && fileName) {
  //   const webUrl = await updateDcoumentFileNameInSharepoint(document, transformFileName(fileName))
  //   webUrl && (data.sharepointLink = webUrl)
  // }
  await prisma.Document.update({
    where: {
      id
    },
    data
  })

  return res.status(200).send(data)
}

const updateDocumentContentById = async (req, res) => {
  const id = req.params.id
  if (!req.body.content) return res.status(400).send()
  const document = await prisma.Document.findUnique({
    where: {
      id
    }
  })
  if (!document) return res.status(404).send()
  const buffer = Buffer.from(req.body.content, 'base64')
  const mediaType = getMediaTypeOfBuffer(buffer)
  if (!mediaType) return res.status(400).send()

  const result = await fileHandler.save(id, buffer)
  if (!result) return res.status(400).send()

  return res.status(200).send()
}

const downloadDocumentsByIds = async (req, res) => {
  const toDownloadIds = req.query.ids ? req.query.ids.split(',') : null

  if (!toDownloadIds) return res.status(400).send()

  const documents = await prisma.Document.findMany({
    select: {
      id: true,
      fileName: true,
      description: true
    },
    where: {
      id: { in: toDownloadIds }
    }
  })
  if (documents.length !== toDownloadIds.length) return res.status(400).send()

  res.setHeader('Content-Disposition', 'attachment; filename="Dokumente.zip"')
  res.setHeader('Content-Type', 'application/zip')

  const archive = archiver('zip', { zlib: { level: 1 } }) // Mittelstarke Kompression
  archive.pipe(res)

  for (const document of documents) {
    document.content = await fileHandler.read(document.id)
    const documentWithDescription = alterDuplicateFilenames(await addDescriptionToImages([document]))[0]

    archive.append(documentWithDescription.content, {
      name: documentWithDescription.fileName,
      store: true
    })
  }
  archive.finalize()

  archive.on('error', (err) => {
    LOG.error('ZIP-Fehler:', err)
    res.status(400).send({ error: 'Fehler beim Erstellen des ZIP-Archivs' })
  })
}

const deleteDocumentById = async (req, res) => {
  const id = req.params.id
  if (!id) return res.status(400).send('No documentId was provided')
  const document = await prisma.Document.findUnique({
    where: {
      id
    }
  })
  if (!document) return res.status(200).send()

  const deletion = await Promise.all([
    fileHandler.delete(id),
    prisma.Document.delete({
      where: { id }
    })
  ])
  if (!deletion) return res.status(400).send('Could not delete document')
  return res.status(200).send()
}

module.exports = {
  createDocument,
  getDocumentContentById,
  updateDocumentById,
  updateDocumentContentById,
  downloadDocumentsByIds,
  deleteDocumentById
}
