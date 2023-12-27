const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the workflow {string} must conclude in {string}', (workflowName, conclusion) => {
  const waitTimeCI = Cypress.env('WAIT_TIME_CI_WORKFLOW')
  const retryInterval = Cypress.env('API_RETRY_INTERVAL_MS')
  const maxTimeout = Cypress.env('API_RETRY_TIMEOUT_MS')
  const branch = Cypress.env('BRANCH_TO_CREATE')
  const event = 'pull_request'
  const status = 'completed'

  cy
    .task('getSharedDataByKey', 'PR_HEAD_SHA')
    .then((prHeadSHA) => {
      const headSha = prHeadSHA
      cy
        .wait(waitTimeCI)
        .waitUntil(() => {
          return cy
            .getRuns({ branch, event, headSha, status })
            .then((runs) => {
              return runs.workflow_runs.find((run) => run.name === workflowName) !== undefined
            })
        }, {
          interval: retryInterval,
          timeout: maxTimeout,
          errorMsg: `The ${workflowName} workflow did not finish in time.`
        })
        .then(() => {
          cy
            .getRuns({ branch, event, headSha, status })
            .then((runs) => {
              const commitValidationRun = runs.workflow_runs.find((run) => run.name === workflowName)
              expect(commitValidationRun.conclusion).to.equal(conclusion, `the CI workflow must result in ${conclusion}`)
            })
        })
    })
})

Then('I close the PR', () => {
  cy
    .task('getSharedDataByKey', 'PR_NUMBER')
    .then((prNumber) => {
      cy
        .closePR(prNumber)
    })
})
