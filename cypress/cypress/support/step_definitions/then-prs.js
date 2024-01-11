const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('The PR must include the labels', (table) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, PR_NUMBER } = sharedData
      cy
        .getPR({ owner: OWNER, repo: REPO, number: PR_NUMBER })
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
