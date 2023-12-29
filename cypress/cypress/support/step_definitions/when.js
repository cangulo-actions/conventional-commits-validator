const { When } = require('@badeball/cypress-cucumber-preprocessor')

When('I create a PR with title {string}', (title) => {
  const ccPRNumber = Cypress.env('CC_PR_NUMBER')
  const branch = Cypress.env('BRANCH_TO_CREATE')
  const description = `PR created for testing the conventional-commits-validator GH action. Triggered by ci.yml in the PR cangulo-actions/semver#${ccPRNumber}`

  cy
    .createPR({ title, description, branch })
    .then((pr) => {
      console.log(`PR created: ${pr.number}`)
      cy
        .task('appendSharedData', `PR_NUMBER=${pr.number}`)
        .task('appendSharedData', `PR_HEAD_SHA=${pr.headSha}`)
    })
})
