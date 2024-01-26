Feature: Validate Commit types using default configuration

  Background: The gh action is configured with the default configuration
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

  Scenario: Valid Commits
    Given I create a branch named "valid-commits-types"
    And I push the next commits modifying the files:
      | <commig message>                                | <file>                 |
      | ci: commit that fixes something in terraform    | terraform/main.tf      |
      | fix: commit that fixes something in the lambdas | src/lambda1/lambda1.py |
      | feat: commit that adds a feature in terraform   | terraform/db.tf        |
      | break: commit that introduce a breaking change  | docs/notes.md          |
    When I create a PR with title "valid-commits: correct commit types provided"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "success"
