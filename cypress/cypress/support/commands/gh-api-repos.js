Cypress.Commands.add('repoExists', ({ org, repo }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getRepoUrl = `${ghAPIUrl}/repos/${org}/${repo}`

  return cy.request({
    method: 'GET',
    url: getRepoUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    failOnStatusCode: false
  }).then((response) => {
    return response.status === 200
  })
})

Cypress.Commands.add('createRepo', ({ org, repo }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const createRepoUrl = `${ghAPIUrl}/orgs/${org}/repos`

  return cy.request({
    method: 'POST',
    url: createRepoUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      name: repo,
      description: 'PR created for testing PR#22',
      private: true,
      visibility: 'private',
      has_issues: false,
      has_projects: false,
      has_wiki: false,
      has_downloads: false,
      allow_merge_commit: false,
      allow_rebase_merge: false,
      allow_auto_merge: false,
      delete_branch_on_merge: true,
      auto_init: true
    }
  }).then((response) => {
    return response.body
  })
})
