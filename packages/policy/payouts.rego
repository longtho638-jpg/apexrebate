package apex.payouts

default allow_payout := false

allow_payout if {
  not input.flags.kill_switch_payout
  input.user.kyc == true
  input.rules.wash_trading_prohibited == true
  input.rules.self_referral_prohibited == true
  input.txn.value > 0
  input.txn.age_days >= 0
  input.txn.age_days <= input.rules.clawback_window_days
}

# Clawback allowed when conditions met
allow_clawback if {
  input.user.kyc == true
  input.clawback_reason != ""
}
