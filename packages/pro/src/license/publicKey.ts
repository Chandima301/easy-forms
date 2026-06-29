// Embedded Ed25519 public key used to verify license tokens offline.
//
// This is the PUBLIC half of the keypair — it is safe to commit and ship. The
// matching PRIVATE key is held only by Easy Forms and never appears in this repo.
// Regenerate with `pnpm --filter @easy-forms/pro license:genkey` and paste the
// printed public key here.
//
// Stored as a base64url-encoded 32-byte key.
export const PRO_PUBLIC_KEY = 'S2gAdLOxyuBHOfTuTuqPo0UYlN9lQ1lhFY_UzX2ys2c';
