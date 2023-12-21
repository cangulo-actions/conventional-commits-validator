const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('I checkout a branch', () => {
  const branch = Cypress.env('BRANCH_TO_CREATE')
  cy
    .exec('git checkout main')
    .exec('git pull')
    .exec(`git branch -D ${branch} || true`)
    .exec(`git checkout -b ${branch}`)
})

Given('I commit the next change {string}', (commitMsg) => {
  commitAndPushChanges([commitMsg])
})

Given('I commit the next changes', (table) => {
  const commitMsgs = table.rows().map(row => row[0])
  commitAndPushChanges(commitMsgs)
})

function commitAndPushChanges (commitMsgs) {
  const branch = Cypress.env('BRANCH_TO_CREATE')

  commitMsgs.forEach(commitMsg => {
    cy.exec(`git commit --allow-empty -m "${commitMsg}"`)
  })

  cy.exec(`git push origin ${branch} --force`)
}
