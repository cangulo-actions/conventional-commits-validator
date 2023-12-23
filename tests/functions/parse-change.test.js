const { parseChange } = require('../../functions/parse-change')
const yml = require('js-yaml')
const fs = require('fs')
const testData = [
  {
    input: 'fix: #123 solved error when querying DB',
    output: {
      type: 'fix',
      releaseAssociated: 'patch',
      scopes: [],
      description: '#123 solved error when querying DB',
      originalCommit: 'fix: #123 solved error when querying DB'
    }
  },
  {
    input: 'feat(src): #234 added new endpoint for deleting user',
    output: {
      type: 'feat',
      releaseAssociated: 'minor',
      scopes: ['src'],
      description: '#234 added new endpoint for deleting user',
      originalCommit: 'feat(src): #234 added new endpoint for deleting user'
    }
  },
  {
    input: 'break(src,tfm): #564 updated API endpoints structure',
    output: {
      type: 'break',
      releaseAssociated: 'major',
      scopes: ['src', 'tfm'],
      description: '#564 updated API endpoints structure',
      originalCommit: 'break(src,tfm): #564 updated API endpoints structure'
    }
  },
  {
    input: 'docs(src,tfm): #231 Updated readme for tfm and src',
    output: {
      type: 'docs',
      releaseAssociated: 'none',
      scopes: ['src', 'tfm'],
      description: '#231 Updated readme for tfm and src',
      originalCommit: 'docs(src,tfm): #231 Updated readme for tfm and src'
    }
  },
  {
    input: 'refactor(tfm): #234 simplified terraform solution',
    output: {
      type: 'refactor',
      releaseAssociated: 'none',
      scopes: ['tfm'],
      description: '#234 simplified terraform solution',
      originalCommit: 'refactor(tfm): #234 simplified terraform solution'
    }
  }
]

describe('changes are properly parsed', () => {
  testData.forEach(data => {
    it(`change:\n\t${data.input}\nis parsed into:\n\t${JSON.stringify(data.output, null, 2)}`,
      () => {
        const defaultConfigContent = fs.readFileSync('default-config.yml')
        const defaultConf = yml.load(defaultConfigContent)
        const changeTypes = defaultConf.commits
        const change = parseChange(data.input, changeTypes)
        expect(change).toEqual(data.output)
      })
  })
})
