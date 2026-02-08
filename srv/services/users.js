const prisma = require('../data/prisma')
const LOG = new Logger('USERS')
const { isSupportedLocale } = require('../common/locale')

const updateLocale = async (req, res) => {
  const userId = req.session.user.id
  const { locale } = req.body

  if (!isSupportedLocale(locale)) {
    LOG.info(`Unsupported locale ${locale} for user ${userId}`)
    return res.status(400).send({ error: 'Bitte wähle eine unterstützte Sprache' })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } })

    if (!existing) {
      LOG.info(`User ${userId} not found for locale update`)
      return res.status(404).send()
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { locale }
    })

    req.session.user.locale = updated.locale
    LOG.info(`Updated locale for user ${userId} to ${updated.locale}`)
    return res.status(200).send(updated)
  } catch (e) {
    LOG.error(`Could not update locale for user ${userId}: ${e}`)
    return res.status(400).send()
  }
}

module.exports = { updateLocale }
