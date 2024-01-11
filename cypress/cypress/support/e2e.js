const consoleReporter = require('cypress-terminal-report/src/installLogsCollector')

consoleReporter()

// commands
require('cypress-wait-until')

// TODO: make this iterate over all *.js files in commands folder

require('./commands/gh-api-actions-runs')
require('./commands/gh-api-branches')
require('./commands/gh-api-check-runs')
require('./commands/gh-api-commits')
require('./commands/gh-api-content')
require('./commands/gh-api-pulls')
require('./commands/gh-api-repos')
