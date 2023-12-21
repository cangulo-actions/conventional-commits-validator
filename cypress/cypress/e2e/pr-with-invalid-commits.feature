Feature: CI workflow fail because of invalid commits

  Scenario: PR with one invalid commit
    Given I checkout a branch
    And I commit the next change "<commitMsg>"
    When I create a PR with title "<prTitle>"
    Then the CI workflow triggered must conclude in "failure"

    Examples: 
      | commitMsg                         | prTitle               |
      | fix2: commit that fixes something | invalid scope         |
      | wrong commit message              | unconventional commit |

  Scenario: PR with multiple invalid commits with scopes
    Given I checkout a branch
    And I commit the next changes
      | ci(tfm): commit with scope tfm but modify lambdas         | src/lambda1/lambda1.py |
      | fix(src): commit with scope src but modify terraform code | terraform/main.tf      |
    When I create a PR with title "multiple invalid commits with scopes"
    Then the CI workflow triggered must conclude in "failure"
