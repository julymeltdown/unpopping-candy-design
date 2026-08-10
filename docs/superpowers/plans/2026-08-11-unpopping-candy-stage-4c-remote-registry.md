# Stage 4C Remote Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in, signed, bounded, SSRF-resistant remote Registry source while preserving the existing local Registry's dry-run, approval, containment, checksum, conflict, and create-only guarantees.

**Architecture:** Network retrieval is an untrusted input adapter, never a write service. A remote source verifies an HTTPS origin, every DNS result and redirect, a canonical Ed25519-signed source-neutral manifest, an immutable revision, limits, and every raw file digest before a shared engine renders variables and computes a separate output digest. Bundled source paths remain private to the local adapter; both adapters normalize the complete target, variable, and file schema before planning. Remote support remains disabled unless a machine-checked owner approval records concrete adopter demand, operating ownership, credentials, retention, incident response, and the exact allowed origin and trusted key.

**Tech Stack:** Node.js 22.13+/24 built-ins (`node:crypto`, `node:dns/promises`, `node:http`, `node:https`, `node:net`, `node:stream`), TypeScript, Node test runner, property-based byte/path corpora, pnpm 11, Changesets.

## Global Constraints

- This stage starts only after a concrete adopter proves npm plus the checksum-backed local Registry is insufficient and the project owner separately approves demand, owner, budget, credentials, retention, incident response, allowed origins, and trusted keys.
- Public brand is `Unpopping Candy`; the public command is `popcandy`; do not introduce `commonspace` names.
- Public package `@unpopping-candy/registry` remains ESM and supports Node.js 22.13+ and 24.x.
- Network sources are HTTPS-only and must match an exact configured origin allowlist; command-line URL overrides are forbidden.
- Resolve and validate every address before a connection and after every redirect. Reject private, loopback, link-local, multicast, unspecified, reserved, IPv4-mapped IPv6, and cloud-metadata destinations.
- Do not forward cookies, authorization, proxy authorization, client certificates, or caller-supplied headers across origins. Registry credentials are scoped to one exact origin.
- Enforce numeric limits for redirects, wall-clock time, response bytes, manifest entries, total files, per-file bytes, total uncompressed bytes, and compression ratio.
- Accept only a canonical JSON manifest signed with Ed25519 by a configured trusted key. The immutable revision is the lowercase SHA-256 digest of the canonical unsigned manifest bytes.
- Verify each file's signed/raw byte length and SHA-256 digest before rendering. Compute separate post-variable-render output bytes and SHA-256; plans, approvals, writes, and receipts bind both identities.
- Reject NUL, absolute, traversal, duplicate, case-colliding, symlink-escaping target paths and all registry-supplied shell, lifecycle, install, or post-write commands.
- Apply only in an owner-controlled, non-shared workspace. Portable Node lacks dirfd-relative `openat2` guarantees, so ancestor fingerprints and repeated checks reduce but do not eliminate concurrent hostile path replacement risk.
- Dry-run remains the default. A remote apply requires an explicit approval bound to the exact dry-run plan digest, revision, project root, and target directory.
- Writes are create-only and conflict-first. Stage every file beside its destination, promote in deterministic path order without overwriting, verify rollback targets by inode and digest, and emit success or failure receipts. This is not a transactional multi-file filesystem API; an atomic directory rename is used only when the entire target directory is new.
- No hosted MCP or Registry deployment exposes mutation. Remote retrieval runs in the user's local CLI/process; `apps/docs-mcp` remains read-only and uses separate credentials.
- External publication, credentials, DNS, storage, hosted infrastructure, repository settings, and on-call activation require explicit owner authorization.

---

## File map

