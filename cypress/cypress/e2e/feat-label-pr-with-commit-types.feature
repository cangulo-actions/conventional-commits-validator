Feature: Label PR with commit types

  Background: The gh action runs with the label-pr-with-commit-types flag enabled
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
            pull-requests: write # required for adding labels to PRs
          steps:
            - name: Validate Conventional Commits
              uses: cangulo-actions/conventional-commits-validator@<TARGET_BRANCH>
              with:
                label-pr-with-commit-types: true
      """

  Scenario: Valid Commits
    Given I create a branch named "feat-label-pr-with-commit-types"
    And I push the next commits modifying the files:
      | <commig message>                                | <file>                 |
      | fix: commit that fixes something in the lambdas | src/lambda1/lambda1.py |
    When I create a PR with title "test: label PR with commit types"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "success"
    And The PR must include the labels
      | <label> |
      | fix     |
