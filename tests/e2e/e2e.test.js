const exec = require('@actions/exec')
const fs = require('fs')

describe('E2E tests', () => {
  beforeAll(async () => {
    await customExec('git restore .')
    await customExec('git checkout main')
    await customExec('git pull')
  })

  const timeout = 1000 * 60 * 5 // 5 minutes
  const testDataPath = process.env.TEST_DATA_PATH ?? './tests/e2e/e2e.test.data.json'
  const testDataContent = fs.readFileSync(testDataPath, 'utf8')
  const testData = JSON.parse(testDataContent)
  const testCases = testData.filter(t => t.enabled)

  for (const test of testCases) {
    it(test.scenario, async () => {
      // arrange
      const branchToCreate = test.branch

      let ccBranchUnderTest = ''
      if (process.env.CC_BRANCH) {
        ccBranchUnderTest = process.env.CC_BRANCH
      } else {
        const { stdout } = await exec.getExecOutput('git rev-parse --abbrev-ref HEAD')
        ccBranchUnderTest = stdout.trim()
      }
      console.log(`ccBranchUnderTest: ${ccBranchUnderTest}`)
      console.log(`Scenario: ${test.scenario}`)

      await customExec('git config user.name "cangulo-semver-e2e-test[bot]"')
      await customExec('git config user.email "cangulo-semver-e2e-test[bot]@users.noreply.github.com"')

      await customExec(`git checkout -B ${branchToCreate}`)

      for (const commit of test.commits) {
        const commitCleaned = commit.replace('CC_BRANCH_UNDER_TEST', ccBranchUnderTest)
        console.log(`commit: ${commitCleaned}`)
        await customExec(`sed -i s|cangulo-actions/conventional-commits-validator@.*|cangulo-actions/conventional-commits-validator@${ccBranchUnderTest}|g .github/workflows/ci.yml`)
        await customExec(`git commit --allow-empty -am "${commitCleaned}"`)
      }

      await customExec(`git push origin ${branchToCreate} --force `)

      const prTitle = test.prTitle.replace('CC_BRANCH_UNDER_TEST', ccBranchUnderTest)
      try {
        await customExec(`gh pr create --title "${prTitle}" --fill`)
      } catch (error) {
        console.log(`Error creating PR: ${error}`)
      }
      let prNumber = await customExec(`gh pr list -B main -H ${branchToCreate} --state open --json number`)
      prNumber = JSON.parse(prNumber)[0].number
      console.log(`PR Created ${prNumber}`)

      // act
      console.log('Waiting for CI workflow to finish...')

      let retryCount = 0
      const maxRetries = 3
      const secondsBetweenRetries = 20

      console.log(`waiting ${secondsBetweenRetries} seconds before checking if the workflow is completed`)
      await new Promise(resolve => setTimeout(resolve, secondsBetweenRetries * 1000))

      let status = await customExec(`gh pr view ${prNumber} --json statusCheckRollup --jq ".statusCheckRollup[0].status"`)
      console.log(`CI workflow status: ${status}`)

      while (status !== 'COMPLETED' && retryCount < maxRetries) {
        console.log(`Waiting ${secondsBetweenRetries} seconds before checking if the workflow is completed`)
        await new Promise(resolve => setTimeout(resolve, secondsBetweenRetries * 1000))
        status = await customExec(`gh pr view ${prNumber} --json statusCheckRollup --jq ".statusCheckRollup[0].status"`)
        retryCount++
      }

      if (retryCount === maxRetries) {
        console.error('Max retries reached. Exiting...')
        throw new Error('Max retries reached. Exiting...')
      }

      // assert
      console.log('Workflow completed successfully. Asserting conclusion')

      const expectedConclusion = test.conclusion
      const conclusion = await customExec(`gh pr view ${prNumber} --json statusCheckRollup --jq ".statusCheckRollup[0].conclusion"`)
      console.log(`CI workflow conclusion: ${conclusion}`)

      await customExec(`gh pr close ${prNumber} --delete-branch`)
      expect(conclusion).toBe(expectedConclusion)
    }, timeout)
  }
})

async function customExec (command, args) {
  const options = {
    // requires you to have the CrazyActionsTests repo cloned in the REPOR_PATH env variable or locally in ../CrazyActionsTests
    cwd: process.env.REPO_PATH ?? '../CrazyActionsTests'
  }
  const { stdout } = await exec.getExecOutput(command, args, options)
  return stdout.trim()
}
