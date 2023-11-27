const { validateChanges } = require('../../functions/validate-changes')
const fs = require('fs')

describe('Validate Changes', () => {
  const testDataContent = fs.readFileSync('./tests/functions/validate-changes.test.data.json')
  const testData = JSON.parse(testDataContent)
  const defaultConfigContent = fs.readFileSync('default-config.json')
  const defaultConfig = JSON.parse(defaultConfigContent)
  const supportedCommitTypes = Object.keys(defaultConfig.changeTypes)
  const scopesConfig = testData.scopesConfig
  const scenarios = testData.scenarios

  scenarios.filter(x => x.enabled).forEach(data => {
    const testName = `${data.scenario}\n` +
      `input:\n\t${JSON.stringify(data.input, null, 2)}\n` +
      `errors:\n\t${JSON.stringify(data.errors, null, 2)}`

    it(testName,
      () => {
        // arrange
        const changes = data.input.changes

        // act
        const errors = validateChanges(changes, supportedCommitTypes, scopesConfig)

        // assert
        // validate errors length
        expect(errors.length).toBe(data.errors.length)
        expect(errors[0].message).toBe(data.errors[0])
      })
  })
})
