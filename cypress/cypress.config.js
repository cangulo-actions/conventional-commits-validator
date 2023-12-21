const { defineConfig } = require('cypress')
const consoleLogReporter = require('cypress-terminal-report/src/installLogsPrinter')

const {
  addCucumberPreprocessorPlugin
} = require('@badeball/cypress-cucumber-preprocessor')
const {
  preprocessor
} = require('@badeball/cypress-cucumber-preprocessor/browserify')

const sharedData = {}

async function setupNodeEvents (on, config) {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config)
  consoleLogReporter(on)
  on('file:preprocessor', preprocessor(config))
  on('task', {
    appendSharedData: (keyvalue) => {
      const [key, value] = keyvalue.split('=')
      sharedData[key] = value
      return sharedData
    },
    getSharedDataByKey: (key) => {
      return sharedData[key]
    },
    getSharedData: () => {
      return sharedData
    }
  })

  // Make sure to return the config object as it might have been modified by the plugin.
  return config
}

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://duckduckgo.com',
    specPattern: '**/*.feature',
    setupNodeEvents
  },
  screenshotOnRunFailure: false
})
