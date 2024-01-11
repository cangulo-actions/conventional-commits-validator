const { Given, Step } = require('@badeball/cypress-cucumber-preprocessor')

Given('I push the file {string} to the branch {string} with the content:', (file, branch, fileContent) => {
  const commitMsg = `[skip ci][e2e-background] Create ${file}`
  const ccBranchName = Cypress.env('CC_BRANCH')
  const content = fileContent.replace(/<TARGET_BRANCH>/g, ccBranchName)

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy.createContent({ owner: OWNER, repo: REPO, file, content, commitMsg, branch })
    })
})

Given('I commit {string} modifying the file {string}', (commitMsg, file) => {
  const currentTime = new Date().toISOString()
  const content = `# refresh ${currentTime}`

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, BRANCH } = sharedData
      cy.createContent({ owner: OWNER, repo: REPO, file, content, commitMsg, branch: BRANCH })
    })
})

Given('I push the next commits modifying the files:', (table) => {
  table
    .rows()
    .forEach(row => {
      const commitMsg = row[0]
      const file = row[1]
      Step(this, `I commit "${commitMsg}" modifying the file "${file}"`)
    })
})