| Responsibility                             | Paths                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Demand and owner gate                      | `docs/registry/remote-registry-approval.schema.json`, `scripts/lib/remote-registry-approval.mjs`, `scripts/verify-remote-registry-approval.mjs`, `scripts/generate-remote-registry-policy.mjs`, `packages/registry/src/remote/approved-policy.ts`, `tests/architecture/remote-registry-approval.test.mjs`, `package.json`                                                                               |
| Threat model and runbook                   | `docs/security/remote-registry-threat-model.md`, `docs/registry/REMOTE_REGISTRY.md`, `SECURITY.md`                                                                                                                                                                                                                                                                                                      |
| Shared verified-source boundary            | `packages/registry/src/source.ts`, `packages/registry/src/manifest-schema.ts`, `packages/registry/src/registry.ts`, `packages/registry/src/types.ts`, `packages/registry/src/index.ts`, `packages/registry/test/registry.test.ts`                                                                                                                                                                       |
| Signed envelope                            | `packages/registry/src/remote/canonical-json.ts`, `packages/registry/src/remote/signature.ts`, `packages/registry/src/remote/types.ts`, `packages/registry/test/remote-signature.test.ts`                                                                                                                                                                                                               |
| SSRF-safe transport                        | `packages/registry/src/remote/address-policy.ts`, `packages/registry/src/remote/http-client.ts`, `packages/registry/test/remote-address-policy.test.ts`, `packages/registry/test/remote-http-client.test.ts`                                                                                                                                                                                            |
| Remote verified source                     | `packages/registry/src/remote/source.ts`, `packages/registry/test/remote-source.integration.test.ts`                                                                                                                                                                                                                                                                                                    |
| Plan approval, recoverable apply, receipts | `packages/registry/src/approval.ts`, `packages/registry/src/staged-write.ts`, `packages/registry/src/receipt.ts`, `packages/registry/src/registry.ts`, `packages/registry/src/types.ts`, `packages/registry/test/remote-apply.test.ts`                                                                                                                                                                  |
| Local CLI wiring and isolation gate        | `packages/cli/src/remote-registry-config.ts`, `packages/cli/src/registry-service-resolver.ts`, `packages/cli/src/bin.ts`, `packages/cli/src/commands.ts`, `packages/cli/src/types.ts`, `packages/cli/test/remote-registry.test.ts`, `schemas/popcandy-config.schema.json`, `scripts/verify-no-hosted-registry-mutation.mjs`, `tests/architecture/no-hosted-registry-mutation.test.mjs`, `apps/docs-mcp` |
| Adversarial evidence and release           | `packages/registry/test/remote-registry.fuzz.test.ts`, `packages/registry/README.md`, `.changeset/remote-registry.md`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`                                                                                                                                                                                                                      |

## Entry condition

Task 1 is the only implementation allowed before approval. If `npm run registry:remote:approval` does not print `Remote Registry Stage 4C approval verified.`, stop without starting Task 2. Preparing the schema and verifier is permitted; downloading content, configuring credentials, deploying infrastructure, or enabling remote behavior is not.

### Task 1: Make adopter demand and operating ownership a blocking gate

**Files:**

- Create: `docs/registry/remote-registry-approval.schema.json`
- Create: `scripts/lib/remote-registry-approval.mjs`
- Create: `scripts/verify-remote-registry-approval.mjs`
- Create: `scripts/generate-remote-registry-policy.mjs`
- Generate: `packages/registry/src/remote/approved-policy.ts`
- Create: `tests/architecture/remote-registry-approval.test.mjs`
- Modify: `package.json`
- Owner-supplied input, never fabricated by an implementation worker: `docs/registry/remote-registry-stage-4c.approval.json`

**Interfaces:**

- Produces: `validateRemoteRegistryApproval(value, now): { ok: boolean; errors: readonly string[] }` and a sanitized generated `approvedRemoteRegistryPolicy` containing only `schemaVersion`, `reviewBy`, exact allowed origins, and trusted public keys.
- Requires an approval document with `schemaVersion: 1`, `status: "approved"`, non-empty adopter evidence and insufficiency statements, owner/on-call/incident/retention/budget fields, one or more exact `https:` origins, Ed25519 trusted keys, approval signer, and an unexpired `approvedAt`/`reviewBy` interval.

- [ ] **Step 1: Write the failing architecture tests**

```js
assert.equal(
  validateRemoteRegistryApproval(
    approvedFixture,
    new Date("2026-08-11T00:00:00Z"),
  ).ok,
  true,
);
assert.deepEqual(
  validateRemoteRegistryApproval(
    { ...approvedFixture, operatingOwner: "" },
    new Date("2026-08-11T00:00:00Z"),
  ).errors,
  ["operatingOwner must name the accountable maintainer"],
);
assert.equal(
  validateRemoteRegistryApproval(
    { ...approvedFixture, allowedOrigins: ["http://registry.example.test"] },
    new Date("2026-08-11T00:00:00Z"),
  ).ok,
  false,
);
```

- [ ] **Step 2: Observe the red test**

Run: `node --test tests/architecture/remote-registry-approval.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/remote-registry-approval.mjs`.

- [ ] **Step 3: Implement the schema, validator, and command**

Use this exact top-level contract; every string must be supplied by the owner and pass the constraints stated after the interface:

```ts
export interface RemoteRegistryStage4cApproval {
  readonly schemaVersion: 1;
  readonly status: "approved";
  readonly adopterEvidence: readonly [string, ...string[]];
  readonly npmLocalRegistryInsufficiency: string;
  readonly operatingOwner: string;
  readonly onCallOwner: string;
  readonly incidentPolicy: string;
  readonly retentionPolicy: string;
  readonly budgetOwner: string;
  readonly credentialOwner: string;
  readonly allowedOrigins: readonly [string, ...string[]];
  readonly trustedKeys: readonly [TrustedRegistryKey, ...TrustedRegistryKey[]];
  readonly approvedBy: string;
  readonly approvedAt: string;
  readonly reviewBy: string;
}
```

The verifier must reject unknown keys, missing values, non-HTTPS origins, origins containing credentials/path/query/fragment, duplicate key IDs, invalid SPKI base64, expired review dates, and approval files not tracked by Git. Add `registry:remote:approval` as `node scripts/verify-remote-registry-approval.mjs`, `registry:remote:policy` as `node scripts/generate-remote-registry-policy.mjs`, and `registry:remote:policy:check` as the same generator with `--check`. The generated TypeScript asset is the runtime trust anchor packaged with Registry; it must exclude adopter evidence, owner names, budget, incident/retention text, and every credential.

- [ ] **Step 4: Run the focused gate**

Run:

```bash
node --test tests/architecture/remote-registry-approval.test.mjs
npm run registry:remote:approval
npm run registry:remote:policy
npm run registry:remote:policy:check
```

Expected: tests PASS. The approval command either prints the exact success sentence from the entry condition or exits 1 with every missing owner decision. Exit 1 blocks policy generation and all later tasks. The generated policy check exits 0 and a test asserts it is the exact sanitized projection of the tracked approval.

- [ ] **Step 5: Commit the gate only after an owner-supplied approval passes**

```bash
git add docs/registry/remote-registry-approval.schema.json docs/registry/remote-registry-stage-4c.approval.json scripts/lib/remote-registry-approval.mjs scripts/verify-remote-registry-approval.mjs scripts/generate-remote-registry-policy.mjs packages/registry/src/remote/approved-policy.ts tests/architecture/remote-registry-approval.test.mjs package.json
git commit -m "chore: gate remote registry implementation"
```

### Task 2: Put local and remote bytes behind one verified source boundary

**Files:**

- Create: `packages/registry/src/source.ts`
- Create: `packages/registry/src/manifest-schema.ts`
- Modify: `packages/registry/src/registry.ts`
- Modify: `packages/registry/src/types.ts`
- Modify: `packages/registry/src/index.ts`
- Modify: `packages/registry/test/registry.test.ts`
- Generate: `packages/registry/src/registry.json`
- Generate: `agent/manifests/registry.json`

**Interfaces:**

- Produces `RegistrySource`, `OpenedRegistrySource`, `RegistryRawFile`, `NormalizedRegistryCatalog`, `NormalizedRegistryTemplate`, `NormalizedRegistryFile`, `RegistrySourceProvenance`, and internal `createRegistryServiceFromSource(source)`.
- Preserves the public signatures `createRegistryService(options: RegistryServiceOptions)` and `createBundledRegistryService(catalog): RegistryService`.

```ts
export interface RegistryRawFile {
  readonly content: Uint8Array;
  readonly rawDigest: string;
  readonly rawBytes: number;
}

