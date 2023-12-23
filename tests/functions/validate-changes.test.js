const { validateChanges } = require('../../functions/validate-changes')
const fs = require('fs')
const yml = require('js-yaml')

describe('Validate Changes', () => {
  const testDataContent = fs.readFileSync('./tests/functions/validate-changes.test.data.json')
  const testData = JSON.parse(testDataContent)

  testData
    .filter(x => x.enabled)
    .forEach(data => {
      it(data.scenario,
        () => {
        // arrange
          const configPath = data.configuration || 'config.default.yml'
          const configContent = fs.readFileSync(configPath)
          const conf = yml.load(configContent)
          const supportedCommitTypes = conf.commits.map(x => x.type)
          const scopesConfig = conf.scopes || []

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
