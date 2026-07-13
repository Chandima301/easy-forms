// Shared maintainer-side signing helpers. Used by scripts/sign.ts (single token)
// and scripts/issue.ts (the license + registry pair). Keeps the two CLIs from
// diverging in how the private key is resolved or a token is built.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { base64urlToBytes, bytesToBase64url, stringToBase64url } from '../src/license/base64url';
import { ed, signingMessage } from '../src/license/ed25519';
import type { LicenseClaims } from '../src/license/types';

/**
 * Resolve the base64url private key from $EASY_FORMS_PRO_KEY or
 * packages/pro/.keys/private.key. Exits the process with a message if absent.
 */
export function resolvePrivateKey(): string {
	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const privatePath = resolve(scriptDir, '../.keys/private.key');
	const key =
		process.env.EASY_FORMS_PRO_KEY ??
		(existsSync(privatePath) ? readFileSync(privatePath, 'utf8').trim() : undefined);
	if (!key) {
		console.error('Error: no private key — run license:genkey first or set $EASY_FORMS_PRO_KEY');
		process.exit(1);
	}
	return key;
}

/** Sign claims into a `base64url(payload).base64url(signature)` token. */
export function buildToken(claims: LicenseClaims, privateKeyB64: string): string {
	const payloadSegment = stringToBase64url(JSON.stringify(claims));
	const signature = ed.sign(signingMessage(payloadSegment), base64urlToBytes(privateKeyB64));
	return `${payloadSegment}.${bytesToBase64url(signature)}`;
}