export type RegistryTarget = "react-vite" | "react-vite-fsd";

export interface NormalizedRegistryVariable {
  readonly name: string;
  readonly description: string;
  readonly defaultValue?: string;
}

export interface NormalizedRegistryFile {
  readonly index: number;
  readonly pathTemplate: string;
  readonly role: string;
  readonly rawDigest: string;
  readonly rawBytes: number;
}

export interface NormalizedRegistryTemplate {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly target: RegistryTarget;
  readonly variables: readonly NormalizedRegistryVariable[];
  readonly files: readonly NormalizedRegistryFile[];
}

export interface NormalizedRegistryCatalog {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly packageVersion: string;
  readonly templates: readonly NormalizedRegistryTemplate[];
}

export interface RegistryFileManifest {
  readonly path: string;
  readonly role: string;
  readonly rawDigest: string;
  readonly rawBytes: number;
}

export interface RegistrySource {
  open(): Promise<OpenedRegistrySource>;
}

export interface OpenedRegistrySource {
  readonly catalog: NormalizedRegistryCatalog;
  readonly provenance: RegistrySourceProvenance;
  readRawFile(templateId: string, fileIndex: number): Promise<RegistryRawFile>;
}

export type RegistrySourceProvenance =
  | { readonly kind: "bundled"; readonly packageVersion: string }
  | {
      readonly kind: "remote";
      readonly origin: string;
      readonly revision: string;
      readonly keyId: string;
    };
```

- [ ] **Step 1: Add failing local-regression tests** asserting bundled manifest ordering, dry-run no-write, create-only apply, conflict-first behavior, traversal/absolute/NUL rejection, and symlink containment still pass through `RegistrySource`. Assert a raw file containing `{{componentPrefix}}` has one `rawDigest`/`rawBytes`, while `AccountProfileSettings` produces distinct `renderedDigest`/`renderedBytes` in the plan.
- [ ] **Step 2: Run `pnpm --filter @unpopping-candy/registry test`** and expect FAIL because `RegistrySource` is not exported.
- [ ] **Step 3: Extract local reads into `createLocalRegistrySource(options)`** and make the existing factories delegate to the source-backed engine. Validate `packages/registry/templates/` source prefixes, realpaths, and symlink containment only inside this local adapter; do not expose a `source` path in `RegistryFileManifest` or any remote DTO. Normalize the exact target union, variable keys (`name`, `description`, optional `defaultValue`), and file keys (`path`, `role`, raw digest, raw bytes) with unknown keys rejected. Decode verified bytes as fatal UTF-8 and compute rendered digest/bytes after substitution.
- [ ] **Step 4: Regenerate source-neutral Registry manifests and run local gates**

Run:

```bash
npm run registry:generate
npm run registry:check
pnpm --filter @unpopping-candy/registry test
pnpm --filter @unpopping-candy/registry typecheck
```

Expected: both generated manifests contain `rawDigest` and `rawBytes`, contain no local `source` fields, and every command exits 0 with original bundled behavior unchanged.

- [ ] **Step 5: Commit**

```bash
git add packages/registry/src/source.ts packages/registry/src/manifest-schema.ts packages/registry/src/registry.ts packages/registry/src/types.ts packages/registry/src/index.ts packages/registry/test/registry.test.ts packages/registry/src/registry.json agent/manifests/registry.json
git commit -m "refactor: isolate registry content sources"
```

### Task 3: Verify canonical signed manifests and immutable revisions

**Files:**

- Create: `packages/registry/src/remote/types.ts`
- Create: `packages/registry/src/remote/canonical-json.ts`
- Create: `packages/registry/src/remote/signature.ts`
- Create: `packages/registry/test/remote-signature.test.ts`
- Modify: `packages/registry/src/index.ts`

**Interfaces:**

```ts
export interface RemoteRegistryFileDto {
  readonly path: string;
  readonly role: string;
  readonly digest: string;
  readonly bytes: number;
}

export interface RemoteRegistryTemplateDto {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly target: "react-vite" | "react-vite-fsd";
  readonly variables: readonly {
    readonly name: string;
    readonly description: string;
    readonly defaultValue?: string;
  }[];
  readonly files: readonly RemoteRegistryFileDto[];
}

export interface RemoteRegistryManifestDto {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly packageVersion: string;
  readonly templates: readonly RemoteRegistryTemplateDto[];
}

export interface RemoteRegistryEnvelope {
  readonly schemaVersion: 1;
  readonly manifest: RemoteRegistryManifestDto;
  readonly revision: string;
  readonly signatures: readonly RemoteRegistrySignature[];
}

export interface RemoteRegistrySignature {
  readonly keyId: string;
  readonly algorithm: "Ed25519";
  readonly valueBase64: string;
}

export interface TrustedRegistryKey {
  readonly keyId: string;
  readonly algorithm: "Ed25519";
  readonly publicKeySpkiBase64: string;
}

export interface VerifiedRemoteManifest {
  readonly catalog: NormalizedRegistryCatalog;
  readonly canonicalBytes: Uint8Array;
  readonly revision: string;
  readonly keyId: string;
}

