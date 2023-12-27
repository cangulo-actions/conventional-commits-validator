  # Scenario: PR with multiple invalid commits with scopes

  #   Given I checkout a branch from main
  #   And I commit the next changes
  #     | ci(tfm): commit with scope tfm but modify lambdas         | src/lambda1/lambda1.py |
  #     | fix(src): commit with scope src but modify terraform code | terraform/main.tf      |
  #   When I create a PR with title "multiple invalid commits with scopes"
  #   Then the CI workflow triggered must conclude in "failure"
