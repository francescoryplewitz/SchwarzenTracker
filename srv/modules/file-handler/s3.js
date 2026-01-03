const LOG = new Logger('S3')
const fs = require('fs')
const path = require('path')

const aws = require('aws-sdk')
const credentials = new aws.Credentials(
  env.aws.clientId,
  env.aws.clientSecret
)
aws.config.update({
  region: 'eu-central-1',
  credentials
})
const s3Handler = new aws.S3()

const saveDocument = (id, file) => {
  LOG.info(`Save Document Buffer Size is: ${file.byteLength}`)
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: env.aws.s3Bucket,
      Key: id,
      Body: file
    }
    LOG.debug(`Save file to bucket: ${env.aws.s3Bucket}`)
    s3Handler.upload(params, function (error) {
      if (error) {
        LOG.debug(`Error when uploading: ${JSON.stringify(error)}`)
        reject(id)
      } else {
        resolve(id)
      }
    })
  })
}

const readDocument = (id) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: env.aws.s3Bucket,
      Key: id
    }
    s3Handler.getObject(params, function (error, data) {
      if (error) {
        LOG.debug(`Error when reading: ${JSON.stringify(error)}`)
        resolve(fs.readFileSync(path.resolve(__dirname, '../../static/not-found.png')))
      } else {
        resolve(data?.Body)
      }
    })
  })
}
const deleteDocument = (id) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: env.aws.s3Bucket,
      Key: id
    }
    s3Handler.deleteObject(params, function (error, data) {
      if (error) {
        LOG.debug(`Error when deleting: ${JSON.stringify(error)}`)
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

module.exports = {
  saveDocument,
  readDocument,
  deleteDocument
}
