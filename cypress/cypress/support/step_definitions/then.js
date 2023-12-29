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

Then('the workflow must show {string} annotations', (numberOfAnnotations) => {
  const expectedCheckRunStatus = 'completed'
  const expectedCheckRunConclusion = 'success'

  cy
    .task('getSharedDataByKey', 'PR_HEAD_SHA')
    .then((prHeadSHA) => {
      cy
        .getCommitCheckRuns(prHeadSHA)
        .then(checkRuns => {
          expect(checkRuns.length)
            .to.equal(1, 'there must be only one check run')

          const commitValidationCheck = checkRuns[0]
          expect(commitValidationCheck.status)
            .to.equal(expectedCheckRunStatus, `the check run must be ${expectedCheckRunStatus}`)
          expect(commitValidationCheck.conclusion)
            .to.equal(expectedCheckRunConclusion, `the check run must have ${expectedCheckRunConclusion} conclusion`)

          const checkRunId = commitValidationCheck.id
          cy
            .getCheckRunAnnotations(checkRunId)
            .then(annotations => {
              expect(annotations.length)
                .to.equal(parseInt(numberOfAnnotations), `the check run must have ${numberOfAnnotations} annotations`)

              const annotationsJSON = JSON.stringify(annotations)
              cy.task('appendSharedData', `ANNOTATIONS=${annotationsJSON}`)
            })
        })
    })
})

Then('this annotation is of type {string}, has title {string} and its message includes {string}', (level, title, partialMsg) => {
  cy
    .task('getSharedDataByKey', 'ANNOTATIONS')
    .then((annotationsJSON) => {
      const annotations = JSON.parse(annotationsJSON)
      ensureValidationExists(annotations, level, title, partialMsg)
    })
})

Then('The next annotations must be listed', (table) => {
  cy
    .task('getSharedDataByKey', 'ANNOTATIONS')
    .then((annotationsJSON) => {
      const annotations = JSON.parse(annotationsJSON)
      table
        .rows()
        .forEach(row => {
          const level = row[0]
          const title = row[1]
          const partialMsg = row[2]
          ensureValidationExists(annotations, level, title, partialMsg)
        })
    })
})

function ensureValidationExists (annotations, level, title, partialMsg) {
  const annotation = annotations.find(annotation =>
    annotation.annotation_level === level &&
    annotation.title === title &&
    annotation.message.includes(partialMsg)
  )

  // eslint-disable-next-line no-unused-expressions
  expect(annotation, `there must be one annotation of level ${level} with title ${title} and a message that includes ${partialMsg}`)
    .not.to.be.undefined
}

Then('The PR must include the label {string}', (label) => {
  cy
    .task('getSharedDataByKey', 'PR_NUMBER')
    .then((prNumber) => {
      cy
        .getPR(prNumber)
        .then((pr) => {
          const prLabels = pr.labels.map(label => label.name)
          expect(prLabels).to.include(label, `the PR must include the label ${label}`)
        })
    })
})

Then('The PR must include the labels', (table) => {
  cy
    .task('getSharedDataByKey', 'PR_NUMBER')
    .then((prNumber) => {
      cy
        .getPR(prNumber)
        .then((pr) => {
          const prLabels = pr.labels.map(label => label.name)
          table
            .rows()
            .forEach(row => {
              const label = row[0]
              expect(prLabels).to.include(label, `the PR must include the label ${label}`)
            })
        })
    })
})
