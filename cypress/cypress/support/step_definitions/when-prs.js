const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('I create a PR with title {string}', (title) => {
  const ccPRNumber = Cypress.env('CC_PR_NUMBER')
  const description = `PR created for testing the conventional-commits-validator GH action. Triggered by ci.yml in the PR cangulo-actions/conventional-commits-validator#${ccPRNumber}`

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, BRANCH } = sharedData
      cy
        .createPR({ owner: OWNER, repo: REPO, title, description, head: BRANCH })
        .then((pr) => {
          cy
            .log(`PR created: ${pr.number}`)
            .task('appendSharedData', `PR_NUMBER=${pr.number}`)
            .task('appendSharedData', `PR_HEAD_SHA=${pr.headSha}`)
        })
    })
})
