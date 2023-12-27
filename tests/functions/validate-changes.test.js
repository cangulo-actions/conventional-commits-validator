const { validateChanges } = require('../../functions/validate-changes')
const fs = require('fs')
const yml = require('js-yaml')
const Ajv = require('ajv')

describe('Validate Changes', () => {
  const testDataContent = fs.readFileSync('./tests/functions/validate-changes.test.data.json')
  const testData = JSON.parse(testDataContent)
  const ajv = new Ajv({ useDefaults: true }) // add default values to the config properties
  const schemaPath = 'config.schema.yml'
  const schemaContent = fs.readFileSync(schemaPath)
  const schema = yml.load(schemaContent)
  const validate = ajv.compile(schema)

  testData
    .filter(x => x.enabled)
    .forEach(data => {
      it(data.scenario,
        () => {
          // arrange
          let config = {} // default config
          if (data.configuration) {
            const configContent = fs.readFileSync(data.configuration)
            config = yml.load(configContent)
          }

          const valid = validate(config) // add the default values to the config
          if (!valid) {
            const errorsJson = JSON.stringify(validate.errors, null, 2)
            throw new Error(`Invalid configuration:\n${errorsJson}`)
          }
          const supportedCommitTypes = config.commits.map(x => x.type)
          const scopesConfig = config.scopes

          const changes = data.input.changes

          // act
          const errors = validateChanges(changes, supportedCommitTypes, scopesConfig)

          // assert
          expect(errors.length).toEqual(data.errorMessages.length)
          if (errors.length > 0) {
            errors.forEach((error, index) => {
              expect(error.message).toEqual(data.errorMessages[index])
            })
          }
        })
    })
})
