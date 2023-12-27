Cypress.Commands.add('getRuns', ({ branch, event, headSha, status }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getRunsUrl = `${ghAPIUrl}/actions/runs?branch=${branch}&event=${event}&head_sha=${headSha}&status=${status}`

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