export function verifyRemoteRegistryEnvelope(
  input: Uint8Array,
  trustedKeys: readonly TrustedRegistryKey[],
): VerifiedRemoteManifest;
```

- [ ] **Step 1: Write failing tests** using a test-only generated Ed25519 keypair for a valid signature, one-byte payload mutation, unknown key, duplicate JSON key, non-canonical number, invalid base64, malformed SPKI, wrong algorithm, revision mismatch, duplicate template/file path, case-colliding path, and a file digest not matching `/^[a-f0-9]{64}$/`. At each manifest object level, add unknown keys named `scripts`, `hooks`, `install`, `postWrite`, and `command` and assert schema rejection. Also sign a valid template file whose arbitrary text contains those words and assert the raw bytes are accepted after its digest verifies.
- [ ] **Step 2: Run `node --experimental-strip-types --test packages/registry/test/remote-signature.test.ts`** and expect FAIL with the missing verifier export.
- [ ] **Step 3: Implement strict UTF-8 JSON parsing and RFC 8785 JSON Canonicalization Scheme ordering** for null, booleans, strings, arrays, objects, and safe integers. Tokenize number lexemes before `JSON.parse`; reject fractions, exponents, values outside `Number.MIN_SAFE_INTEGER` through `Number.MAX_SAFE_INTEGER`, duplicate keys, lone surrogates, and non-finite values before JavaScript can round them. Compute `revision = sha256(canonicalBytes)` and verify Ed25519 over the same bytes with `crypto.verify(null, canonicalBytes, key, signature)`; `undefined` is acceptable only where the installed Node type overload represents the same Ed25519 no-prehash mode. Never pass a hash algorithm string. Require signatures sorted by unique `keyId` and accept only a signature that verifies against the configured key with the same ID.
- [ ] **Step 4: Validate and normalize manifest schemas** before returning: schema 1 only; exact object keys; non-empty package/template IDs; the complete target and variables contracts from Task 2; unique IDs and target paths; normalized relative target templates; finite safe-integer byte counts; entry limits supplied by policy; and exact SHA-256 strings. Unknown command-like keys are rejected because they are not part of these manifest schemas. Do not inspect or ban text inside arbitrary verified template file bytes. Export the generated `approvedRemoteRegistryPolicy` through the package root so installed CLI code never reads repository-relative approval files.
- [ ] **Step 5: Run `npm run registry:remote:policy:check && node --experimental-strip-types --test packages/registry/test/remote-signature.test.ts && pnpm --filter @unpopping-candy/registry typecheck`** and expect PASS.
- [ ] **Step 6: Commit**

```bash
git add packages/registry/src/remote/types.ts packages/registry/src/remote/canonical-json.ts packages/registry/src/remote/signature.ts packages/registry/src/index.ts packages/registry/test/remote-signature.test.ts
git commit -m "feat: verify signed registry manifests"
```

### Task 4: Build an SSRF-resistant bounded HTTPS client

**Files:**

- Create: `packages/registry/src/remote/address-policy.ts`
- Create: `packages/registry/src/remote/http-client.ts`
- Create: `packages/registry/test/remote-address-policy.test.ts`
- Create: `packages/registry/test/remote-http-client.test.ts`

**Interfaces:**

```ts
export interface RemoteRegistryLimits {
  readonly maxRedirects: number;
  readonly timeoutMs: number;
  readonly maxManifestBytes: number;
  readonly maxEntries: number;
  readonly maxFiles: number;
  readonly maxFileBytes: number;
  readonly maxTotalUncompressedBytes: number;
  readonly maxCompressedResponseBytes: number;
  readonly maxCompressionRatio: number;
}

export const DEFAULT_REMOTE_REGISTRY_LIMITS = {
  maxRedirects: 3,
  timeoutMs: 10_000,
  maxManifestBytes: 1_048_576,
  maxEntries: 2_000,
  maxFiles: 5_000,
  maxFileBytes: 1_048_576,
  maxTotalUncompressedBytes: 20_971_520,
  maxCompressedResponseBytes: 1_048_576,
  maxCompressionRatio: 20,
} as const satisfies RemoteRegistryLimits;

export interface SafeFetchOptions {
  readonly allowedOrigins: ReadonlySet<string>;
  readonly limits: RemoteRegistryLimits;
  readonly credentialForOrigin?: (
    origin: string,
  ) => Promise<{ readonly authorization: string } | undefined>;
}

interface SafeFetchDependencies {
  readonly resolve: (
    hostname: string,
  ) => Promise<readonly { address: string; family: 4 | 6 }[]>;
  readonly request: typeof import("node:https").request;
}

