const { buildNextReleases } = require('../../functions/build-next-releases')
const fs = require('fs')
const yml = require('js-yaml')
const Ajv = require('ajv')

jest.mock('fs', () => {
  return {
    __esModule: true,
    readFileSync: jest.fn(),
    existsSync: jest.fn()
  }
})

describe('index.js Happy Paths', () => {
  const originalModule = jest.requireActual('fs')
  const testDataContent = originalModule.readFileSync('./tests/functions/build-next-releases.test.data.json')
  const testData = JSON.parse(testDataContent)
  const ajv = new Ajv({ useDefaults: true }) // add default values to the config properties
  const schemaPath = 'config.schema.yml'
  const schemaContent = originalModule.readFileSync(schemaPath)
  const schema = yml.load(schemaContent)
  const validate = ajv.compile(schema)

  testData
    .filter(x => x.enabled)
    .forEach(data => {
      it(data.scenario, () => {
        // arrange
        fs.existsSync = (filePath) => data.files[filePath] !== undefined
        fs.readFileSync = (filePath) => data.files[filePath]

        let config = {} // default config
        if (data.configuration) {
          const configContent = originalModule.readFileSync(data.configuration)
          config = yml.load(configContent)
        }

        const valid = validate(config) // add the default values to the config
        if (!valid) {
          const errorsJson = JSON.stringify(validate.errors, null, 2)
          throw new Error(`Invalid configuration:\n${errorsJson}`)
        }

        // act
        const nextRelease = buildNextReleases(config, data.changes)

        // assert
        expect(nextRelease).toEqual(data.result)
      })
    })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
