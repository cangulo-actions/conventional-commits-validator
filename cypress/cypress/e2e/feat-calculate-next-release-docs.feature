Feature: Calculate next release when docs are updated

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
      """

  Scenario: Valid Commits
    Given I create a branch named "feat-calculate-next-release"
    And I push the next commits modifying the files:
      | <commig message>            | <file>        |
      | docs: updated docs/notes.md | docs/notes.md |
    When I create a PR with title "feat: Calculate next release when docs are updated"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "success"
    And the next annotations must be listed:
      | <level> | <title>                                 | <partial-message>                                               |
      | notice  | Changes will not generate a new release | commits won't trigger a new release |
