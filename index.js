const { calculateNextVersion, getReleaseType } = require('./functions/calculate-next-version')
const { isConventional, parseChange } = require('./functions/parse-change')
const { validateChanges } = require('./functions/validate-changes')
// eslint-disable-next-line no-unused-vars
const { groupBy } = require('core-js/actual/array/group-by')

const fs = require('fs')
const repoChangesConfig = {
  changelog: 'CHANGELOG.md',
  versionJsonPath: 'version.json'
}

function Index (core, conf, commits) {
  core.startGroup('Changes')

  const unconventionalCommits = commits.filter(x => !isConventional(x.message))
  if (unconventionalCommits.length > 0) {
    core.summary
      .addHeading('🛑 Invalid commits:')
      .addCodeBlock(JSON.stringify(unconventionalCommits, null, 2), 'json')
      .addSeparator()
      .addHeading('Commit Conventions:')
      .addCodeBlock(JSON.stringify(conf, null, 2), 'json')
      .write()
    core.setFailed('Errors found validating the commits. Please Check the summary.')
    return
  }

  const changes = commits
    .map(x => {
      const parsedChange = parseChange(x.message, conf.changeTypes)
      parsedChange.commitId = x.id
      parsedChange.files = x.files
      console.log(JSON.stringify(parsedChange, null, 2))
      return parsedChange
    })
  console.log('changes:', changes)
  core.setOutput('changes', changes)
  core.endGroup()

  const supportedCommitTypes = Object.keys(conf.changeTypes)
  const errors = validateChanges(changes, supportedCommitTypes, conf.scopes)
  if (errors.length > 0) {
    const errorsJSON = JSON.stringify(errors, null, 2)
    core.summary
      .addHeading('🛑  Errors Found validations commits:')
      .addCodeBlock(errorsJSON, 'json')
      .addSeparator()
      .addHeading('Configuration:')
      .addCodeBlock(JSON.stringify(conf, null, 2), 'json')
      .write()
    core.setFailed('Errors found validating the commits. Please Check the summary.')
    return
  }

  const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, repoChangesConfig.versionJsonPath)
  core.setOutput('next-release-triggered', requiresNewRelease)
  console.log('next-release-triggered:', requiresNewRelease)

  if (requiresNewRelease) {
    const repoChangesResult = {
      version: nextVersion,
      releaseType: nextReleaseType,
      changes
    }

    core.startGroup('Next release for the whole repo')
    console.log(repoChangesResult, null, 2)
    core.endGroup()

    core.setOutput('next-version', repoChangesResult.version)
    core.setOutput('next-release-type', repoChangesResult.releaseType)

    const scopesResult = {}
    if (conf.scopes) {
      const changesByScope = changes
        .flatMap(change => change.scopes.map(scope => ({ scope, change })))
        .reduce((acc, entry) => {
          acc[entry.scope] = (acc[entry.scope] || []).concat(entry.change)
          return acc
        }, {})

      for (const [scope, changes] of Object.entries(changesByScope)) {
        const versionJsonPath = conf.scopes[scope].versioning?.file ?? `${scope}/version.json`
        const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, versionJsonPath)

        if (requiresNewRelease) {
          scopesResult[scope] = {
            nextVersion,
            nextReleaseType,
            changes
          }
        }
      }
    }
    core.startGroup('new releases per scope')
    console.log(scopesResult, null, 2)
    core.endGroup()

    core.setOutput('scopes', scopesResult)
  }
}

module.exports = {
  Index
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
