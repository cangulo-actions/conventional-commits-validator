Cypress.Commands.add('getCommitCheckRuns', (commitId) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCommitCheckRunsUrl = `${ghAPIUrl}/commits/${commitId}/check-runs`

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
