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

Given('I modify the file {string} and commit it with the message {string}', (file, msg) => {
  updateFile(file, msg)
})

Given('I modify the next files and commit each change with the message', (table) => {
  table
    .rows()
    .forEach(row => {
      const file = row[0]
      const commitMsg = row[1]
      updateFile(file, commitMsg)
    })
})

function updateFile (file, commitMsg) {
  const currentTime = new Date().toISOString()
  const content = `# refresh ${currentTime}`
  cy
    .writeFile(file, content)
    .exec(`git add "${file}"`)
    .exec(`git commit -m "${commitMsg}"`)
}
