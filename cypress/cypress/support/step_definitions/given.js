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
  const branch = Cypress.env('BRANCH_TO_CREATE')
  table
    .rows().forEach(row => {
      const commitMsg = row[0]
      if (row.length === 1) {
        cy.exec(`git commit --allow-empty -m "${commitMsg}"`)
      } else {
        const file = row[1]
        const currentTime = new Date().toISOString()
        const content = `# refresh ${currentTime}`
        cy
          .writeFile(file, content)
          .exec(`git add "${file}"`)
          .exec(`git commit -m "${commitMsg}"`)
      }
    })
  push(branch)
})

function commitAndPushChanges (commitMsgs) {
  const branch = Cypress.env('BRANCH_TO_CREATE')

  commitMsgs.forEach(commitMsg => {
    cy.exec(`git commit --allow-empty -m "${commitMsg}"`)
  })
  push(branch)
}

function push (branch) {
  cy.exec(`git push origin ${branch} --force`)
}
