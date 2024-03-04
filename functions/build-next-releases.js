const { calculateNextVersion, getReleaseType } = require('./calculate-next-version')
// eslint-disable-next-line no-unused-vars
const { groupBy } = require('core-js/actual/array/group-by')

const fs = require('fs')

function buildNextReleases (config, changes) {
  const result = {
    releaseRequired: false,
    version: '',
    releaseType: '',
    scopes: {}
  }

  const repoChangesConfig = {
    versionFile: config.versioning.file
  }

  const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, repoChangesConfig.versionFile)
  result.releaseRequired = requiresNewRelease

  if (requiresNewRelease) {
    result.version = nextVersion
    result.releaseType = nextReleaseType

    if (config.scopes.list.length > 0) {
      const scopesSupported = config.scopes.list
      const scopesResult = {}
      const changesByScope = changes
        .flatMap(change => change.scopes.map(scope => ({ scope, change })))
        .reduce((acc, entry) => {
          acc[entry.scope] = (acc[entry.scope] || []).concat(entry.change)
          return acc
        }, {})

      for (const [scope, changes] of Object.entries(changesByScope)) {
        const scopeConfig = scopesSupported.find(x => x.key === scope)
        const calculateVersion = scopeConfig['calculate-next-version'] ?? config.scopes['calculate-next-version']
        if (calculateVersion) {
          const versionFile = scopeConfig.versioning.file
          const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, versionFile)

          if (requiresNewRelease) {
            scopesResult[scope] = {
              version: nextVersion,
              releaseType: nextReleaseType
            }
          }
        }
      }
      result.scopes = scopesResult
    }
  }

  return result
}

module.exports = {
  buildNextReleases
}

function checkForNextRelease (changes, versionJsonPath) {
  let currentVersion = '0.0.0'
  if (fs.existsSync(versionJsonPath)) {
    const versionJsonContent = fs.readFileSync(versionJsonPath)
    currentVersion = JSON.parse(versionJsonContent).version
  }

  const releases = changes.map(x => x.releaseAssociated)
  const nextReleaseType = getReleaseType(releases)
  const nextVersion = calculateNextVersion(currentVersion, releases)
  const requiresNewRelease = nextVersion !== currentVersion
  return { requiresNewRelease, nextVersion, nextReleaseType }
}
