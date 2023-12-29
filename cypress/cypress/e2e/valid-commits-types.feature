Feature: Validate Commit types using default configuration

  Background: The gh action is configured with the default configuration
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
    And I create a commit with the message "ci: added cc-test.yml with default config"

  Scenario: Valid Commits
    Given I modify the next files and commit each change with the message
      | terraform/main.tf      | ci: commit that fixes something in terraform    |
      | src/lambda1/lambda1.py | fix: commit that fixes something in the lambdas |
      | terraform/main.tf      | feat: commit that adds a feature in terraform   |
      | docs/notes.md          | break: commit that introduce a breaking change  |
    And I push my branch
    When I create a PR with title "valid-commits: correct commit types provided"
    Then the workflow "Test conventional-commits-validator" must conclude in "success"
    And I close the PR
