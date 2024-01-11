const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('I create a branch named {string}', (branch) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getLastCommit({ owner: OWNER, repo: REPO })
        .then((lastCommit) => {
          const { sha } = lastCommit
          cy
            .createBranch({ owner: OWNER, repo: REPO, branch, sha })
            .log(`Branch ${branch} created`)
            .task('appendSharedData', `BRANCH=${branch}`)
        })
    })
})
