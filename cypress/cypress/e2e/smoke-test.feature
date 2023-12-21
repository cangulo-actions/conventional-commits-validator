Feature: Smoke tests

  @smoke
  Scenario: I create a PR with one commit fixing something
    Given I checkout a branch
    And I commit the next change "fix: commit that fixes something"
    When I create a PR with title "cc smoke test"
    Then the CI workflow triggered must conclude in "success"
