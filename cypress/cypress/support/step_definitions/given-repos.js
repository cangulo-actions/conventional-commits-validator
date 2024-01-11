const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('I create a repository named {string}', (repoName) => {
  const org = Cypress.env('GH_ORG')
  const testKey = Cypress.env('TEST_KEY')
  const ccPRNumber = Cypress.env('CC_PR_NUMBER')

  const repo = repoName
    .replace('{PR_NUMBER}', ccPRNumber)
    .replace('{TEST_KEY}', testKey)

  cy
    .repoExists({ org, repo })
    .then((exists) => {
      if (!exists) {
        cy.log(`Repo ${repo} does not exists. Creating it...`)
        cy
          .createRepo({ org, repo })
          .then((repoCreated) => {
            cy.log(`Repo Created: ${repoCreated.full_name}`)
            cy
              .task('appendSharedData', `REPO=${repoCreated.name}`)
              .task('appendSharedData', `OWNER=${repoCreated.owner.login}`)
          })
      } else {
        cy.log(`Repo ${repo} already exists`)
        cy
          .task('appendSharedData', `REPO=${repo}`)
          .task('appendSharedData', `OWNER=${org}`)
      }
    })
})
