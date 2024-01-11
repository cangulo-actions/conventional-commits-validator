Cypress.Commands.add('createBranch', ({ owner, repo, branch, sha }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const createBranchUrl = `${ghAPIUrl}/repos/${owner}/${repo}/git/refs`

  return cy.request({
    method: 'POST',
    url: createBranchUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      ref: `refs/heads/${branch}`,
      sha
    }
  }).then((response) => {
    // return branch name
    return response.body.ref.split('/').pop()
  })
})
