Cypress.Commands.add('getLastCommit', ({ owner, repo }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCommitsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/commits?per_page=1`

  return cy
    .request(
      {
        method: 'GET',
        url: getCommitsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      const lastCommit = {
        message: response.body[0].commit.message,
        sha: response.body[0].sha
      }
      return lastCommit
    })
})

Cypress.Commands.add('getCommitCheckRuns', ({ owner, repo, commitId }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCommitCheckRunsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/commits/${commitId}/check-runs`

  return cy
    .request(
      {
        method: 'GET',
        url: getCommitCheckRunsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      return response.body.check_runs
    })
})
