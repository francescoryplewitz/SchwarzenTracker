// const LOG = new Logger('HELPER')
const self = (module.exports = {
  proceedDataStream: async (stream) => {
    if (typeof stream.on !== 'function') return Buffer.from(stream, 'base64')
    return new Promise((resolve, reject) => {
      const tmpBuffer = []
      stream.on('data', (chunk) => {
        tmpBuffer.push(chunk)
      })
      stream.on('end', async () => {
        resolve(Buffer.from(Buffer.concat(tmpBuffer).buffer))
      })
      stream.on('error', async (error) => {
        reject(new Error(`Upload failed: ${error}`))
      })
    })
  },
  resolvePromiseObject: async (data) => {
    return self.zipObject(
      Object.keys(data),
      await Promise.all(Object.values(data))
    )
  },
  zipObject: (keys, values) => {
    return keys.reduce(
      (others, key, index) => ({
        ...others,
        [key]: values[index]
      }),
      {}
    )
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
  isIsoTimestamp: (str) => {
    if (typeof str !== 'string' || str.length > 29) {
      return false
    }
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/
    if (!isoRegex.test(str)) {
      return false
    }
    const date = new Date(str)
    return !isNaN(date.getTime())
  },
  buildEntitySearch: (search, where, searchQueryMethod) => {
    if (!where.AND) {
      where.AND = []
    }
    const inputs = search.split(' ')
    where.AND.push(...inputs.map(input => {
      if (!input) return null
      return { OR: searchQueryMethod(input) }
    }).filter(el => el))
  }
})
