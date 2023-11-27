const { Index } = require('../../index')
const core = require('@actions/core')
const fs = require('fs')

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  startGroup: jest.fn(),
  info: jest.fn(),
  endGroup: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  summary: {
    addHeading: jest.fn().mockReturnThis(),
    addList: jest.fn().mockReturnThis(),
    addSeparator: jest.fn().mockReturnThis(),
    addCodeBlock: jest.fn().mockReturnThis(),
    write: jest.fn()
  }
}))

jest.mock('fs', () => {
  return {
    __esModule: true,
    readFileSync: jest.fn(),
    existsSync: jest.fn()
  }
})

describe('index.js Happy Paths', () => {
  const originalModule = jest.requireActual('fs')
  const testDataContent = originalModule.readFileSync('./tests/index/index.test.data.json')
  const testData = JSON.parse(testDataContent)

  testData.filter(x => x.enabled).forEach(data => {
    const testName = `${data.scenario}\n` +
      `inputs:\n\t${JSON.stringify(data.inputs, null, 2)}\n` +
      `outputs:\n\t${JSON.stringify(data.outputs, null, 2)}`

    it(testName, () => {
      // arrange
      fs.existsSync = (filePath) => data.files[filePath] !== undefined
      fs.readFileSync = (filePath) => data.files[filePath]
      const conf = JSON.parse(originalModule.readFileSync(data.configuration))
      const { commits } = data.inputs

      if (data.throwException) {
        // act
        Index(core, conf, commits)

        // assert
        expect(core.setFailed).toHaveBeenCalledTimes(1)
      } else {
        // act
        Index(core, conf, commits)

        // assert
        const numOutputs = Object.keys(data.outputs).length
        expect(core.setOutput).toHaveBeenCalledTimes(numOutputs)
        core.setOutput.mock.calls.forEach(([key, value]) => {
          expect(value).toEqual(data.outputs[key])
        })
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