export function assertPublicRegistryAddress(address: string): void;
export function createSafeRegistryFetcher(
  options: SafeFetchOptions,
  dependencies: SafeFetchDependencies,
): (url: URL, byteLimit: number) => Promise<Uint8Array>;
```

- [ ] **Step 1: Write failing address-policy tests** for IPv4 and IPv6 loopback, RFC 1918, carrier-grade NAT, link-local, unique-local, unspecified, multicast, documentation/reserved blocks, IPv4-mapped IPv6, `169.254.169.254`, `fd00:ec2::254`, mixed public/private DNS answers, empty answers, and valid public addresses.
- [ ] **Step 2: Write failing transport tests** with local fake resolver/connector seams for HTTP rejection, non-allowlisted origin, credentialed URL, redirect loops, fourth redirect, a redirect to a private address, DNS answer change between redirect hops, origin change without credential forwarding, slow headers/body, over-limit `Content-Length`, compressed chunk overflow, decompressed overflow, gzip ratio overflow, stale keep-alive socket reuse across different DNS pins, and partial body cleanup.
- [ ] **Step 3: Run `node --experimental-strip-types --test packages/registry/test/remote-address-policy.test.ts packages/registry/test/remote-http-client.test.ts`** and expect FAIL for missing modules.
- [ ] **Step 4: Implement literal-IP and resolved-address classification** with byte-level parsing; do not use hostname suffix checks. Require every DNS answer to be public. Keep `SafeFetchDependencies` internal and never export resolver/request injection from the package root or accept it through `RemoteRegistrySourceOptions`; production constructs it only from Node built-ins, while tests inject their controlled transport. Pin the chosen validated address into the connection lookup callback while retaining the original URL hostname for TLS SNI and certificate verification. Disable socket reuse with `agent: false`, or use a private agent whose pool key includes origin plus pinned address and whose socket is destroyed before a different pin; tests must prove no previously validated socket bypasses a later DNS decision. Repeat resolution, pinning, allowlist, and address checks for every redirect.
- [ ] **Step 5: Implement bounded streaming** with one abort deadline for DNS, connect, headers, redirects, decompression, and body. Accept `identity` and bounded `gzip`; reject other encodings. Count wire-compressed bytes before decompression and decoded bytes after decompression, enforcing `maxCompressedResponseBytes`, the applicable manifest/file decoded limit, `maxTotalUncompressedBytes`, and `maxCompressionRatio` incrementally. Destroy the response on the first exceeded limit even when `Content-Length` is absent or false. Configuration may only lower a default numeric ceiling; reject zero, negative, non-safe-integer, non-finite, or increased values.
- [ ] **Step 6: Enforce credentials** by accepting only `Authorization` from the configured provider for the request's exact origin; never accept cookies, proxy headers, arbitrary caller headers, environment proxy routing, or forwarding after an origin change.
- [ ] **Step 7: Run the focused tests and typecheck**

```bash
node --experimental-strip-types --test packages/registry/test/remote-address-policy.test.ts packages/registry/test/remote-http-client.test.ts
pnpm --filter @unpopping-candy/registry typecheck
```

Expected: PASS; test logs show every redirect performs a new DNS validation and cross-origin requests contain no credential header.

- [ ] **Step 8: Commit**

```bash
git add packages/registry/src/remote/address-policy.ts packages/registry/src/remote/http-client.ts packages/registry/test/remote-address-policy.test.ts packages/registry/test/remote-http-client.test.ts
git commit -m "feat: add bounded registry transport"
```

### Task 5: Download only content-addressed files into a verified remote source

**Files:**

- Create: `packages/registry/src/remote/source.ts`
- Create: `packages/registry/test/remote-source.integration.test.ts`
- Modify: `packages/registry/src/types.ts`
- Modify: `packages/registry/src/index.ts`

**Interfaces:**

```ts
export interface RemoteRegistrySourceOptions {
  readonly manifestUrl: URL;
  readonly allowedOrigins: readonly string[];
  readonly trustedKeys: readonly TrustedRegistryKey[];
  readonly limits?: Partial<RemoteRegistryLimits>;
  readonly credentialForOrigin?: (
    origin: string,
  ) => Promise<{ readonly authorization: string } | undefined>;
}

export function createRemoteRegistrySource(
  options: RemoteRegistrySourceOptions,
): RegistrySource;
export function createRemoteRegistryService(
  options: RemoteRegistrySourceOptions,
): RegistryService;

export interface RemoteRegistryContentKey {
  readonly revision: string;
  readonly digest: string;
}
```

- [ ] **Step 1: Write the failing integration test** against an in-process HTTPS fixture with a generated CA explicitly trusted by the injected test request function. The resolver returns a policy-valid public address while the injected request function routes only that test connection to the loopback fixture; production never receives this injection. Serve `/manifest.json` and immutable file URLs shaped as `/revisions/{revision}/files/{digest}`. Assert a valid dry-run returns remote origin/revision/key ID and writes nothing.
- [ ] **Step 2: Add failing cases** for mutable revision content, a manifest-supplied `source` or URL field, missing file, signed/raw byte-count mismatch, signed/raw digest mismatch, total byte overflow, too many entries/files, duplicate digest with conflicting bytes, and a raw file containing invalid UTF-8. Add a passing case where two different variable sets share the same raw digest but produce different rendered digests and byte counts.
- [ ] **Step 3: Run `node --experimental-strip-types --test packages/registry/test/remote-source.integration.test.ts`** and expect FAIL for the missing factory.
- [ ] **Step 4: Implement `RegistrySource.open()`** so it fetches and verifies one envelope, then returns an `OpenedRegistrySource` pinned to that catalog, provenance, and revision for the entire plan/apply operation. Every remote content identity is exactly `{ revision, digest }`, and the client alone constructs each file URL from the verified manifest URL plus `/revisions/{revision}/files/{digest}`. The signed DTO contains no local `source`, absolute URL, origin, or redirect target. Cache only verified raw bytes by `(origin, revision, digest)` for the life of one service instance; failed or partial responses never enter the cache.
- [ ] **Step 5: Recompute raw byte count and SHA-256 before returning each `RegistryRawFile`** and include the verified `origin`, `revision`, and `keyId` in provenance. Variable substitution happens later in the shared planner, which records separate `renderedDigest` and `renderedBytes` without changing the signed/raw identity.
- [ ] **Step 6: Run `node --experimental-strip-types --test packages/registry/test/remote-source.integration.test.ts && pnpm --filter @unpopping-candy/registry typecheck`** and expect PASS.
- [ ] **Step 7: Commit**

```bash
git add packages/registry/src/remote/source.ts packages/registry/src/types.ts packages/registry/src/index.ts packages/registry/test/remote-source.integration.test.ts
git commit -m "feat: add verified remote registry source"
```

### Task 6: Bind explicit approval to a recoverable, checksum-verified apply

**Files:**

- Create: `packages/registry/src/approval.ts`
- Create: `packages/registry/src/staged-write.ts`
- Create: `packages/registry/src/receipt.ts`
- Create: `packages/registry/test/remote-apply.test.ts`
- Modify: `packages/registry/src/registry.ts`
- Modify: `packages/registry/src/types.ts`
- Modify: `packages/registry/src/index.ts`

**Interfaces:**

```ts
export interface ScaffoldApproval {
  readonly schemaVersion: 1;
  readonly planDigest: string;
  /** Caller-supplied audit label; this is not an identity or authorization proof. */
  readonly approvedBy: string;
  readonly approvedAt: string;
}

export interface ScaffoldFilePlan {
  readonly relativeTarget: string;
  readonly status: ScaffoldFileStatus;
  readonly rawDigest: string;
  readonly rawBytes: number;
  readonly renderedDigest: string;
  readonly renderedBytes: number;
  readonly finalMode: number;
  readonly currentDigest?: string;
}

