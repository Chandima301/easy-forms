// base64url encode/decode helpers shared by the signer (Node) and the runtime
// verifier (browser). Implemented without Buffer so they run in any environment.

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Encode raw bytes as an unpadded base64url string. */
export function bytesToBase64url(bytes: Uint8Array): string {
	let out = '';
	for (let i = 0; i < bytes.length; i += 3) {
		const b0 = bytes[i] as number;
		const b1 = bytes[i + 1];
		const b2 = bytes[i + 2];
		out += CHARS[b0 >> 2];
		out += CHARS[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
		if (b1 === undefined) break;
		out += CHARS[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
		if (b2 === undefined) break;
		out += CHARS[b2 & 0x3f];
	}
	return out;
}

/** Decode an unpadded base64url string back to raw bytes. Throws on bad input. */
export function base64urlToBytes(input: string): Uint8Array {
	const lookup = new Map<string, number>();
	for (let i = 0; i < CHARS.length; i++) lookup.set(CHARS[i] as string, i);

	const out: number[] = [];
	let buffer = 0;
	let bits = 0;
	for (const ch of input) {
		const val = lookup.get(ch);
		if (val === undefined) throw new Error('invalid base64url character');
		buffer = (buffer << 6) | val;
		bits += 6;
		if (bits >= 8) {
			bits -= 8;
			out.push((buffer >> bits) & 0xff);
		}
	}
	return Uint8Array.from(out);
}

/** Encode a UTF-8 string as base64url. */
export function stringToBase64url(text: string): string {
	return bytesToBase64url(new TextEncoder().encode(text));
}

/** Decode a base64url string into a UTF-8 string. */
export function base64urlToString(input: string): string {
	return new TextDecoder().decode(base64urlToBytes(input));
}
