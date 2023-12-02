const REGEX_PARSE_COMMIT = /(?<type>^[a-z\d]+)\(?(?<scopes>[a-z_\d,-]+)?\)?: (?<description>.*)/

function isConventional (changeMsg) {
  return changeMsg.match(REGEX_PARSE_COMMIT) !== null
}

function parseChange (changeMsg, changeTypes) {
  // change is a conventional commit
  // following pattern <type>[optional scope]: <description>
  // https://www.conventionalcommits.org/en/v1.0.0/
  // do not support <BREAKING CHANGE>

  let { type, scopes, description } = changeMsg.match(REGEX_PARSE_COMMIT).groups
  scopes = scopes ? scopes.split(',') : []

  return {
    type: type ?? 'none',
    releaseAssociated: changeTypes[type]?.release ?? 'none',
    scopes,
    description: description.trim(),
    originalCommit: changeMsg.trim()
  }
}

module.exports = {
  isConventional,
  parseChange
}
