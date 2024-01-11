Feature: Validate scopes using custom configuration

  Background: The gh action runs with custom configurationuration
    Given I create a repository named "cc-PR-{PR_NUMBER}-{TEST_KEY}"
    And I push the file "commits-config-test.yml" to the branch "main" with the content:
      """
      scopes:
        - key: tfm
          files:
            - "terraform/**"
        - key: src
          files:
            - "src/**"
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
      """

  Scenario: Commits with valid scopes
    Given I create a branch named "valid-commits-scopes"
    And I push the next commits modifying the files:
      | <commig message>                                     | <file>                 |
      | ci(tfm): commit that fixes something in terraform    | terraform/main.tf      |
      | fix(src): commit that fixes something in the lambdas | src/lambda1/lambda1.py |
      | feat(tfm): commit that adds a feature in terraform   | terraform/db.tf        |
      | break: commit that introduce a breaking change       | docs/notes.md          |
    When I create a PR with title "valid-commits: modifications match configuration"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "success"
