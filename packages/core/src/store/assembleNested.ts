// Nested value assembly — turns a flat, dot-keyed value map into nested
// objects/arrays for *output only* (submit handler / consumer reads). The
// store stays flat internally; this is a pure transform applied on the way out.
//
// Convention:
//   - a numeric path segment (`bankAccounts.0.currency`) is an array index;
//   - any other segment is an object key (`address.street`);
//   - a key that is a strict (dot-boundary) prefix of another key is a
//     *branch* — its own scalar is dropped so the indexed/nested children win
//     (a `repeatingGroup` container holds an index list scalar that must not
//     leak into output);
//   - an empty repeating group has no children, so its container scalar (`[]`)
//     is emitted as-is, yielding `key: []`;
//   - sparse array indices left by a removed middle row are compacted.

const isIndex = (segment: string): boolean => /^\d+$/.test(segment);

function setPath(root: Record<string, unknown>, segments: string[], value: unknown): void {
	// biome-ignore lint/suspicious/noExplicitAny: walking a heterogeneous nested tree.
	let node: any = root;
	for (let i = 0; i < segments.length - 1; i++) {
		// Loop bounds guarantee these indices are present.
		const seg = segments[i] as string;
		const nextSeg = segments[i + 1] as string;
		const key = isIndex(seg) ? Number(seg) : seg;
		const child = node[key];
		if (child === null || typeof child !== 'object') {
			node[key] = isIndex(nextSeg) ? [] : {};
		}
		node = node[key];
	}
	const last = segments[segments.length - 1] as string;
	node[isIndex(last) ? Number(last) : last] = value;
}

// Drop holes left by sparse array indices (a removed middle row) and recurse.
function compact(node: unknown): unknown {
	if (Array.isArray(node)) {
		// `filter` skips empty array slots, collapsing `[a, , c]` to `[a, c]`.
		return node.filter(() => true).map(compact);
	}
	if (node !== null && typeof node === 'object') {
		const obj = node as Record<string, unknown>;
		for (const key of Object.keys(obj)) obj[key] = compact(obj[key]);
		return obj;
	}
	return node;
}

export function assembleNestedValues(flat: Record<string, unknown>): Record<string, unknown> {
	const keys = Object.keys(flat);
	// Branch keys are a strict dot-boundary prefix of another key; their own
	// scalar is dropped so indexed/nested children win.
	const branch = new Set<string>();
	for (const key of keys) {
		const prefix = `${key}.`;
		if (keys.some((other) => other !== key && other.startsWith(prefix))) {
			branch.add(key);
		}
	}

	const root: Record<string, unknown> = {};
	for (const key of keys) {
		if (branch.has(key)) continue;
		setPath(root, key.split('.'), flat[key]);
	}
	return compact(root) as Record<string, unknown>;
}
