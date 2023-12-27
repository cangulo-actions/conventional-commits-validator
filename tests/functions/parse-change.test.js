const { parseChange } = require('../../functions/parse-change')
const yml = require('js-yaml')
const fs = require('fs')
const Ajv = require('ajv')

const testDataContent = fs.readFileSync('./tests/functions/parse-change.test.data.json')
const testData = JSON.parse(testDataContent)

const ajv = new Ajv({ useDefaults: true })
const schemaPath = 'config.schema.yml'
const schemaContent = fs.readFileSync(schemaPath)
const schema = yml.load(schemaContent)
const validate = ajv.compile(schema)
const config = {}
validate(config) // add the default values to the config

describe('changes are properly parsed', () => {
  // arrange
  const changeTypes = config.commits

  testData.forEach(data => {
    it(`change:\n\t${data.input}\nis parsed into:\n\t${JSON.stringify(data.output, null, 2)}`,
      () => {
        // act
        const change = parseChange(data.input, changeTypes)
        // assert
        expect(change).toEqual(data.output)
      })
  })
})
