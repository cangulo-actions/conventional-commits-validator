Feature: CI workflow succeed after a PR is created

  Scenario: PR with one commit
    Given I checkout a branch
    And I commit the next change "<commitMsg>"
    When I create a PR with title "<prTitle>"
    Then the CI workflow triggered must succeed

    Examples: 
      | commitMsg                                       | prTitle        | 
      | fix: commit that fixes something                |   1 fix commit | 
      | ci: commit that won't trigger a release         |    1 ci commit | 
      | feat: commit that adds a feature                |  1 feat commit | 
      | break: commit that introduces a breaking change | 1 break commit | 

  Scenario: PR with multiple commits without scopes
    Given I checkout a branch
    And I commit the next changes
      | ci: commit that fixes something                |
      | fix: commit that fixes something               |
      | feat: commit that adds a feature               |
      | break: commit that introduce a breaking change |
    When I create a PR with title "multiple commits without scope"
    Then the CI workflow triggered must succeed

  Scenario: Merge a PR with multiple commits with scopes
    Given I checkout a branch
    And I commit the next changes
      | ci(tfm): commit that fixes something in terraform    | terraform/main.tf      |
      | fix(src): commit that fixes something in the lambdas | src/lambda1/lambda1.py |
      | feat(tfm): commit that adds a feature in terraform   | terraform/main.tf      |
      | break: commit that introduce a breaking change       | docs/notes.md          |
    When I create a PR with title "multiple commits with scope"
    Then the CI workflow triggered must succeed
