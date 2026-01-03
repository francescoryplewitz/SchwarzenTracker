const { ToadScheduler } = require('toad-scheduler')
const path = require('path')
const fs = require('fs')
const LOG = new Logger('JOBS')

const scheduler = new ToadScheduler()

const registerIntervalJobs = () => {
  fs.readdir(path.resolve(__dirname, './interval'), function (err, files) {
    if (err) {
      return LOG.error('Unable to scan directory: ' + err)
    }
    files.forEach(function (file) {
      const job = require(path.join(__dirname, './interval', file))
      LOG.info(`Schedule interval job: ${file}`)
      scheduler.addIntervalJob(job)
    })
  })
}

const registerCrownJobs = () => {
  if (env.jobs?.run !== 'true') return
  fs.readdir(path.resolve(__dirname, './crown'), function (err, files) {
    if (err) {
      return LOG.error('Unable to scan directory: ' + err)
    }
    files.forEach(function (file) {
      require(path.join(__dirname, '../crown', file))()
      LOG.info(`Schedule crown job: ${file}`)
    })
  })
}

const registerJobs = () => {
  if (env.jobs?.run !== 'true') return
  registerIntervalJobs()
  registerCrownJobs()
}

module.exports = registerJobs()
