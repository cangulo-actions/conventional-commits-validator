Feature: Fail when invalid configuration is provided

Background: The gh action runs with custom configurationuration
    Given I create a repository named "cc-PR-{PR_NUMBER}-{TEST_KEY}"
    And I push the file "commits-config-test.yml" to the branch "main" with the content:
      """
      commits:
        - type: ci  # miss the release type

      scopes:
        - tfm       # miss scope properties {key,files}
        - src
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
            - name: Validate Conventional Commits
              uses: cangulo-actions/conventional-commits-validator@<TARGET_BRANCH>
              with:
                configuration: commits-config-test.yml
      """

  Scenario: commits with invalid scope
    Given I create a branch named "invalid-configuration"
    And I commit "ci(src): updated lambda code" modifying the file "src/lambda1/lambda1.py"
    When I create a PR with title "invalid-configuration: configuration miss a commit release type"
    Then the workflow "cangulo-actions/conventional-commits-validator test" must conclude in "failure"
