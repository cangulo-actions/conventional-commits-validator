Feature: Update version in package.json

  Background: 
    Given I create a repository named "cc-PR-{PR_NUMBER}-{TEST_KEY}"
    And I push the file "package.json" to the branch "main" with the content:
      """
      {
        "name": "@cangulo/npm-package-example",
        "version": "1.0.9",
        "description": "Carlos Angulo NPM project"
      }
      """
    And I push the file "commits-config-test.yml" to the branch "main" with the content:
      """
      versioning:
        file: package.json
      """
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
            - name: Checkout
              uses: actions/checkout@v4
      
            - name: Validate Conventional Commits
              uses: cangulo-actions/conventional-commits-validator@<TARGET_BRANCH>
              with:
                configuration: commits-config-test.yml
                calculate-next-release: true
      """

  Scenario: Commits with valid changes
    Given I create a branch named "calculate-next-release-custom-version-file"
    And I push the next commits modifying the files:
      | <commig-message>                                | <file>                 |
      | ci: commit that fixes something in terraform    | terraform/main.tf      |
      | fix: commit that fixes something in the lambdas | src/lambda1/lambda1.py |
      | feat: commit that adds a feature in terraform   | terraform/db.tf        |
      | break: commit that introduce a breaking change  | docs/notes.md          |
    When I create a PR with title "feat: calculate next release when breaking changes are introduced"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "success"
    And the next annotations must be listed:
      | <level> | <title>                               | <partial-message>           |
      | notice  | Next Release                          | 2.0.0 - major release       |
      | warning | Changes will generate a major release | Please check them carefully |
