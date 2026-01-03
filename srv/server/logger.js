function processTextObject (text) {
  const copy = {}
  for (const key in text) {
    const value = text[key]
    const type = typeof text[key]

    if (type === 'string') {
      copy[key] = value.length <= 50 ? value : value.substring(0, 50) + '...'
      continue
    }
    if (type === 'object' || Array.isArray(text[key])) {
      const stringified = JSON.stringify(value)
      copy[key] = stringified.length <= 50 ? stringified : stringified.substring(0, 50) + '...'
      continue
    }
  }
  return JSON.stringify(copy)
}

function processText (text) {
  if (typeof text === 'string' || typeof text === 'number') return text.length <= 200 ? text : text.substring(0, 200) + '...'

  if (Array.isArray(text)) {
    return JSON.stringify(text)
  }

  return processTextObject(text)
}

class logger {
  constructor (module) {
    this.module = module
  }

  info (text) {
    return this.log('INFO', text)
  }

  warn (text) {
    if (env.log.level < 2) return
    return this.log('WARN', text)
  }

  debug (text) {
    if (env.log.level < 3) return
    return this.log('DEBUG', text)
  }

  error (text) {
    if (env.log.level < 3) return
    return this.log('ERROR', text)
  }

  http (req) {
    console.table(
      [
        { REQUEST: `${req.method} on ${req.path}`, Body: `${processText(req.body)}`, Query: `${processText(req.query)}`, Params: `${processText(req.params)}` }
      ]
    )
  }

  alert (text) {
    return this.log('ALERT', text)
  }

  log (type, text, module = this.module) {
    const begin = `[${type}]`.padEnd(10, ' ')
    console.log(`${begin} - [${module}]: ${processText(text)}`)
  }
}
module.exports = logger
