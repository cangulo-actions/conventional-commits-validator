import { AfterAll } from '@badeball/cypress-cucumber-preprocessor'

AfterAll(function () {
  const prepareRepoEnabled = Cypress.env('AFTER_ALL_PREPARE_REPO_ENABLED')
  const closePRsEnabled = Cypress.env('AFTER_ALL_CLOSE_ANY_PR')

  if (prepareRepoEnabled) {
    const waitTimeWorkflow = Cypress.env('GH_WORKFLOW_PREPARE_REPO_TIMEOUT')
    const ccBranchName = 'main'
    const workflowId = 'prepare-cc-tests.yml'
    const workflowParams = {
      ref: 'main',
      inputs: {
        'cc-version': ccBranchName,
        'enable-ci-workflow': false
      }
    }

    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy
      .triggerWorkflow({ workflowId, workflowParams })
      .wait(waitTimeWorkflow)
  } else {
    console.log('trigger reset repo workflow skipped')
  }

  if (closePRsEnabled) {
    // if any PR is pending because of a previous failing execution, close it
    cy.closeAnyPendingPR()
  }
})
