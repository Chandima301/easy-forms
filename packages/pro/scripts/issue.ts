// Issue the license + registry token PAIR for one paid order, and print a
// ready-to-send delivery email. This is the normal per-order path.
//
//   pnpm --filter @easy-forms/pro license:issue -- \
//     --customer "Acme Inc" --seats 5 --months 12
//
//   # or an explicit expiry, plus a registry download grace window:
//   pnpm --filter @easy-forms/pro license:issue -- \
//     --customer "Acme Inc" --seats 5 --exp 2027-03-01 --registry-grace-days 7
//
// Reads the private key from packages/pro/.keys/private.key (or $EASY_FORMS_PRO_KEY).
import { buildIssuedTokens, resolveExpiry } from './issueTokens';
import { resolvePrivateKey } from './signToken';

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
const seats = Number(getArg('seats') ?? fail('--seats is required'));
if (!Number.isInteger(seats) || seats < 1) fail('--seats must be a positive integer');

const monthsRaw = getArg('months');
const expIso = getArg('exp');
const graceRaw = getArg('registry-grace-days');

let expiry: ReturnType<typeof resolveExpiry>;
try {
	expiry = resolveExpiry({
		months: monthsRaw !== undefined ? Number(monthsRaw) : undefined,
		expIso,
		registryGraceDays: graceRaw !== undefined ? Number(graceRaw) : undefined,
	});
} catch (err) {
	fail(err instanceof Error ? err.message : String(err));
}

const { licenseToken, registryToken, email } = buildIssuedTokens(
	{
		customer,
		seats,
		iatSec: expiry.iatSec,
		licenseExpSec: expiry.licenseExpSec,
		registryExpSec: expiry.registryExpSec,
	},
	resolvePrivateKey()
);

const licenseExp = new Date(expiry.licenseExpSec * 1000).toISOString().slice(0, 10);
const registryExp = new Date(expiry.registryExpSec * 1000).toISOString().slice(0, 10);

console.log(`Issued Pro tokens for "${customer}" (${seats} seat(s)).`);
console.log(`  license  expires ${licenseExp}`);
console.log(`  registry expires ${registryExp}`);
console.log('');
console.log('LICENSE KEY:');
console.log(licenseToken);
console.log('');
console.log('REGISTRY TOKEN:');
console.log(registryToken);
console.log('');
console.log('----- delivery email (copy/paste) -----');
console.log(email);
