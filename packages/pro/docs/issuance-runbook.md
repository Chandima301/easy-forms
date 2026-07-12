# Easy Forms Pro — Issuance Runbook (Model A, manual)

How to turn a Polar.sh order into delivered tokens. All signing runs on the
maintainer machine that holds `packages/pro/.keys/private.key` (gitignored). The
private key never leaves this machine.

> Prereq: a keypair exists. If not, run once:
> `pnpm --filter @easy-forms/pro license:genkey`
> and paste the printed PUBLIC key into `src/license/publicKey.ts` (only needed
> when rotating keys — the committed public key already matches the live setup).

## New order

1. Open the Polar order notification. Note **customer name**, **quantity**
   (= seats), and the **subscription term** (monthly / yearly).
2. Mint both tokens (yearly example, 5 seats):

   ```sh
   pnpm --filter @easy-forms/pro license:issue -- \
     --customer "Acme Inc" --seats 5 --months 12
   ```

   Monthly plans: use `--months 1`. To give a few extra days to download after
   the term ends, add `--registry-grace-days 7`.
3. Copy the printed **delivery email** block into your reply and send it to the
   customer's billing/contact email from Polar.

## Renewal

Polar renewal notification → run the exact same `license:issue` command with the
new term. Send the fresh tokens. The new license key covers versions released up
to the new expiry; the new registry token re-opens the download window. The
customer replaces both tokens.

## Refund / cancellation

Do nothing. Access lapses naturally at the current `exp`:

- The **registry token** stops fetching updates and new premium items once it
  expires — but source already installed via `shadcn add` stays in their repo
  (inherent to own-the-code; not recoverable, by design).
- The **engine license** keeps a clean, unwatermarked app on every version
  released **during** the paid term (release-date gate). Only upgrading to a
  version published after `exp` re-triggers the watermark.

## Notes

- `seats` is contractual/honor-based — it is signed into the token for the record
  but not enforced at runtime. Set it to the Polar quantity.
- `license:sign` / `license:sign-registry` remain for one-off single-token needs;
  `license:issue` is the normal per-order path.
