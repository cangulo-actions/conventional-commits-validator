const picomatch = require('picomatch')

/**
 * @param {Array<string>} filesModified - An array of modified file paths.
 * @param {Array<string>} acceptedPatterns - An array of accepted file patterns.
 */
function validateChanges (changes, supportedTypes, scopesConfig) {
  const errors = []

  changes.filter(x => !supportedTypes.includes(x.type)).forEach(change => {
    errors.push({
      message: `The next commit type is not supported: "${change.type}"`,
      commitMsg: change.originalCommit,
      commitId: change.commitId
    })
  })

  if (errors.length > 0) {
    return errors
  }

  const validateCommitWithScope = changes.some(change => change.scopes.length > 0) && scopesConfig
  if (validateCommitWithScope) {
    changes
      .filter(x => x.scopes.some(scope => !scopesConfig[scope]))
      .forEach(change => {
        errors.push({
          message: 'The next commit contains not expected scopes',
          commitMsg: change.originalCommit,
          commitId: change.commitId,
          scopesProvided: change.scopes,
          scopesConfig
        })
      })

    if (errors.length > 0) {
      return errors
    }

    for (const change of changes) {
      const scopes = change.scopes
      const filesModified = change.files

      scopes.forEach(scope => {
        const acceptedPatterns = scopesConfig[scope].files
        const atLeastOnePatternMatch = filesModified.some(fileModified => picomatch.isMatch(fileModified, acceptedPatterns))
        if (!atLeastOnePatternMatch) {
          errors.push({
            message: `Files modified do not match the expected patterns for the scope ${scope}`,
            commitMsg: change.originalCommit,
            commitId: change.commitId,
            expectedPatterns: acceptedPatterns,
            filesModified
          })
        }
      })

      if (errors.length > 0) {
        return errors
      }

      let expectedScopes = []

      filesModified.forEach(file => {
        for (const scope of Object.keys(scopesConfig)) {
          const acceptedPatterns = scopesConfig[scope].files
          const atLeastOnePatternMatch = picomatch.isMatch(file, acceptedPatterns)
          if (atLeastOnePatternMatch) {
            expectedScopes.push(scope)
          }
        }
      })
      expectedScopes = [...new Set(expectedScopes)].sort()
      const scopesProvided = scopes.sort()

      const missingScopes = expectedScopes.filter(scope => !scopesProvided.includes(scope))
      if (missingScopes.length > 0) {
        errors.push({
          message: 'Missing the next scopes in the commit message',
          commitMsg: change.originalCommit,
          missingScopes
        })
      }
    }
  }

  return errors
}

module.exports = {
  validateChanges
}