export interface RegistryAuditReceipt {
  readonly schemaVersion: 1;
  readonly receiptId: string;
  readonly source: RegistrySourceProvenance;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly projectRootDigest: string;
  readonly targetDirectory: string;
  readonly mode: ScaffoldMode;
  readonly planDigest: string;
  readonly approval: ScaffoldApproval | null;
  readonly ancestorFingerprints: readonly {
    readonly relativePath: string;
    readonly realPathDigest: string;
    readonly device: string;
    readonly inode: string;
  }[];
  readonly outcome: "planned" | "applied" | "rolled-back" | "failed";
  readonly failure?: { readonly code: string; readonly message: string };
  readonly files: readonly {
    readonly relativeTarget: string;
    readonly rawDigest: string;
    readonly rawBytes: number;
    readonly renderedDigest: string;
    readonly renderedBytes: number;
    readonly finalMode: number;
    readonly finalDigest?: string;
    readonly status: ScaffoldFileStatus | "created" | "rolled-back";
  }[];
  readonly createdAt: string;
}

export interface ScaffoldResult {
  readonly schemaVersion: 1;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly projectRoot: string;
  readonly targetDirectory: string;
  readonly mode: ScaffoldMode;
  readonly applied: boolean;
  readonly planDigest: string;
  readonly files: readonly ScaffoldFilePlan[];
  readonly summary: {
    readonly create: number;
    readonly unchanged: number;
    readonly conflict: number;
  };
  readonly receipt: RegistryAuditReceipt;
}

export class RegistryApplyError extends Error {
  readonly receipt: RegistryAuditReceipt;

  constructor(message: string, receipt: RegistryAuditReceipt) {
    super(message);
    this.name = "RegistryApplyError";
    this.receipt = receipt;
  }
}
```

- [ ] **Step 1: Write failing tests** proving remote dry-run stays the default, produces a deterministic `planDigest`, and cannot apply with no approval, a changed raw digest/bytes, changed rendered digest/bytes, changed final mode, changed variables, changed revision, changed root, changed target, stale current-file digest, or changed ancestor fingerprint. Validate `approvedBy` as a trimmed, control-free 1–80 character caller audit label and document that it performs no authentication or authorization.
- [ ] **Step 2: Add failure-injection, race, and permission tests** proving all conflict, containment, raw digest, rendered digest, final mode, and limit checks finish before promotion. During planning, fingerprint every existing ancestor from real project root through each target parent with canonical realpath, device, and inode; expose only a domain-separated realpath digest plus relative path/device/inode in receipts. Replace an ancestor with a symlink or different directory before promotion and immediately after one promotion, then assert drift causes failure and verified rollback rather than a success claim. Every file is staged beside its destination with `wx` and mode `0o600`; contents are fsynced; the staged file is changed to `finalMode = 0o666 & ~process.umask() & 0o666` so executable bits are always cleared; the mode transition and file are fsynced again before promotion; and the parent directory is fsynced after promotion. On POSIX, assert the final stat mode equals `finalMode` and matches the existing bundled `writeFile` default semantics. On Windows, assert the mode request never adds executable bits, ACL behavior is left to the OS, and create-only/content/digest checks still pass. Targets are promoted in sorted `relativeTarget` order without overwrite. Inject failure after the second promotion and assert rollback touches only files created by the current operation after their device/inode, rendered digest, and final mode match the recorded staged file, preserves every pre-existing path, removes remaining temporary files, and emits a `rolled-back` or `failed` receipt. Add a separate test proving a sibling staged directory is renamed atomically only when the complete target directory did not exist before planning. These tests verify drift detection; they do not prove immunity to hostile concurrent replacement.
- [ ] **Step 3: Run `node --experimental-strip-types --test packages/registry/test/remote-apply.test.ts`** and expect FAIL for missing approval types.
- [ ] **Step 4: Compute `planDigest`** from canonical JSON containing source provenance, template ID/version, real project root digest, normalized target directory, resolved variables, sorted ancestor fingerprints, and sorted file targets/statuses plus both raw and rendered digest/byte pairs and `finalMode`. Require `ScaffoldApproval` only when `source.kind === 'remote' && mode === 'apply'`; bundled apply retains its existing explicit `mode: 'apply'` contract. `approvedBy` is recorded in the receipt but is not included in authorization decisions.
- [ ] **Step 5: Implement recoverable create-only apply** by rechecking every existing ancestor's realpath/device/inode plus containment, symlinks, target absence/current digest, raw source digest, rendered output digest, final non-executable mode, and total limits immediately before promotion and again after each promotion. Fail and enter verified rollback on any drift. Stage at `0o600`, fsync, transition explicitly to `0o666 & ~process.umask() & 0o666`, fsync again, and record that mode in the plan and receipt. Use a tested `renameNoReplace` helper: when Node cannot provide no-replace rename semantics, promote a same-filesystem staged file with atomic create-only `link`, fsync the destination directory, and unlink the staged name rather than calling overwrite-capable `rename`. Promote in deterministic order. On a later failure, verify device/inode, rendered digest, and final mode before removing only this operation's promoted files, retain unrelated files, and attach the failure receipt to the thrown `RegistryApplyError`. Do not describe arbitrary multi-file apply as transactional, atomic, or immune to symlink races.
- [ ] **Step 6: Use an atomic sibling-directory rename only for a wholly new target directory** after the complete staged tree and parent are fsynced. For existing target directories, use the recoverable per-file protocol from Step 5. Return or persist a receipt for dry-run, success, rollback, and unrecovered failure. Receipt persistence uses `.popcandy/receipts/registry-{receiptId}.json`, create-only mode, redacts credentials and absolute paths, and stores only a domain-separated SHA-256 digest of the real project root.
- [ ] **Step 7: Run the focused and full Registry gates**

```bash
node --experimental-strip-types --test packages/registry/test/remote-apply.test.ts
pnpm --filter @unpopping-candy/registry test
pnpm --filter @unpopping-candy/registry typecheck
pnpm --filter @unpopping-candy/registry build
```

Expected: PASS; existing bundled tests remain unchanged and remote apply always contains a matching explicit approval.

- [ ] **Step 8: Commit**

```bash
git add packages/registry/src/approval.ts packages/registry/src/staged-write.ts packages/registry/src/receipt.ts packages/registry/src/registry.ts packages/registry/src/types.ts packages/registry/src/index.ts packages/registry/test/remote-apply.test.ts
git commit -m "feat: require approved recoverable registry apply"
```

### Task 7: Wire an alias-only local CLI flow and prove hosted mutation stays impossible

**Files:**

- Create: `packages/cli/src/remote-registry-config.ts`
- Create: `packages/cli/src/registry-service-resolver.ts`
- Create: `packages/cli/test/remote-registry.test.ts`
- Create: `scripts/verify-no-hosted-registry-mutation.mjs`
- Create: `tests/architecture/no-hosted-registry-mutation.test.mjs`
- Modify: `packages/cli/src/bin.ts`
- Modify: `packages/cli/src/commands.ts`
- Modify: `packages/cli/src/types.ts`
- Modify: `schemas/popcandy-config.schema.json`
- Modify: `package.json`

**Interfaces:**

```ts
export interface RemoteRegistryAlias {
  readonly manifestUrl: string;
  readonly allowedOrigins: readonly string[];
  readonly trustedKeyIds: readonly string[];
  readonly credentialEnvironmentVariable?: string;
}

