Cypress.Commands.add('contentExists', ({ owner, repo, file, branch }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getContentUrl = `${ghAPIUrl}/repos/${owner}/${repo}/contents/${file}?ref=${branch}`

  return cy.request({
    method: 'GET',
    url: getContentUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    failOnStatusCode: false
  }).then((response) => {
    return response.status === 200
  })
})

Cypress.Commands.add('getContent', ({ owner, repo, file, branch }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getContentUrl = `${ghAPIUrl}/repos/${owner}/${repo}/contents/${file}?ref=${branch}`

  return cy.request({
    method: 'GET',
    url: getContentUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    }
  }).then((response) => {
    const content = response.body
    return {
      path: content.path,
      sha: content.sha
    }
  })
})

Cypress.Commands.add('deleteContent', ({ owner, repo, file, sha }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const deleteContentUrl = `${ghAPIUrl}/repos/${owner}/${repo}/contents/${file}`
  const commitMsg = `[skip ci][e2e-background] Delete ${file}`
  const ghUserName = Cypress.env('GH_USER_NAME')
  const ghUserEmail = Cypress.env('GH_USER_EMAIL')

  return cy.request({
    method: 'DELETE',
    url: deleteContentUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      message: commitMsg,
      committer: {
        name: ghUserName,
        email: ghUserEmail
      },
      sha
    }
  })
})

Cypress.Commands.add('createContent', ({ owner, repo, file, content, commitMsg, branch }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const createContentUrl = `${ghAPIUrl}/repos/${owner}/${repo}/contents/${file}`
  const ghUserName = Cypress.env('GH_USER_NAME')
  const ghUserEmail = Cypress.env('GH_USER_EMAIL')
  const contentEncoded = Buffer.from(content).toString('base64')

  return cy.request({
    method: 'PUT',
    url: createContentUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      message: commitMsg,
      committer: {
        name: ghUserName,
        email: ghUserEmail
      },
      content: contentEncoded,
      branch
    }
  })
})

Cypress.Commands.add('updateContent', ({ owner, repo, file, content, commitMsg, sha }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const updateContentUrl = `${ghAPIUrl}/repos/${owner}/${repo}/contents/${file}`
  const ghUserName = Cypress.env('GH_USER_NAME')
  const ghUserEmail = Cypress.env('GH_USER_EMAIL')
  const contentEncoded = Buffer.from(content).toString('base64')

  return cy.request({
    method: 'PUT',
    url: updateContentUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      message: commitMsg,
      committer: {
        name: ghUserName,
        email: ghUserEmail
      },
      content: contentEncoded,
      sha
    }
  })
})
