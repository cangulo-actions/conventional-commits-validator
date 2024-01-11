Cypress.Commands.add('getCheckRunAnnotations', ({ owner, repo, checkRunId }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCheckRunAnnotationsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/check-runs/${checkRunId}/annotations`

  return cy
    .request(
      {
        method: 'GET',
        url: getCheckRunAnnotationsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      return response.body
    })
})
