Feature: Label PR with commit types

  Background: The gh action runs with the default configuration
    Given I checkout a branch from main
    And I create the ".github/workflows/cc-test.yml" file with the next content:
      """
      name: Test conventional-commits-validator
      on:
        pull_request: 
          branches:
            - main
      
      jobs:
        validate-commits:
          name: Validate Commits
          runs-on: ubuntu-latest
          steps:
            - name: checkout
              uses: actions/checkout@v4
      
            - name: Validate Conventional Commits
              uses: cangulo-actions/conventional-commits-validator@<TARGET_BRANCH>
              with:
                label-pr-with-commit-types: true
      """
    And I stage the file ".github/workflows/cc-test.yml"
    And I create a commit with the message "ci: added cc-test.yml with default config"

  Scenario: Valid Commits
    Given I modify the file "src/lambda1/lambda1.py"
    And I stage the file "src/lambda1/lambda1.py"
    And I create a commit with the message "fix: commit that fixes something in the lambdas"
    And I push my branch
    When I create a PR with title "test: label PR with commit types"
    Then the workflow "Test conventional-commits-validator" must conclude in "success"
    And The PR must include the labels
      | <label> |
      | fix     |
      | ci      |
    And I close the PR
