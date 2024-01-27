Feature: Calculate next release with a version-prefix

  Background: The gh action runs with the calcualte-next-release flag enabled
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
            - name: Checkout                  # is required to check the repo so the GH action reads the version.json file
              uses: actions/checkout@v4.1.1
      
            - name: Validate Conventional Commits
              uses: cangulo-actions/conventional-commits-validator@<TARGET_BRANCH>
              with:
                calculate-next-release: true
                version-prefix: "v"
      """

  Scenario: Valid Commits
    Given I create a branch named "feat-calculate-next-release"
    And I push the next commits modifying the files:
      | <commig-message>                                | <file>                 |
      | ci: commit that fixes something in terraform    | terraform/main.tf      |
      | fix: commit that fixes something in the lambdas | src/lambda1/lambda1.py |
      | feat: commit that adds a feature in terraform   | terraform/db.tf        |
    When I create a PR with title "feat: calculate next release including a version-prefix"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "success"
    And the next annotations must be listed:
      | <level> | <title>      | <partial-message>      |
      | notice  | Next Release | v0.1.0 - minor release |