export interface PopcandyRemoteRegistryConfigExtension {
  /** Additive remote aliases; keys must match /^[a-z][a-z0-9-]{0,62}$/. */
  readonly registries?: Readonly<Record<string, RemoteRegistryAlias>>;
}

export interface ScaffoldServiceResolver {
  resolve(input: {
    readonly projectRoot: string;
    readonly registryAlias?: string;
  }): Promise<Pick<RegistryService, "scaffold">>;
}
```

- [ ] **Step 1: Write failing CLI tests** for `popcandy scaffold template.profile-settings --registry design-team` defaulting to dry-run; preserving the existing singular `registry` bundled configuration; unknown or duplicate aliases; duplicate flags; a URL-shaped, slash-containing, backslash-containing, or non-matching alias; unapproved origins/key IDs; and secret values absent from JSON/errors/receipts. For remote apply, assert `--apply` fails unless exactly one `--approve-plan` matching `/^[a-f0-9]{64}$/` and exactly one trimmed, control-free 1–80 character `--approved-by` are present. Assert either approval flag without `--apply`, either approval flag without `--registry`, and either approval flag on bundled scaffolding fails before service resolution. Add a successful fixture run with `--apply --approve-plan 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef --approved-by local-user` whose recomputed dry-run returns that digest.
- [ ] **Step 2: Run `node --experimental-strip-types --test packages/cli/test/remote-registry.test.ts`** and expect FAIL because remote alias parsing does not exist.
- [ ] **Step 3: Extend `schemas/popcandy-config.schema.json` additively** with `registries` alias objects while retaining the existing singular `registry` definition and bundled semantics unchanged. Read aliases through `remote-registry-config.ts`; resolve their origins/key IDs only against Registry's generated `approvedRemoteRegistryPolicy`, never a repository-relative `docs/` path in the consumer project. Environment values supply credentials at runtime; the config stores only the environment variable name. A URL-shaped command value is never treated as an alias and fails before any DNS or network call.
- [ ] **Step 4: Implement `ScaffoldServiceResolver` and explicit CLI parsing ownership** across `packages/cli/src/bin.ts`, `commands.ts`, and `types.ts`. No `--registry` resolves the existing bundled service. A validated alias resolves `createRemoteRegistryService`. `commands.ts` enforces the exact cardinality and combinations for `--registry`, `--apply`, `--approve-plan`, and `--approved-by` from Step 1; it constructs `ScaffoldApproval` with the caller audit label plus current timestamp and passes it to Registry. `approvedBy` is never described or checked as authenticated identity.
- [ ] **Step 5: Add the hosted-mutation architecture gate** that fails if `.github/workflows`, `.github/workflows/release.yml`, `apps/docs-mcp` when present, or an externally bound server imports `createRemoteRegistryService`, registers `popcandy_scaffold`, exposes `scaffold`, `apply`, or `write`, or reads Registry credentials. If `apps/docs-mcp` exists, assert it composes only the read-only public documentation domain; Stage 4C does not create that app when Stage 4B has not run. The local `packages/mcp/src/stdio.ts` adapter remains bundled-only and may register local `popcandy_scaffold`; it must not load remote aliases, remote credentials, or the remote factory.
- [ ] **Step 6: Run focused checks**

```bash
node --experimental-strip-types --test packages/cli/test/remote-registry.test.ts
node --test tests/architecture/no-hosted-registry-mutation.test.mjs
npm run verify
```

Expected: PASS; the architecture gate reports `Hosted Registry mutation surface: none`.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/remote-registry-config.ts packages/cli/src/registry-service-resolver.ts packages/cli/src/bin.ts packages/cli/src/commands.ts packages/cli/src/types.ts packages/cli/test/remote-registry.test.ts schemas/popcandy-config.schema.json scripts/verify-no-hosted-registry-mutation.mjs tests/architecture/no-hosted-registry-mutation.test.mjs package.json
git commit -m "feat: add local remote registry workflow"
```

### Task 8: Complete threat-model, fuzz, security-review, and release evidence

**Files:**

- Create: `docs/security/remote-registry-threat-model.md`
- Create: `docs/registry/REMOTE_REGISTRY.md`
- Create: `packages/registry/test/remote-registry.fuzz.test.ts`
- Create: `.changeset/remote-registry.md`
- Create: `SECURITY.md`
- Modify: `packages/registry/README.md`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/release.yml`

**Interfaces:**

- Produces a versioned threat model, operator/adopter runbook, reproducible adversarial suite, public limitations, and this exact minor Changeset contract:

```md
---
"@unpopping-candy/registry": minor
"@unpopping-candy/cli": minor
---

