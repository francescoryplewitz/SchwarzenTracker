const axios = require('axios')
const LOG = new Logger('AXIOS')

module.exports = async (params) => {
  return await axios(params).catch(e => {
    LOG.alert('Axios Error')
    LOG.info('----------------------------------------------------------')
    console.log(`Request failed with status "${e.response?.status}"`)
    console.log(`Message is "${e.message}"`)
    console.log(`Path was: "${e.request?.path}"`)
    console.log(`Method was: "${e.request?.method}"`)
    console.log(`Response data was: "${e.response?.data ? JSON.stringify(e.response.data) : 'No Data'}"`)
    LOG.info('----------------------------------------------------------')
    return false
  })
}
