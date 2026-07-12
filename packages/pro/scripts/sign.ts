// Issue a signed license token.
//
//   pnpm --filter @easy-forms/pro license:sign -- \
//     --customer "Acme Inc" --edition pro --seats 5 --exp 2027-01-01
//
// Reads the private key from packages/pro/.keys/private.key (or $EASY_FORMS_PRO_KEY)
// and prints the token `base64url(payload).base64url(signature)`.
import { resolvePrivateKey, buildToken } from './signToken';
import type { LicenseClaims } from '../src/license/types';

function getArg(name: string): string | undefined {
	const flag = `--${name}`;
	const idx = process.argv.indexOf(flag);
	if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1];
	const inline = process.argv.find((a) => a.startsWith(`${flag}=`));
	return inline?.slice(flag.length + 1);
}

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

const customer = getArg('customer') ?? fail('--customer is required');
const edition = getArg('edition') ?? 'pro';
if (edition !== 'pro') fail(`unknown edition "${edition}" (expected "pro")`);
const aud = getArg('aud') ?? 'license';
if (aud !== 'license' && aud !== 'registry') {
	fail(`unknown aud "${aud}" (expected "license" or "registry")`);
}
const seats = Number(getArg('seats') ?? fail('--seats is required'));
if (!Number.isInteger(seats) || seats < 1) fail('--seats must be a positive integer');
const expRaw = getArg('exp') ?? fail('--exp is required (e.g. 2027-01-01)');
const expMs = Date.parse(expRaw);
if (Number.isNaN(expMs)) fail(`--exp "${expRaw}" is not a valid date`);

const claims: LicenseClaims = {
	customer,
	edition,
	seats,
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(expMs / 1000),
	aud: aud as 'license' | 'registry',
};

const token = buildToken(claims, resolvePrivateKey());

console.log(`Issued ${aud} token for "${customer}" (${seats} seat(s)), expires ${expRaw}:`);
console.log('');
console.log(token);
console.log('');
