const { buildNextReleases } = require('../../functions/build-next-releases')
const fs = require('fs')
const yml = require('js-yaml')

jest.mock('fs', () => {
  return {
    __esModule: true,
    readFileSync: jest.fn(),
    existsSync: jest.fn()
  }
})

describe('index.js Happy Paths', () => {
  const originalModule = jest.requireActual('fs')
  const testDataContent = originalModule.readFileSync('./tests/functions/build-next-releases.data.json')
  const testData = JSON.parse(testDataContent)

  testData
    .filter(x => x.enabled)
    .forEach(data => {
      it(data.scenario, () => {
      // arrange
        fs.existsSync = (filePath) => data.files[filePath] !== undefined
        fs.readFileSync = (filePath) => data.files[filePath]
        const configPath = data.configuration || 'default-config.yml'
        const configContent = originalModule.readFileSync(configPath)
        const conf = yml.load(configContent)

        // act
        const nextRelease = buildNextReleases(conf, data.changes)

        // assert
        expect(nextRelease).toEqual(data.result)
      })
    })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
