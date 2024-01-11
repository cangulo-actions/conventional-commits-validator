Feature: Reject non conventional commits

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

  Scenario: unconventional commit message
    Given I create a branch named "invalid-commits-msg"
    And I commit "wrong commit message" modifying the file "src/lambda1.py"
    When I create a PR with title "invalid-commits: wrong commit message, does not follow convention"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "failure"
