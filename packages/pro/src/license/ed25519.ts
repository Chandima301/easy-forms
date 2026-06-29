// Shared Ed25519 setup + signing scheme, used by both the runtime verifier and
// the maintainer signer CLI so the two can never drift.
//
// @noble/ed25519 v2 exposes synchronous `sign`/`verify` only when
// `etc.sha512Sync` is wired up — do that once here, on import.
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export { ed };

/**
 * The exact bytes that get signed: the UTF-8 encoding of the base64url payload
 * segment. A token is `${payloadSegment}.${signatureSegment}` and the signature
 * covers `payloadSegment`.
 */
export function signingMessage(payloadSegment: string): Uint8Array {
	return new TextEncoder().encode(payloadSegment);
}