Add an approved, signed, bounded remote Registry source with plan-bound local apply and auditable receipts.
```

- [ ] **Step 1: Write the threat model before security review** with assets, trust boundaries, attacker capabilities, abuse cases, mitigations, residual risks, owners, incident disable switch, key compromise/rotation/revocation, origin takeover, DNS rebinding, redirect and stale-socket reuse abuse, decompression bomb, pre-rounding JSON integer ambiguity, raw-versus-rendered digest confusion, manifest schema confusion, digest collision assumptions, multi-file partial promotion and verified rollback, filesystem race, symlink swap, credential leakage, caller-supplied `approvedBy` limitations, receipt privacy, and dependency/supply-chain failure. Explicitly record that portable Node lacks dirfd-relative `openat2`/`renameat2` containment, so realpath/device/inode checks do not guarantee safety against a hostile process replacing ancestors between checks; apply requires an owner-controlled, non-shared workspace and aborts on every observed fingerprint drift.
- [ ] **Step 2: Add deterministic fuzz tests** using a checked-in seed list and 10,000 generated cases for URL parsing, IP encodings, JSON duplicate keys/nesting/integer lexemes, exact manifest schemas, manifest target paths, Unicode normalization/case collisions, gzip truncation/expansion, signature corruption, variable rendering, raw/rendered digest pairs, and symlink-race/promotion/rollback ordering. Add a passing corpus whose arbitrary template bytes contain command-like words; only manifest object schemas reject those fields. Every rejected case must be bounded to 10 seconds and leave target contents unchanged; apply failures must leave a redacted failure receipt and may remove only verified files created by that operation.
- [ ] **Step 3: Run `node --experimental-strip-types --test packages/registry/test/remote-registry.fuzz.test.ts`** and expect PASS with the seed printed for reproduction.
- [ ] **Step 4: Document the local-only operating flow**: approval check; preserved singular bundled `registry`; additive `registries` aliases; key rotation; origin removal; dry-run; raw/rendered digests and final non-executable file modes; plan approval; the unauthenticated audit-label meaning of `approvedBy`; recoverable apply and its non-transactional multi-file limitation; ancestor fingerprint evidence; the requirement to apply only in an owner-controlled, non-shared workspace; the residual hostile ancestor-replacement risk; receipt verification; emergency disable; incident reporting; numeric limits; unsupported archive formats; and the statement that Unpopping Candy does not host remote mutation.
- [ ] **Step 5: Add CI and release gates** for approval validation, Registry/CLI tests, config schema fixtures, fuzz corpus, typecheck, build, Changeset presence, and no-hosted-mutation architecture check over `apps/docs-mcp`, local stdio, and workflow entrypoints. CI and release workflows must not contain Registry credentials, contact an external Registry, or expose a Registry mutation endpoint.
- [ ] **Step 6: Run a dedicated security review** using `codex-security:threat-model`, then `codex-security:security-diff-scan`. Resolve every validated critical/high finding and record lower-severity accepted risks with owner and review date in the threat model.
- [ ] **Step 7: Exercise the library as a user** with the in-process HTTPS fixture: run dry-run, inspect revision/key/file digests and no writes, approve the exact plan digest, apply, inspect the final files and redacted receipt, then repeat apply and observe an unchanged plan. Do not deploy an external endpoint.
- [ ] **Step 8: Run the complete exit gate**

```bash
npm run registry:remote:approval
npm run registry:remote:policy:check
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
pnpm --filter @unpopping-candy/registry test
pnpm --filter @unpopping-candy/cli test
git diff --check
```

Expected: every command exits 0; no credentials or absolute user paths appear in tracked files or receipts; the owner-approved exact origin/key set is the only reachable remote source; no hosted mutation surface exists.

- [ ] **Step 9: Commit documentation and release evidence**

```bash
git add docs/security/remote-registry-threat-model.md docs/registry/REMOTE_REGISTRY.md packages/registry/test/remote-registry.fuzz.test.ts packages/registry/README.md SECURITY.md .changeset/remote-registry.md .github/workflows/ci.yml .github/workflows/release.yml
git commit -m "docs: complete remote registry security evidence"
```

## Definition of done

- The owner approval gate passes with real adopter evidence and named operational ownership; otherwise only Task 1 exists and Stage 4C remains disabled.
- Bundled Registry behavior and APIs pass their original tests without weaker path, conflict, checksum, dry-run, or write semantics.
- Remote retrieval accepts only the approved HTTPS origins and trusted Ed25519 keys, revalidates every DNS/redirect hop, and enforces every numeric limit.
- The immutable revision and every signed/raw file digest and byte count are verified before rendering; distinct rendered digest/byte pairs are bound into the plan, approval, final verification, and receipt.
- A remote apply is impossible without approval bound to the exact dry-run plan; `approvedBy` is explicitly a caller audit label rather than authentication, and every success, rollback, or failure has a redacted auditable receipt.
- Traversal, absolute paths, NUL, Unicode/case collisions, observed symlink/ancestor drift, executable hooks, credential forwarding, decompression bombs, manifest ambiguity, rebinding, and redirect attacks have deterministic rejection tests. Documentation does not claim symlink-race immunity and requires a non-shared workspace because hostile replacement can occur between portable Node checks.
- Existing-directory multi-file apply is documented and tested as deterministic, create-only, staged, and recoverable rather than transactionally atomic. A whole-directory atomic rename occurs only for a completely new target directory.
- Temporary files begin at `0o600`; planned and receipted final modes match normal generated source semantics (`0o666 & ~process.umask()` with executable bits cleared), with POSIX assertions and safe Windows behavior documented.
- The only mutation surface is the user's local process. `apps/docs-mcp` and deployment configurations expose no Registry write tool, remote service factory, or credential; local stdio remains bundled-only.
- The threat model, security review, fuzz seed, commands, exact limits, owners, accepted risks, and incident disable procedure are recorded before release.
- External origin, DNS, credentials, publishing, hosting, monitoring, and on-call changes remain unexecuted until separately authorized by the named owner.
