Cypress.Commands.add('createPR', ({ title, description, branch }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/pulls`

  return cy
    .request(
      {
        method: 'POST',
        url: pullsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        },
        body: {
          base: 'main',
          head: branch,
          title,
          body: description
        }
      }
    )
    .then((response) => {
      const pr = {
        id: response.body.id,
        number: response.body.number,
        headSha: response.body.head.sha
      }
      return pr
    })
})

Cypress.Commands.add('closePR', (number) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/pulls/${number}`

  return cy
    .request(
      {
        method: 'PATCH',
        url: pullsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        },
        body: {
          state: 'closed'
        }
      }
    )
    .then((response) => {
      const mergeCommit = response.body.sha
      return mergeCommit
    })
})

Cypress.Commands.add('closeAnyPendingPR', () => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const branch = Cypress.env('BRANCH_TO_CREATE')
  const pullsUrl = `${ghAPIUrl}/pulls`

  return cy
    .request(
      {
        method: 'GET',
        url: `${pullsUrl}?state=open&head=cangulo-actions:${branch}`,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      const prNumbers = response.body.map((pr) => pr.number)
      for (const prNumber of prNumbers) {
        cy.request(
          {
            method: 'PATCH',
            url: `${pullsUrl}/${prNumber}`,
            headers: {
              Authorization: `token ${Cypress.env('GH_TOKEN')}`
            },
            body: {
              state: 'closed'
            }
          }
        )
      }
    })
})
