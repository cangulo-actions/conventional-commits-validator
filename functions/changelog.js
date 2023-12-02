const fs = require('fs')
const nunjucks = require('nunjucks')

function buildChangelogRecord (version, title, changesPerReleaseType) {
  const templateContent = fs.readFileSync(process.env.CHANGELOG_RECORD_TEMPLATE, 'utf8')
  return nunjucks.renderString(templateContent.toString(), { version, title, changesPerReleaseType })
}

function updateChangelog (changes, nextVersion, title, changelogPath) {
  let changelogContent = ''
  if (fs.existsSync(changelogPath)) {
    changelogContent = fs.readFileSync(changelogPath)
  }

  const changesPerReleaseType = changes.groupBy(change => change.releaseAssociated)
  const newChangelogRecord = buildChangelogRecord(nextVersion, title, changesPerReleaseType)
  changelogContent = newChangelogRecord + '\n' + changelogContent
  fs.writeFileSync(changelogPath, changelogContent)
  return newChangelogRecord
}

module.exports = {
  updateChangelog
}
