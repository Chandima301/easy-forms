// One-time Ed25519 keypair generation for issuing license tokens.
//
//   pnpm --filter @easy-forms/pro license:genkey
//
// Writes the PRIVATE key to packages/pro/.keys/private.key (gitignored — NEVER
// commit it) and prints the PUBLIC key to paste into src/license/publicKey.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bytesToBase64url } from '../src/license/base64url';
import { ed } from '../src/license/ed25519';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const keysDir = resolve(scriptDir, '../.keys');
const privatePath = resolve(keysDir, 'private.key');

const privateKey = ed.utils.randomPrivateKey();
const publicKey = ed.getPublicKey(privateKey);

mkdirSync(keysDir, { recursive: true });
writeFileSync(privatePath, bytesToBase64url(privateKey), { encoding: 'utf8' });

console.log('Generated Ed25519 keypair.');
console.log(`Private key written to: ${privatePath}  (gitignored — keep secret)`);
console.log('');
console.log('Paste this PUBLIC key into src/license/publicKey.ts (PRO_PUBLIC_KEY):');
console.log('');
console.log(`  ${bytesToBase64url(publicKey)}`);
console.log('');
