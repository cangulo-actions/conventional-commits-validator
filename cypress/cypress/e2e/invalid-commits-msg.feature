Feature: Reject non conventional commits

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
      """
    And I stage the file ".github/workflows/cc-test.yml"
    And I create a commit with the message "ci: added cc-test.yml"

  Scenario: unconventional commit message
    Given I modify and stage the file: "refresh.md"
    And I create a commit with the message "wrong commit message"
    And I push my branch
    When I create a PR with title "invalid-commits: wrong commit message, does not follow convention"
    Then the workflow "Test conventional-commits-validator" must conclude in "failure"
    And I close the PR
