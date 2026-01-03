const prisma = require('./prisma')
const fs = require('fs')
const path = require('path')

// Hilfsfunktionen zum Laden der JSON-Dateien
const loadDirectory = (dir) => {
  const files = fs.readdirSync(path.resolve(__dirname, `./${dir}`))
  return files.map(file => {
    const filePath = path.resolve(__dirname, `./${dir}/${file}`)
    if (!fs.statSync(filePath).isFile()) return undefined
    const data = fs.readFileSync(filePath)
    return {
      [file.split('.')[0]]: JSON.parse(data.toString())
    }
  }).filter(Boolean)
}

const mapFiles = (dir) => {
  return loadDirectory(dir).reduce((acc, file) => {
    const key = Object.keys(file)[0]
    acc[key] = file[key]
    return acc
  }, {})
}

// Datenbank-Operationen
const resetEntities = () => {
  return prisma.$transaction([
    prisma.personsOnLegalEntities.deleteMany({}),
    prisma.person.deleteMany({}),
    prisma.legalEntity.deleteMany({}),
    prisma.User.deleteMany({})
  ])
}

const insertMockData = (files) => {
  return prisma.$transaction([
    prisma.user.createMany({ data: files.user })
  ])
}

const upsertData = (data) => {
  if (Object.keys(data).length === 0) return
  return prisma.$transaction(
    Object.entries(data)
      .flatMap(([key, values]) =>
        values.map(value =>
          prisma[key].upsert({
            where: { id: value.id },
            update: value,
            create: value
          })
        )
      )
  )
}

// Definition der Klasse
class DataGenerator {
  constructor () {
    this.mockdata = mapFiles('mockdata')
    this.structuredata = mapFiles('structuredata')
  }

  async init () {
    await upsertData(this.structuredata)
  }

  async resetMockdata () {
    await resetEntities()
    await upsertData(this.structuredata)
    await insertMockData(this.mockdata)
  }

  async reset () {
    await resetEntities()
  }
}

module.exports = new DataGenerator()
