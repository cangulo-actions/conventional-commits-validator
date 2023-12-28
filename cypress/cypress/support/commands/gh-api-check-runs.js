Cypress.Commands.add('getCheckRunAnnotations', (checkRunId) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCommitCheckRunsUrl = `${ghAPIUrl}/check-runs/${checkRunId}/annotations`

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
      return response.body
    })
})
