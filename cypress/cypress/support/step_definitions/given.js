const { Given, Step } = require('@badeball/cypress-cucumber-preprocessor')

Given('I checkout a branch from main', () => {
  const branch = Cypress.env('BRANCH_TO_CREATE')
  cy
    .exec('git checkout main')
    .exec('git pull')
    .exec(`git branch -D ${branch} || true`)
    .exec(`git checkout -b ${branch}`)
})

Given('I create the {string} file with the next content:', (filePath, fileContent) => {
  const ccBranchName = Cypress.env('CC_BRANCH')
  const content = fileContent.replace(/<TARGET_BRANCH>/g, ccBranchName)

  cy
    .exec(`rm -f "${filePath}" || true `)
    .writeFile(filePath, content)
})

Given('I stage the file {string}', (filePath) => {
  cy.exec(`git add "${filePath}"`)
})

Given('I modify and stage the file: {string}', (filePath) => {
  const currentTime = new Date().toISOString()
  const content = `# refresh ${currentTime}`
  cy.writeFile(filePath, content)

  Step(this, `I stage the file "${filePath}"`)
})

Given('I create a commit with the message {string}', (commitMsg) => {
  cy.exec(`git commit -m "${commitMsg}"`)
})

Given('I push my branch', () => {
  const branch = Cypress.env('BRANCH_TO_CREATE')
  cy.exec(`git push origin ${branch} --force`)
})

Given('I commit the next changes', (table) => {
  table
    .rows()
    .forEach(row => {
      const commitMsg = row[0]
      const file = row[1]
      const currentTime = new Date().toISOString()
      const content = `# refresh ${currentTime}`
      cy
        .writeFile(file, content)
        .exec(`git add "${file}"`)
        .exec(`git commit -m "${commitMsg}"`)
    })
})
