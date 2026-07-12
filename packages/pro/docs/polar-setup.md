# Easy Forms Pro — Polar.sh Setup Checklist

One-time setup, performed by the maintainer in the Polar dashboard. An automated
agent cannot do these steps — they require creating an account and entering
business/payment details.

## Why Polar

Merchant-of-Record: Polar handles VAT/sales-tax compliance when selling per-seat
to companies globally. We deliberately do **not** use Polar's built-in license
keys — our tokens are self-signed Ed25519 (stateless, provider-agnostic), so a
future provider swap touches only this doc and the runbook, not the engine.

## Steps

1. Create the Polar organization and complete payout/tax onboarding.
2. Create a **subscription** product:
   - Recurring (monthly and/or yearly).
   - **Per-seat** pricing — the purchase quantity becomes the token `seats`.
3. Enable Merchant-of-Record / automatic tax handling.
4. Create a **checkout link** for the product. This is the URL that goes in the
   public "Buy Pro" docs/marketing (see `apps/docs/.../pro-install.mdx`).
5. Confirm **order-notification email** is enabled so each purchase/renewal
   reaches the maintainer inbox (the trigger for the issuance runbook).

## After a purchase

Follow `issuance-runbook.md`. Nothing in Polar issues tokens — issuance is manual
(Model A). Automating it later (Model B: a webhook-triggered signing function
holding the private key as a secret) is deferred until purchase volume justifies
the infra.
