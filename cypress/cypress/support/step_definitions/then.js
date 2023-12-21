const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the CI workflow triggered must succeed', () => {
  const waitTimeCI = Cypress.env('WAIT_TIME_CI_WORKFLOW')
  const retryInterval = Cypress.env('API_RETRY_INTERVAL_MS')
  const maxTimeout = Cypress.env('API_RETRY_TIMEOUT_MS')
  const checkName = 'test cangulo-actions/conventional-commits-validator' // must match the job name in the ci.yml workflow
  const status = 'completed'

  cy
    .task('getSharedDataByKey', 'PR_HEAD_SHA')
    .then((prHeadSHA) => {
      cy
        .wait(waitTimeCI)
        .waitUntil(() => {
          return cy
            .getCommitCheckRuns({ commitId: prHeadSHA, checkName, status })
            .then((checkRuns) => checkRuns.length === 1)
        }, { interval: retryInterval, timeout: maxTimeout, errorMsg: 'The CI workflow did not finish in time.' })
        .then(() => {
          cy
            .getCommitCheckRuns({ commitId: prHeadSHA, checkName, status })
            .then((checkRuns) => {
              expect(checkRuns[0].conclusion).to.equal('success', 'the CI workflow must succeed.')
              cy
                .task('getSharedDataByKey', 'PR_NUMBER')
                .then((prNumber) => {
                  cy
                    .closePR(prNumber)
                })
            })
        })
    })
})
