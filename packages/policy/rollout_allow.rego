package apex.rollout

default allow := false

allow if {
  input.environment == "prod"
  input.guardrails.p95_edge <= 250
  input.guardrails.p95_node <= 450
  input.guardrails.error_rate <= 0.001
  input.tests.e2e_pass == true
  input.evidence.sig_valid == true
}

# Test mode: allow deploy to preview branches
