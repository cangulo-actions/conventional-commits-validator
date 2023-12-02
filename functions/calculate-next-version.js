function calculateNextVersion (currentVersion, releases) {
  let [major, minor, patch] = currentVersion.split('.')
  major = parseInt(major)
  minor = parseInt(minor)
  patch = parseInt(patch)
  const finalReleaseType = getReleaseType(releases)
  if (finalReleaseType === 'major') {
    major += 1
    minor = 0
    patch = 0
  } else if (finalReleaseType === 'minor') {
    minor += 1
    patch = 0
  } else if (finalReleaseType === 'patch') {
    patch += 1
  }

  return `${major}.${minor}.${patch}`
}

function getReleaseType (releases) {
  const uniqueReleases = [...new Set(releases)]
  if (uniqueReleases.includes('major')) {
    return 'major'
  } else if (uniqueReleases.includes('minor')) {
    return 'minor'
  } else if (uniqueReleases.includes('patch')) {
    return 'patch'
  } else {
    return 'none'
  }
}

module.exports = {
  calculateNextVersion,
  getReleaseType
}
