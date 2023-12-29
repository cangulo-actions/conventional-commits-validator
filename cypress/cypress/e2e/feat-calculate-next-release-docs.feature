Feature: Calculate next release when docs are updated

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
                calculate-next-release: true
      """
    And I stage the file ".github/workflows/cc-test.yml"
    And I create a commit with the message "ci: added cc-test.yml with default config"

  Scenario: Valid Commits
    Given I modify the file "refresh.md" and commit it with the message "docs: updated readme"
    And I push my branch
    When I create a PR with title "feat: Calculate next release when docs are updated"
    Then the workflow "Test conventional-commits-validator" must conclude in "success"
    And the workflow must show "1" annotations
    And this annotation is of type "notice", has title "Changes will not generate a new release" and its message includes "commit messages don't include any change that trigger a release"
    And I close the PR
