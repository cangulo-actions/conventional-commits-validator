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

  if (errors.length > 0 || scopesConfig.length === 0) {
    return errors
  }

  const commitsContainsScope = changes.some(change => change.scopes.length > 0)
  if (commitsContainsScope) {
    // validate scopes provided are supported
    const supportedScopes = scopesConfig.map(x => x.key)
    changes
      .filter(x => x.scopes.some(scope => !supportedScopes.includes(scope)))
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

    // validate files modified for each scope
    for (const change of changes) {
      const scopes = change.scopes
      const filesModified = change.files

      scopes.forEach(scope => {
        const acceptedPatterns = scopesConfig.find(x => x.key === scope).files
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
    }
  }

  // validate no commit misses a scope based on the files modified
  for (const change of changes) {
    const filesModified = change.files
    let expectedScopes = []

    filesModified.forEach(file => {
      for (const scopeConfig of Object.values(scopesConfig)) {
        const atLeastOnePatternMatch = picomatch.isMatch(file, scopeConfig.files)
        if (atLeastOnePatternMatch) {
          expectedScopes.push(scopeConfig.key)
        }
      }
    })
    expectedScopes = [...new Set(expectedScopes)].sort()
    const missingScopes = expectedScopes.filter(x => !change.scopes.includes(x))
    if (missingScopes.length > 0) {
      errors.push({
        message: 'Missing the next scopes in the commit message',
        commitMsg: change.originalCommit,
        missingScopes
      })
    }

    if (errors.length > 0) {
      return errors
    }
  }
  return errors
}

module.exports = {
  validateChanges
}
