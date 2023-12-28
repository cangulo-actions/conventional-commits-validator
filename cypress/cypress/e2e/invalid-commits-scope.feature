Feature: Reject commits with invalid scopes

  Background: The gh action runs with custom configuration
    Given I checkout a branch from main
    And I create the "commits-config-test.yml" file with the next content:
      """
      commits:
        - type: ci
          release: none

      scopes:
        - key: tfm
          files:
            - "terraform/**"
        - key: src
          files:
            - "src/**"
      """
    And I stage the file "commits-config-test.yml"
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
                configuration: commits-config-test.yml
      """
    And I stage the file ".github/workflows/cc-test.yml"
    And I create a commit with the message "ci: added cc-test.yml with custom config"

  Scenario: commits with invalid scope
    Given I modify and stage the file: "src/lambda1/lambda1.py"
    And I create a commit with the message "ci(tfm): updated lambda code"
    And I push my branch
    When I create a PR with title "invalid-commits: wrong scope"
    Then the workflow "Test conventional-commits-validator" must conclude in "failure"
    And I close the PR
