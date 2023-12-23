const REGEX_PARSE_COMMIT = /(?<type>^[a-z\d]+)\(?(?<scopes>[a-z_\d,-]+)?\)?: (?<description>.*)/

function isConventional (changeMsg) {
  return changeMsg.match(REGEX_PARSE_COMMIT) !== null
}

function parseChange (changeMsg, commitsConfig) {
  // change is a conventional commit
  // following pattern <type>[optional scope]: <description>
  // https://www.conventionalcommits.org/en/v1.0.0/
  // do not support <BREAKING CHANGE>

  const change = {
    type: '',
    releaseAssociated: 'none',
    scopes: [],
    description: changeMsg.trim(),
    originalCommit: changeMsg.trim()
  }

  if (changeMsg.match(REGEX_PARSE_COMMIT)) {
    let { type, scopes, description } = changeMsg.match(REGEX_PARSE_COMMIT).groups
    scopes = scopes ? scopes.split(',') : []
    change.type = type
    change.releaseAssociated = commitsConfig.find(x => x.type === type)?.release ?? 'none'
    change.scopes = scopes
    change.description = description
  }

  return change
}

module.exports = {
  isConventional,
  parseChange
}
