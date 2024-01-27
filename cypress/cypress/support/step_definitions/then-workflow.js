const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the workflow {string} must conclude in {string}', (workflowName, conclusion) => {
  const waitTimeCI = Cypress.env('WAIT_TIME_CI_WORKFLOW')
  const retryInterval = Cypress.env('API_RETRY_INTERVAL_MS')
  const maxTimeout = Cypress.env('API_RETRY_TIMEOUT_MS')
  const event = 'pull_request'
  const status = 'completed'

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, BRANCH, PR_HEAD_SHA } = sharedData
      const owner = OWNER
      const repo = REPO
      const branch = BRANCH
      const headSha = PR_HEAD_SHA
      cy
        .wait(waitTimeCI)
        .waitUntil(() => {
          return cy
            .getRuns({ owner, repo, branch, event, headSha, status })
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
            .getRuns({ owner, repo, branch, event, headSha, status })
            .then((runs) => {
              const commitValidationRun = runs.workflow_runs.find((run) => run.name === workflowName)
              expect(commitValidationRun.conclusion).to.equal(conclusion, `the ${workflowName} workflow must result in ${conclusion}`)
            })
        })
    })
})

Then('the next annotations must be listed:', (table) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, PR_HEAD_SHA } = sharedData
      cy
        .getCommitCheckRuns({ owner: OWNER, repo: REPO, commitId: PR_HEAD_SHA })
        .then((checkRuns) => {
          expect(checkRuns.length).to.equal(1, 'there must be only one check run')
          const checkRun = checkRuns[0]
          const checkRunId = checkRun.id
          cy
            .getCheckRunAnnotations({ owner: OWNER, repo: REPO, checkRunId })
            .then((annotations) => {
              const expectedAnnotations = table.rows().length
              expect(annotations.length).to.equal(expectedAnnotations, 'the number of annotations must match')

              table.rows().forEach((row) => {
                const annotationLevel = row[0]
                const title = row[1]
                const partialMessage = row[2]

                expect(
                  annotations.some((annotation) =>
                    annotation.title === title &&
                    annotation.message.includes(partialMessage) &&
                    annotation.annotation_level === annotationLevel))
                  .to.be.equal(true, `the annotation ${annotationLevel} ${title} ${partialMessage} must be present`)
              })
            })
        })
    })
})
