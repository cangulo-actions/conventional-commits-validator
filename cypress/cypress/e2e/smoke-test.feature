Feature: Smoke tests

  Background: The gh action runs with the default configuration
    Given I create a repository named "cc-PR-{PR_NUMBER}-{TEST_KEY}"
    And I push the file ".github/workflows/cc-test.yml" to the branch "main" with the content:
      """
      name: cangulo-actions/conventional-commits-validator test
      on:
        pull_request: 
          branches:
            - main

      jobs:
        validate-commits:
          name: Validate Commits
          runs-on: ubuntu-latest
          permissions:
            contents: read
            pull-requests: read
          steps:
            - name: Validate Conventional Commits
              uses: cangulo-actions/conventional-commits-validator@<TARGET_BRANCH>
      """

  Scenario: I create a PR with one commit fixing something
    Given I create a branch named "smoke-test"
    And I commit "fix: commit that fixes something in the lambda1" modifying the file "src/lambda1/lambda1.py"
    When I create a PR with title "cc smoke test"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "success"
