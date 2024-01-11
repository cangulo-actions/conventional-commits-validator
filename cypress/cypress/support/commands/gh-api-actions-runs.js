Cypress.Commands.add('getRuns', ({ owner, repo, branch, event, headSha, status }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getRunsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/actions/runs?branch=${branch}&event=${event}&head_sha=${headSha}&status=${status}`

  return cy
    .request(
      {
        method: 'GET',
        url: getRunsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      return response.body
    })
})
