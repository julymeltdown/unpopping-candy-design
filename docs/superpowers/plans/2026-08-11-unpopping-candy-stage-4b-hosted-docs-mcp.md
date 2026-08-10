# Unpopping Candy Stage 4B Hosted Documentation MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an explicitly authorized, read-only hosted MCP that serves bounded, versioned Unpopping Candy public catalog and documentation queries without exposing local project, Registry, repository, or mutation capabilities.

**Architecture:** Keep the existing `popcandy-mcp` stdio process as the local, project-aware surface. Add a separate public projection and MCP server entrypoint under `@unpopping-candy/mcp/public`, then mount that entrypoint in a private Cloudflare Worker through a narrow `HostedMcpTransportAdapter`; the worker owns HTTP policy while the domain owns only deterministic public knowledge. Immutable generated snapshots are embedded at build time, so the deployed runtime has no filesystem, repository, Registry, network-fetch, or secret dependency.

**Tech Stack:** TypeScript, `@modelcontextprotocol/server` 2.0.0, Zod 4, Cloudflare Workers, Wrangler, Node.js test runner, pnpm 11, GitHub Actions.

## Global Constraints

- Public brand: `Unpopping Candy`; public command: `popcandy`; do not introduce `commonspace` names.
- Public packages remain `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`; the Worker is a private application and is never published to npm.
- CLI and MCP runtime support Node.js 22.13+ and the Node 24 release line; published declarations remain compatible with TypeScript 5.7+.
- Published packages are ESM with explicit `exports`; CommonJS and undocumented deep imports are unsupported.
- The hosted surface is read-only. It must not register project detection, validation, composition that inspects a project, Registry manifest, scaffold, filesystem, shell, credential, or mutation capabilities.
- Every query requires an exact catalog version. Unknown and mixed versions fail closed; the server never substitutes the newest catalog.
- Public responses exclude repository source paths, template source/content fields, Figma keys/node URLs, environment values, credentials, local absolute paths, stack traces, and private project data.
- Request bodies are never logged or retained. Structured request logs are retained for at most 7 days and aggregate metrics for at most 30 days.
- Every JSON-RPC `POST /mcp` response, including successful resources and errors, uses `Cache-Control: no-store` and no `ETag`; health responses also use `no-store`. Exact-version snapshots are immutable build/in-isolate data, not intermediary-cacheable HTTP responses.
- Fixed application bounds are 64 KiB per request, 1 MiB per response, 8 seconds per request, 32 concurrent requests per Worker isolate, and 60 requests per minute per Cloudflare-provided client address.
- Stage 4B does not block `0.3.0`; implementation, paid infrastructure, repository settings, credentials, and public deployment require the separate approvals below.
- Generated files are changed only through their generator and checked with `npm run agent:check`.

---

## File map

### Public package boundary

- Create `packages/mcp/src/public-types.ts`: safe public data, source, domain, and error contracts.
- Create `packages/mcp/src/public-domain.ts`: exact-version lookup, projection, bounded search, and documentation reads.
- Create `packages/mcp/src/public-server.ts`: MCP resources and three read-only tools only.
- Create `packages/mcp/src/public.ts`: isolated public subpath exports.
- Modify `packages/mcp/package.json`: add the `./public` ESM/type export without changing the local binary.
- Test `packages/mcp/test/public-domain.test.ts`: projection, version, query, and redaction behavior.
- Test `packages/mcp/test/public-server.test.ts`: exact public MCP capability set.

### Generated immutable content

- Create `scripts/generate-hosted-mcp-content.mjs`: sanitize and hash the stable public snapshot.
- Create `apps/docs-mcp/content/0.3.0.snapshot.json`: generated immutable release snapshot retained by exact version.
- Create `apps/docs-mcp/src/generated/content.ts`: generated immutable snapshot module.
- Modify `package.json`: add `hosted-mcp:generate` and `hosted-mcp:check`.
- Modify `package.json`: include the generated snapshot drift check in `ai:check` and the Worker dry-run build in the root build.

### Private hosted application

- Create `apps/docs-mcp/package.json`, `apps/docs-mcp/tsconfig.json`, and `apps/docs-mcp/wrangler.jsonc`: private Worker build and dry-run configuration.
- Modify `pnpm-lock.yaml`: lock private-app dependencies, including exact `wrangler` 4.120.1.
- Create `apps/docs-mcp/src/config.ts`: fail-closed environment and numeric policy parsing.
- Create `apps/docs-mcp/src/catalog-source.ts`: integrity-checked source over generated snapshots.
- Create `apps/docs-mcp/src/transport.ts`: replaceable HTTP transport interface and MCP SDK adapter.
- Create `apps/docs-mcp/src/request-policy.ts`: method, host/origin, rate, byte, timeout, and concurrency gates.
- Create `apps/docs-mcp/src/observability.ts`: privacy-safe logs, aggregate counters, and universal `no-store` response policy.
- Create `apps/docs-mcp/src/worker.ts`: `/mcp`, `/health/live`, and `/health/ready` routing.
- Test `apps/docs-mcp/test/catalog-source.test.ts`, `apps/docs-mcp/test/request-policy.test.ts`, and `apps/docs-mcp/test/worker.test.ts`.

### Operations and release evidence

- Create `.github/workflows/hosted-docs-mcp.yml`: verify and produce a Wrangler dry-run artifact; deploy only through an approved environment.
- Create `scripts/verify-hosted-mcp-approvals.mjs`: prove there is exactly one complete issue for each approval phase.
- Create `scripts/verify-hosted-mcp-deployment.mjs`: live protocol, capability, bound, health, and privacy smoke checks.
- Test `tests/architecture/hosted-mcp-approvals.test.mjs`: reject missing, incomplete, or duplicate approval issues.
- Create `docs/operations/HOSTED_MCP.md`: ownership, SLO, limits, data handling, rollout, rollback, and support contract.
- Create `docs/operations/HOSTED_MCP_INCIDENTS.md`: triage, disable, rollback, evidence preservation, and disclosure procedure.
- Modify `packages/mcp/README.md` and `README.md`: distinguish the local mutable stdio surface from the hosted read-only surface.
- Create `.changeset/hosted-docs-mcp.md`: public MCP subpath and security-boundary release note.
- Modify `.gitignore`: ignore `.artifacts/hosted-mcp/`; no raw request, response, prompt, or search text is committed.

## Entry and deployment approvals

Implementation must not begin until a closed GitHub issue has label `hosted-mcp-implementation-approved`, is assigned to the repository owner, and records all of these decisions:

- one named adopter and the public documentation problem the service solves;
- service owner and incident owner GitHub logins;
- approval of Cloudflare Workers as the provider;
- a monthly spend ceiling of USD 25 with alerts at 50%, 80%, and 100%;
- 0-day request-body retention, 7-day structured-log retention, and 30-day aggregate-metric retention;
- confirmation that the runtime receives no Registry, npm, GitHub, source-repository, or model-provider credentials;
- authorization to implement and run local/Wrangler dry runs only.

Public deployment additionally requires a second closed issue labeled `hosted-mcp-deploy-approved`, approval of the exact Wrangler dry-run artifact SHA-256, a configured `hosted-docs-mcp-production` GitHub Environment with the service owner as required reviewer, and a rehearsed disable/rollback command. If either gate is absent, stop at the corresponding boundary and report the missing evidence.

### Task 1: Verify Stage 4B authorization and stable-catalog dependency

**Files:**

- Read: `docs/superpowers/specs/2026-08-10-unpopping-candy-competitive-library-design.md`
- Read: `agent/manifests/catalog.json`
- Create: `scripts/verify-hosted-mcp-approvals.mjs`
- Test: `tests/architecture/hosted-mcp-approvals.test.mjs`
  **Interfaces:**

- Consumes: stable public catalog and the two approval labels defined above
- Produces: `verifyHostedMcpApprovalIssues(issues, phase)`, ignored approval evidence, and an evidence-backed go/no-go decision; Task 2 does not begin on `no-go`

- [ ] **Step 1: Write the failing approval-verifier tests**

```js
const completeImplementation = {
  number: 84,
  title: "Authorize hosted documentation MCP implementation",
  url: "https://github.com/julymeltdown/unpopping-candy-design/issues/84",
  assignees: [{ login: "julymeltdown" }],
  body: [
    "Demand: Acme pilot needs version-pinned public documentation queries",
    "Service owner: julymeltdown",
    "Incident owner: julymeltdown",
    "Provider: Cloudflare Workers",
    "Monthly spend ceiling: USD 25",
    "Budget alerts: 50%, 80%, 100%",
    "Request-body retention: 0 days",
    "Structured-log retention: 7 days",
    "Aggregate-metric retention: 30 days",
    "Runtime credentials: none",
    "Authorized scope: implementation and local/Wrangler dry runs only",
  ].join("\n"),
};

assert.equal(
  verifyHostedMcpApprovalIssues([completeImplementation], "implementation")
    .issueNumber,
  84,
);
assert.throws(
  () =>
    verifyHostedMcpApprovalIssues(
      [completeImplementation, { ...completeImplementation, number: 85 }],
      "implementation",
    ),
  /exactly one complete approval issue/i,
);
assert.throws(
  () =>
    verifyHostedMcpApprovalIssues(
      [{ ...completeImplementation, body: "Service owner: julymeltdown" }],
      "implementation",
    ),
  /missing required approval field/i,
);
```

Add an equivalent complete deploy fixture containing a 64-character dry-run SHA-256, service owner, incident owner, Cloudflare account, HTTPS production base URL, USD 25 ceiling, three alert thresholds, all retention values, and a tested rollback digest.

- [ ] **Step 2: Run the verifier test and observe the missing module**

Run: `node --test tests/architecture/hosted-mcp-approvals.test.mjs`

Expected: FAIL because `verify-hosted-mcp-approvals.mjs` does not exist.

- [ ] **Step 3: Implement the deterministic approval verifier**

Export this exact interface:

```js
export function verifyHostedMcpApprovalIssues(issues, phase) {
  if (!Array.isArray(issues) || issues.length !== 1) {
    throw new Error(
      `${phase}: exactly one complete approval issue is required`,
    );
  }
  const issue = issues[0];
  verifyAssignee(issue.assignees, "julymeltdown");
  verifyRequiredFields(issue.body, REQUIRED_FIELDS[phase]);
  return { phase, issueNumber: issue.number, issueUrl: issue.url };
}
```

The CLI accepts the exact `--phase` and `--input` flag structure used in Steps 6 and 8, parses only the named `gh` JSON file, emits issue number/URL without echoing the body, and exits 1 for zero, duplicate, incomplete, unassigned, malformed, or phase-mismatched issues. Add `.artifacts/hosted-mcp/` to `.gitignore` before writing any fetched issue data.

- [ ] **Step 4: Run the approval-verifier tests**

Run: `node --test tests/architecture/hosted-mcp-approvals.test.mjs`

Expected: PASS for one complete issue and deterministic failure for every missing/duplicate fixture.

- [ ] **Step 5: Commit the approval gate machinery**

```bash
git add scripts/verify-hosted-mcp-approvals.mjs tests/architecture/hosted-mcp-approvals.test.mjs .gitignore
git commit -m "test(mcp): enforce hosted service approval evidence"
```

- [ ] **Step 6: Fetch and verify the unique implementation approval record**

Run:

```bash
mkdir -p .artifacts/hosted-mcp/approvals
gh issue list --state closed --label hosted-mcp-implementation-approved --limit 100 --json number,title,url,assignees,body > .artifacts/hosted-mcp/approvals/implementation.json
node scripts/verify-hosted-mcp-approvals.mjs --phase implementation --input .artifacts/hosted-mcp/approvals/implementation.json
```

Expected: the verifier reports exactly one complete assigned issue without printing its body. If the list has zero, two or more, or an incomplete result, stop before Task 2 and report the failing field/count.

- [ ] **Step 7: Verify the input catalog is stable and internally valid**

Run:

```bash
npm run agent:check
npm run popcandy -- info --path . --json
node -e "const c=require('./agent/manifests/catalog.json'); if(!/^0\\.3\\.\\d+$/.test(c.packageVersion)) process.exit(1); console.log(c.packageVersion)"
```

Expected: generated knowledge is current, local package resolution succeeds, and the final command prints one stable `0.3.x` catalog version without a prerelease suffix.

### Task 2: Add the safe public knowledge projection

**Files:**

- Create: `packages/mcp/src/public-types.ts`
- Create: `packages/mcp/src/public-domain.ts`
- Create: `packages/mcp/src/public.ts`
- Modify: `packages/mcp/src/index.ts`
- Modify: `packages/mcp/package.json`
- Test: `packages/mcp/test/public-domain.test.ts`

**Interfaces:**

- Consumes: `KnowledgeCatalog`, `ComponentDoc`, `TemplateDoc`, and `searchCatalog` from `@unpopping-candy/knowledge`
- Produces: `PublicCatalogSource`, `PublicCatalogSnapshot`, `PublicMcpError`, `createPublicCatalogSnapshot(catalog, designMarkdown)`, and `createPopcandyPublicDomain(source)`

- [ ] **Step 1: Write a failing redaction and exact-version test**

Add tests that instantiate two snapshots and assert both the safe shape and fail-closed lookup:

```ts
const snapshot030 = createPublicCatalogSnapshot(
  { ...bundledCatalog, packageVersion: "0.3.0" },
  "# Unpopping Candy 0.3.0",
);
const snapshot031 = createPublicCatalogSnapshot(
  { ...bundledCatalog, packageVersion: "0.3.1" },
  "# Unpopping Candy 0.3.1",
);
const snapshots = new Map([
  ["0.3.0", snapshot030],
  ["0.3.1", snapshot031],
]);
const source: PublicCatalogSource = {
  listVersions: () => [...snapshots.keys()],
  getSnapshot: (version) => snapshots.get(version),
};
const domain = createPopcandyPublicDomain(source);
const result = domain.get({ version: "0.3.0", id: "ui.button" });
assert.equal(result.catalogVersion, "0.3.0");
assert.equal("sourcePath" in result.entry, false);
assert.equal("figma" in result.entry, false);
assert.throws(
  () => domain.get({ version: "9.9.9", id: "ui.button" }),
  (error: PublicMcpError) => error.code === "POPCANDY_PUBLIC_CATALOG_NOT_FOUND",
);
```

- [ ] **Step 2: Run the focused test and observe the missing API**

Run: `node --experimental-strip-types --test packages/mcp/test/public-domain.test.ts`

Expected: FAIL because `public-domain.ts` and its exports do not exist.

- [ ] **Step 3: Define the safe public types**

Implement these exact contracts in `public-types.ts`:

```ts
export type PublicComponentDoc = Omit<ComponentDoc, "sourcePath" | "figma">;
export type PublicTemplateDoc = Omit<TemplateDoc, "files"> & {
  files: readonly Pick<TemplateFileDoc, "path" | "role">[];
};
export type PublicKnowledgeEntry =
  | PublicComponentDoc
  | PatternDoc
  | PublicTemplateDoc
  | MigrationDoc;

export interface PublicCatalogSnapshot {
  schemaVersion: 1;
  catalogVersion: string;
  generatedAt: string;
  sha256: string;
  entries: readonly PublicKnowledgeEntry[];
  designMarkdown: string;
}

export interface PublicCatalogSource {
  listVersions(): readonly string[];
  getSnapshot(version: string): PublicCatalogSnapshot | undefined;
}

export class PublicMcpError extends Error {
  constructor(
    readonly code:
      | "POPCANDY_PUBLIC_CATALOG_NOT_FOUND"
      | "POPCANDY_PUBLIC_ENTRY_NOT_FOUND"
      | "POPCANDY_PUBLIC_QUERY_INVALID",
    message: string,
  ) {
    super(message);
  }
}
```

- [ ] **Step 4: Implement deterministic projection and domain methods**

Expose only these domain operations:

```ts
export interface PopcandyPublicDomain {
  versions(): { schemaVersion: 1; versions: readonly string[] };
  catalog(input: { version: string }): PublicCatalogSnapshot;
  design(input: { version: string }): {
    schemaVersion: 1;
    catalogVersion: string;
    markdown: string;
  };
  search(input: {
    version: string;
    query: string;
    kind?: KnowledgeKind;
    limit?: number;
  }): {
    schemaVersion: 1;
    catalogVersion: string;
    query: string;
    results: readonly SearchResult[];
  };
  get(input: { version: string; id: string }): {
    schemaVersion: 1;
    catalogVersion: string;
    entry: PublicKnowledgeEntry;
  };
}
```

`createPublicCatalogSnapshot` must remove component `sourcePath` and all `figma` data, reduce template files to `path` and `role`, sort entries by stable ID, and hash the canonical JSON plus `designMarkdown`. Search trims the query, caps `limit` to 20, searches only the requested snapshot, and never calls `bundledCatalog` as a fallback.

- [ ] **Step 5: Add the isolated package subpath**

Export the public contracts from `src/public.ts`, export only their types/helpers from `src/index.ts`, and add this package export:

```json
"./public": {
  "types": "./dist/public.d.ts",
  "import": "./dist/public.js"
}
```

Keep `public.ts` inside the existing `src/**/*.ts` TypeScript build input and verify that `tsc -p packages/mcp/tsconfig.build.json` emits `dist/public.js` and `dist/public.d.ts` without importing `stdio.ts`, `domain.ts`, the CLI, or the Registry.

- [ ] **Step 6: Run the focused and package gates**

Run:

```bash
node --experimental-strip-types --test packages/mcp/test/public-domain.test.ts
pnpm --filter @unpopping-candy/mcp typecheck
pnpm --filter @unpopping-candy/mcp build
```

Expected: all commands exit 0 and `packages/mcp/dist/public.js` contains no `@unpopping-candy/registry`, `process.cwd`, `scaffold`, or local-project API import.

- [ ] **Step 7: Commit the public projection**

```bash
git add packages/mcp/src/public-types.ts packages/mcp/src/public-domain.ts packages/mcp/src/public.ts packages/mcp/src/index.ts packages/mcp/package.json packages/mcp/test/public-domain.test.ts
git commit -m "feat(mcp): add read-only public knowledge projection"
```

### Task 3: Register the hosted MCP capability allowlist

**Files:**

- Create: `packages/mcp/src/public-server.ts`
- Modify: `packages/mcp/src/public.ts`
- Test: `packages/mcp/test/public-server.test.ts`

**Interfaces:**

- Consumes: `PopcandyPublicDomain`
- Produces: `PUBLIC_TOOL_NAMES`, `PUBLIC_RESOURCE_TEMPLATES`, `registerPublicResources(server, domain)`, `createPopcandyPublicMcpServer(domain)`, and versioned `popcandy://public/...` resources

- [ ] **Step 1: Write the failing capability-set test**

```ts
assert.deepEqual(PUBLIC_TOOL_NAMES, [
  "popcandy_versions",
  "popcandy_search",
  "popcandy_get",
]);
for (const forbidden of [
  "popcandy_project_info",
  "popcandy_compose",
  "popcandy_validate",
  "popcandy_scaffold",
]) {
  assert.equal(PUBLIC_TOOL_NAMES.includes(forbidden), false);
}
```

Also assert resources use `popcandy://public/catalog/{version}`, `popcandy://public/design/{version}`, and `popcandy://public/entries/{version}/{id}` templates and that every callback returns `schemaVersion: 1` plus the exact `catalogVersion`.

- [ ] **Step 2: Run the focused test and observe the missing server**

Run: `node --experimental-strip-types --test packages/mcp/test/public-server.test.ts`

Expected: FAIL because `public-server.ts` does not exist.

- [ ] **Step 3: Register only the public tools and resources**

Create a fresh `McpServer` per request and register the allowlist:

```ts
export const PUBLIC_TOOL_NAMES = [
  "popcandy_versions",
  "popcandy_search",
  "popcandy_get",
] as const;

export const PUBLIC_RESOURCE_TEMPLATES = [
  "popcandy://public/catalog/{version}",
  "popcandy://public/design/{version}",
  "popcandy://public/entries/{version}/{id}",
] as const;

function toolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    structuredContent: data as Record<string, unknown>,
  };
}

export function createPopcandyPublicMcpServer(
  domain: PopcandyPublicDomain,
): McpServer {
  const server = new McpServer({ name: "popcandy-public-docs", version: "1" });
  server.registerTool(
    "popcandy_versions",
    {
      title: "List Unpopping Candy catalog versions",
      description:
        "List exact public catalog versions available from this service.",
      inputSchema: z.object({}),
    },
    () => toolResult(domain.versions()),
  );
  server.registerTool(
    "popcandy_search",
    {
      title: "Search Unpopping Candy public knowledge",
      description: "Search one exact public catalog version.",
      inputSchema: z.object({
        version: z.string().regex(/^\d+\.\d+\.\d+$/),
        query: z.string().trim().min(1).max(200),
        kind: z
          .enum(["component", "pattern", "template", "migration"])
          .optional(),
        limit: z.number().int().min(1).max(20).optional(),
      }),
    },
    (input) => toolResult(domain.search(input)),
  );
  server.registerTool(
    "popcandy_get",
    {
      title: "Get Unpopping Candy public knowledge",
      description: "Get one stable ID from one exact public catalog version.",
      inputSchema: z.object({
        version: z.string().regex(/^\d+\.\d+\.\d+$/),
        id: z.string().trim().min(1).max(128),
      }),
    },
    (input) => toolResult(domain.get(input)),
  );
  registerPublicResources(server, domain);
  return server;
}
```

Implement `registerPublicResources(server: McpServer, domain: PopcandyPublicDomain): void` in the same file. Register the three `PUBLIC_RESOURCE_TEMPLATES` with `ResourceTemplate`; parse `version` and `id` only from template variables, call `domain.catalog`, `domain.design`, or `domain.get`, and return JSON or Markdown with the exact resolved catalog version in the payload and resource URI.

The search/get schemas require an exact semver `version`; search requires a non-empty `query`, get requires a stable `id`, and search limits are 1–20. Do not import `McpDomainServices`, `createPopcandyMcpDomain`, CLI, Registry, tokens, `node:fs`, or `node:child_process` in the public module graph.

- [ ] **Step 4: Run the MCP package gates**

Run:

```bash
node --experimental-strip-types --test packages/mcp/test/public-server.test.ts
pnpm --filter @unpopping-candy/mcp typecheck
pnpm --filter @unpopping-candy/mcp build
```

Expected: all commands exit 0 and the allowlist test proves no local or mutating tool is registered.

- [ ] **Step 5: Commit the public MCP server**

```bash
git add packages/mcp/src/public-server.ts packages/mcp/src/public.ts packages/mcp/test/public-server.test.ts
git commit -m "feat(mcp): expose hosted documentation capability allowlist"
```

### Task 4: Generate immutable, versioned public snapshots

**Files:**

- Create: `scripts/generate-hosted-mcp-content.mjs`
- Create: `apps/docs-mcp/content/0.3.0.snapshot.json`
- Create: `apps/docs-mcp/src/generated/content.ts`
- Create: `apps/docs-mcp/src/catalog-source.ts`
- Modify: `package.json`
- Test: `apps/docs-mcp/test/catalog-source.test.ts`

**Interfaces:**

- Consumes: `agent/manifests/catalog.json` and generated `DESIGN.md`
- Produces: `HOSTED_MCP_CONTENT: readonly PublicCatalogSnapshot[]` and an integrity-checking `createEmbeddedCatalogSource()`

- [ ] **Step 1: Write the failing snapshot integrity test**

```ts
const source = createEmbeddedCatalogSource(HOSTED_MCP_CONTENT);
assert.deepEqual(source.listVersions(), ["0.3.0"]);
assert.equal(source.getSnapshot("0.3.0")?.catalogVersion, "0.3.0");
const snapshot = HOSTED_MCP_CONTENT.at(0);
assert.ok(snapshot);
assert.throws(
  () => createEmbeddedCatalogSource([{ ...snapshot, sha256: "0".repeat(64) }]),
  /snapshot integrity check failed/i,
);
```

Stage 4B targets the approved stable `0.3.0` catalog. If Task 1 prints any other version, stop and revise this plan before implementation rather than changing the assertion during execution.

- [ ] **Step 2: Run the focused test and observe the missing generated source**

Run: `node --experimental-strip-types --test apps/docs-mcp/test/catalog-source.test.ts`

Expected: FAIL because the private app and generated content module do not exist.

- [ ] **Step 3: Implement the generator**

The generator must load the canonical catalog and `DESIGN.md`, call `createPublicCatalogSnapshot`, and write `content/0.3.0.snapshot.json` only when that version does not yet exist. If an existing version's digest differs, fail instead of replacing history. Verify every retained `content/*.snapshot.json`, reject prerelease or duplicate versions, emit a deterministic TypeScript literal sorted by version, and support `--check` without writing. Add root scripts:

```json
"hosted-mcp:generate": "node --experimental-strip-types scripts/generate-hosted-mcp-content.mjs",
"hosted-mcp:check": "node --experimental-strip-types scripts/generate-hosted-mcp-content.mjs --check"
```

Append `npm run hosted-mcp:check` to the root `ai:check` script, and append `pnpm --filter @unpopping-candy/docs-mcp build` to the root `build` script. Never hand-edit `apps/docs-mcp/src/generated/content.ts`.

- [ ] **Step 4: Implement the integrity-checking source**

`createEmbeddedCatalogSource` computes the same SHA-256 over canonical public entries plus `designMarkdown`, fails during Worker initialization on mismatch, returns versions in ascending semver order, and returns `undefined` for an unknown version. It does not expose a `latest` alias.

- [ ] **Step 5: Generate content and run the checks**

Run:

```bash
npm run hosted-mcp:generate
npm run hosted-mcp:check
node --experimental-strip-types --test apps/docs-mcp/test/catalog-source.test.ts
npm run agent:check
```

Expected: generation writes one stable snapshot, the second command reports no drift, the integrity test passes, and all generated-agent checks remain green.

- [ ] **Step 6: Commit the immutable content pipeline**

```bash
git add scripts/generate-hosted-mcp-content.mjs apps/docs-mcp/content/0.3.0.snapshot.json apps/docs-mcp/src/generated/content.ts apps/docs-mcp/src/catalog-source.ts apps/docs-mcp/test/catalog-source.test.ts package.json
git commit -m "feat(mcp): generate immutable hosted documentation snapshots"
```

### Task 5: Add the replaceable HTTP adapter and hard request bounds

**Files:**

- Create: `apps/docs-mcp/package.json`
- Create: `apps/docs-mcp/tsconfig.json`
- Create: `apps/docs-mcp/src/config.ts`
- Create: `apps/docs-mcp/src/transport.ts`
- Create: `apps/docs-mcp/src/request-policy.ts`
- Modify: `pnpm-lock.yaml`
- Test: `apps/docs-mcp/test/request-policy.test.ts`

**Interfaces:**

- Consumes: `createPopcandyPublicMcpServer` and Cloudflare's rate-limit binding
- Produces: `HostedMcpTransportAdapter`, `createSdkTransportAdapter(domain)`, `applyRequestPolicy(request, next, env)`, and `HostedMcpEnv`

- [ ] **Step 1: Write failing policy boundary tests**

Test exact boundaries: 65,536 bytes passes; 65,537 bytes returns 413; the 33rd held request returns 503; an 8,001 ms fake-clock request returns 504; the 61st request for one identity returns 429; a foreign Host or present foreign Origin returns 403; and the error body contains a stable `POPCANDY_MCP_*` code without a stack or path.

```ts
assert.equal((await policy(requestWithBytes(65_537))).status, 413);
assert.equal((await policy(requestFrom("203.0.113.7", 61))).status, 429);
assert.doesNotMatch(
  await errorResponse.text(),
  /(?:\/Users\/|\/home\/|stack)/i,
);
```

- [ ] **Step 2: Run the focused test and observe the missing policy**

Run: `node --experimental-strip-types --test apps/docs-mcp/test/request-policy.test.ts`

Expected: FAIL because the policy modules do not exist.

- [ ] **Step 3: Create the private package with a pinned Wrangler**

Create `apps/docs-mcp/package.json` with `name: "@unpopping-candy/docs-mcp"`, `private: true`, `type: "module"`, and `build`, `test`, and `typecheck` scripts that do not publish or deploy. Then run:

```bash
pnpm --filter @unpopping-candy/docs-mcp add --save-dev --save-exact wrangler@4.120.1
pnpm --filter @unpopping-candy/docs-mcp exec wrangler --version
```

Expected: `apps/docs-mcp/package.json` contains `"wrangler": "4.120.1"`, `pnpm-lock.yaml` records the same resolved version, and the second command prints `4.120.1`.

- [ ] **Step 4: Define fail-closed configuration**

```ts
export interface HostedMcpEnv {
  PUBLIC_BASE_URL: string;
  RATE_LIMITER: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
}

export const REQUEST_POLICY = {
  maxRequestBytes: 65_536,
  maxResponseBytes: 1_048_576,
  timeoutMs: 8_000,
  maxConcurrent: 32,
  requestsPerMinute: 60,
} as const;
```

`parseConfig` must require an HTTPS `PUBLIC_BASE_URL` in production, permit HTTP only for `localhost` and loopback development URLs, derive the only allowed Host and Origin from that URL, and reject query strings, fragments, embedded credentials, or non-`/mcp` paths. The runtime environment type contains no secret or credential field.

- [ ] **Step 5: Implement the transport seam**

```ts
export interface HostedMcpTransportAdapter {
  fetch(request: Request): Promise<Response>;
  close(): Promise<void>;
}

export function createSdkTransportAdapter(
  domain: PopcandyPublicDomain,
): HostedMcpTransportAdapter {
  const handler = createMcpHandler(
    () => createPopcandyPublicMcpServer(domain),
    {
      legacy: "stateless",
      responseMode: "json",
      maxSubscriptions: 0,
      keepAliveMs: 0,
    },
  );
  return { fetch: handler.fetch, close: handler.close };
}
```

No domain or Worker code may import another SDK transport. A later MCP protocol revision replaces only this adapter and its contract tests.

- [ ] **Step 6: Implement policy order and bounded buffering**

Apply gates in this order: exact `/mcp` route and `POST` method; Host and present-Origin validation; `Content-Type: application/json`; `Content-Length` precheck; bounded streaming body read; Cloudflare-provided `CF-Connecting-IP` rate key; 32-slot semaphore; 8-second abort signal; transport call; 1 MiB bounded response read. Return 405/403/415/413/429/503/504/502 respectively, with `Retry-After` on 429/503. Reconstruct every returned response with `Cache-Control: no-store`, remove any `ETag`, and apply that policy to success and error responses alike.

- [ ] **Step 7: Run the private app gates**

Run:

```bash
node --experimental-strip-types --test apps/docs-mcp/test/request-policy.test.ts
pnpm --filter @unpopping-candy/docs-mcp typecheck
pnpm --filter @unpopping-candy/docs-mcp exec wrangler --version
```

Expected: all boundary tests pass with exact status codes and stable safe error shapes, every response asserts `Cache-Control: no-store` with no `ETag`, and Wrangler prints `4.120.1`.

- [ ] **Step 8: Commit the transport and policy**

```bash
git add apps/docs-mcp/package.json apps/docs-mcp/tsconfig.json apps/docs-mcp/src/config.ts apps/docs-mcp/src/transport.ts apps/docs-mcp/src/request-policy.ts apps/docs-mcp/test/request-policy.test.ts pnpm-lock.yaml
git commit -m "feat(mcp): bound hosted HTTP transport"
```

### Task 6: Add health, no-store response policy, privacy-safe observability, and the Worker surface

**Files:**

- Create: `apps/docs-mcp/src/observability.ts`
- Create: `apps/docs-mcp/src/worker.ts`
- Test: `apps/docs-mcp/test/worker.test.ts`

**Interfaces:**

- Consumes: embedded catalog source, public domain, transport adapter, and request policy
- Produces: Worker `fetch(request, env, ctx)`, `/health/live`, `/health/ready`, safe logs, and universal `no-store` response headers

- [ ] **Step 1: Write the failing end-to-end Worker tests**

Assert:

- `GET /health/live` returns 200 and `{"status":"live"}`;
- `GET /health/ready` returns 200 only after every snapshot digest verifies;
- `POST /mcp` can list exactly the three public tools and call versioned search/get;
- an unknown version returns `POPCANDY_PUBLIC_CATALOG_NOT_FOUND` and never falls back;
- mutating/local tool calls return MCP method-not-found;
- every successful or failed JSON-RPC response returns `Cache-Control: no-store` and no `ETag`;
- both health responses return `Cache-Control: no-store` and no `ETag`;
- logs contain only `requestId`, `route`, `method`, `status`, `durationMs`, `requestBytes`, `responseBytes`, `limitCode`, and `catalogVersion`.

```ts
assert.deepEqual(Object.keys(logRecord).sort(), [
  "catalogVersion",
  "durationMs",
  "limitCode",
  "method",
  "requestBytes",
  "requestId",
  "responseBytes",
  "route",
  "status",
]);
```

- [ ] **Step 2: Run the Worker test and observe the missing route**

Run: `node --experimental-strip-types --test apps/docs-mcp/test/worker.test.ts`

Expected: FAIL because `worker.ts` and observability do not exist.

- [ ] **Step 3: Implement health and no-store behavior**

`/health/live` performs no content read. `/health/ready` verifies the precomputed startup state and returns only status plus `catalogCount`; it never returns paths, hashes, configuration, or versions. All health and JSON-RPC responses use `Cache-Control: no-store` and omit `ETag`, including exact-version resource reads, because JSON-RPC request IDs make intermediary caching unsafe. Immutable exact-version snapshots remain frozen build/in-isolate values only.

- [ ] **Step 4: Implement the privacy-safe observer**

Create one structured record per request after completion. Never record request/response bodies, search text, entry IDs, IP addresses, rate keys, headers, user agents, authorization values, stack traces, or environment values. Export aggregate counters for status class, limit code, and duration buckets only. Document that Cloudflare log retention must be capped at 7 days and aggregate metric retention at 30 days before production deployment.

- [ ] **Step 5: Assemble the Worker**

Create the source and domain once per isolate, create one SDK adapter, route only the two health paths plus `/mcp`, return 404 for every other path, and pass MCP traffic through `applyRequestPolicy`. The module exports no scheduled, queue, durable-object, or outbound-fetch handler.

- [ ] **Step 6: Run the Worker and package tests**

Run:

```bash
node --experimental-strip-types --test apps/docs-mcp/test/*.test.ts
node --experimental-strip-types --test packages/mcp/test/*.test.ts
pnpm --filter @unpopping-candy/docs-mcp typecheck
```

Expected: all tests pass, the capability set is exact, and log-key assertions prove the retention surface excludes sensitive payloads.

- [ ] **Step 7: Commit the Worker surface**

```bash
git add apps/docs-mcp/src/observability.ts apps/docs-mcp/src/worker.ts apps/docs-mcp/test/worker.test.ts
git commit -m "feat(mcp): serve privacy-safe hosted documentation"
```

### Task 7: Add security verification and an authorization-gated deployment dry run

**Files:**

- Create: `apps/docs-mcp/wrangler.jsonc`
- Create: `scripts/verify-hosted-mcp-deployment.mjs`
- Create: `.github/workflows/hosted-docs-mcp.yml`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: private Worker build, `PUBLIC_BASE_URL`, Cloudflare rate-limit binding, and approval evidence
- Produces: credential-free Worker bundle, reproducible dry-run artifact, live smoke report, and separately gated deploy job

- [ ] **Step 1: Write a failing bundle-security verifier**

The verifier must fail if the built Worker contains any of these strings or APIs:

```ts
const forbidden = [
  "@unpopping-candy/registry",
  "popcandy_scaffold",
  "popcandy_project_info",
  "popcandy_validate",
  "node:fs",
  "node:child_process",
  "process.cwd",
  "CLOUDFLARE_API_TOKEN",
  "GITHUB_TOKEN",
  "NPM_TOKEN",
];
```

It must also drive HTTP MCP initialization and `tools/list`, verify the exact allowlist, call search/get at one exact version, call all four forbidden local/mutation names and require method-not-found, send oversized/malformed/wrong-origin/rate-limit probes, and write a sanitized JSON report under `.artifacts/hosted-mcp/`. The report is an allowlisted summary of scenario name, status, duration, catalog version, tool names, limit code, and pass/fail only; it never records request/response bodies, prompt/search text, entry contents, headers, client addresses, rate keys, or environment values.

- [ ] **Step 2: Run the verifier against no service and observe failure**

Run: `node scripts/verify-hosted-mcp-deployment.mjs --base-url http://127.0.0.1:8787`

Expected: FAIL with a connection error because no Worker is running.

- [ ] **Step 3: Configure a credential-free Worker bundle**

Set the Worker name to `unpopping-candy-docs-mcp`, compatibility date to `2026-08-11`, entrypoint to `src/worker.ts`, `workers_dev` to `true`, and a rate-limit binding named `RATE_LIMITER` with namespace ID `1001` and 60 requests per 60 seconds. No runtime secret, service binding, KV, R2, D1, outbound hostname, or Registry binding is allowed.

- [ ] **Step 4: Add the dry-run workflow**

On pull requests and manual dispatch, install with `pnpm install --frozen-lockfile`, run all private-app and MCP tests, run `npm run hosted-mcp:check`, and execute:

```bash
pnpm --filter @unpopping-candy/docs-mcp exec wrangler --version
pnpm --filter @unpopping-candy/docs-mcp exec wrangler deploy --dry-run --outdir ../../.artifacts/hosted-mcp/worker
node scripts/verify-hosted-mcp-deployment.mjs --bundle-dir .artifacts/hosted-mcp/worker
```

Expected: Wrangler prints `4.120.1` before the dry run. Upload the directory and a SHA-256 manifest as `hosted-mcp-wrangler-dry-run`. The workflow's `deploy` job must require the `hosted-docs-mcp-production` Environment and then execute this exact approval sequence before deployment:

```bash
mkdir -p .artifacts/hosted-mcp/approvals
gh issue list --state closed --label hosted-mcp-deploy-approved --limit 100 --json number,title,url,assignees,body > .artifacts/hosted-mcp/approvals/deploy.json
node scripts/verify-hosted-mcp-approvals.mjs --phase deploy --input .artifacts/hosted-mcp/approvals/deploy.json
pnpm --filter @unpopping-candy/docs-mcp exec wrangler deploy
```

The job also compares the approved SHA-256 to the downloaded dry-run manifest and stops before the last command on any count, field, reviewer, or digest mismatch.

- [ ] **Step 5: Run the service locally and perform protocol QA**

Run terminal A:

```bash
pnpm --filter @unpopping-candy/docs-mcp exec wrangler dev --local --var PUBLIC_BASE_URL:http://127.0.0.1:8787/mcp
```

Run terminal B:

```bash
node scripts/verify-hosted-mcp-deployment.mjs --base-url http://127.0.0.1:8787
```

Expected: the smoke report passes health, initialization, tools/list, exact-version search/get, method-not-found, byte, origin, rate, timeout, and redaction scenarios. This is the required Manual QA Gate for the library/service surface.

- [ ] **Step 6: Produce the Wrangler dry-run artifact**

Run:

```bash
pnpm --filter @unpopping-candy/docs-mcp exec wrangler --version
pnpm --filter @unpopping-candy/docs-mcp exec wrangler deploy --dry-run --outdir ../../.artifacts/hosted-mcp/worker
node scripts/verify-hosted-mcp-deployment.mjs --bundle-dir .artifacts/hosted-mcp/worker
```

Expected: Wrangler prints `4.120.1`, both remaining commands exit 0, the bundle is at most 1 MiB gzip, and the security scan finds none of the forbidden strings.

- [ ] **Step 7: Commit deployment preparation without deploying**

```bash
git add apps/docs-mcp/wrangler.jsonc scripts/verify-hosted-mcp-deployment.mjs .github/workflows/hosted-docs-mcp.yml
git commit -m "ci(mcp): prepare gated hosted documentation deployment"
```

Do not run `pnpm --filter @unpopping-candy/docs-mcp exec wrangler deploy` against Cloudflare in this task.

### Task 8: Publish the operating contract and complete the release gate

**Files:**

- Create: `docs/operations/HOSTED_MCP.md`
- Create: `docs/operations/HOSTED_MCP_INCIDENTS.md`
- Modify: `packages/mcp/README.md`
- Modify: `README.md`
- Create: `.changeset/hosted-docs-mcp.md`

**Interfaces:**

- Consumes: verified limits, privacy behavior, dry-run digest, and approval boundaries
- Produces: adopter instructions, owner/incident runbooks, rollback evidence, and public-package release note

- [ ] **Step 1: Write the operating contract**

Document the exact MCP URL configuration shape using `PUBLIC_BASE_URL`, supported HTTP MCP protocol line, three tools, three resource templates, exact-version requirement, numeric bounds, 7/30-day retention, no-runtime-secret posture, availability target of 99.5% monthly excluding approved maintenance, support route, and status/incident update process.

- [ ] **Step 2: Write and rehearse disable/rollback procedures**

The incident runbook must contain these ordered actions: disable the Cloudflare route; preserve only privacy-safe aggregate evidence; revoke the deploy token if compromise is suspected; redeploy the last approved dry-run digest; execute the live verifier; publish status; and complete a post-incident review. Rehearse the route-disable and last-digest rollback in a non-public Cloudflare preview environment and attach command output to the deploy-approval issue.

- [ ] **Step 3: Correctly separate local and hosted documentation**

`packages/mcp/README.md` and the root README must say that local `popcandy-mcp` retains project inspection, validation, and guarded Registry actions, while the hosted endpoint has only version listing, catalog search, entry lookup, and versioned public resources. State that the hosted service cannot read a consumer project and is not a substitute for `popcandy info` or `popcandy validate`.

- [ ] **Step 4: Add the public package release note**

Create a minor Changeset for `@unpopping-candy/mcp` describing `@unpopping-candy/mcp/public` and the hosted read-only boundary. Do not version or publish the private `@unpopping-candy/docs-mcp` app.

- [ ] **Step 5: Run the complete repository gate**

```bash
npm run hosted-mcp:check
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
pnpm --filter @unpopping-candy/docs-mcp exec wrangler --version
pnpm --filter @unpopping-candy/docs-mcp exec wrangler deploy --dry-run --outdir ../../.artifacts/hosted-mcp/worker
node scripts/verify-hosted-mcp-deployment.mjs --bundle-dir .artifacts/hosted-mcp/worker
```

Expected: every command exits 0; Wrangler is exactly `4.120.1`; the dry-run bundle remains under 1 MiB gzip; generated content is stable; public exports build; and security verification finds no mutation, local-project, credential, filesystem, private-path, or Registry capability.

- [ ] **Step 6: Request code, security, and operations review**

Invoke `superpowers:requesting-code-review`, run the repository security review against the exact full commit SHA, and have the named service and incident owners sign off on the dry-run digest, limits, budget alerts, retention configuration, disable procedure, and rollback evidence.

- [ ] **Step 7: Commit the operating contract**

```bash
git add docs/operations/HOSTED_MCP.md docs/operations/HOSTED_MCP_INCIDENTS.md packages/mcp/README.md README.md .changeset/hosted-docs-mcp.md
git commit -m "docs(mcp): define hosted service operating contract"
```

- [ ] **Step 8: Stop at the public deployment boundary**

Run:

```bash
mkdir -p .artifacts/hosted-mcp/approvals
gh issue list --state closed --label hosted-mcp-deploy-approved --limit 100 --json number,title,url,assignees,body > .artifacts/hosted-mcp/approvals/deploy.json
node scripts/verify-hosted-mcp-approvals.mjs --phase deploy --input .artifacts/hosted-mcp/approvals/deploy.json
```

Expected before deployment: the verifier proves there is exactly one complete assigned approval issue naming the exact dry-run SHA-256, service owner, incident owner, Cloudflare account, production base URL, USD 25 monthly ceiling, alerts, retention, and tested rollback digest. Zero, duplicate, or incomplete issues fail closed. If any evidence is absent, report Stage 4B as implementation-complete and deployment-blocked. Only the required reviewer may approve the GitHub Environment deployment job; implementation agents do not bypass it.

## Definition of done

- The hosted public module graph exposes only version listing, exact-version search/get, and versioned public catalog/design/entry resources.
- Local stdio project detection, validation, composition, Registry manifest, and scaffold behavior remain unchanged and unavailable from the hosted service.
- Every snapshot is deterministic, immutable, integrity-checked, and stripped of repository/private fields before bundling.
- HTTP behavior is directly observed through an MCP client exchange and boundary probes, not inferred from unit tests.
- Request, response, timeout, concurrency, and per-address rate bounds have exact passing tests.
- Every JSON-RPC and health response is `Cache-Control: no-store` without an `ETag`; immutable snapshots exist only in committed build inputs and in-isolate memory.
- Structured logs, privacy exclusions, 7-day log retention, 30-day metric retention, disable, rollback, and incident ownership are documented and approved.
- `apps/docs-mcp/package.json` and `pnpm-lock.yaml` pin Wrangler `4.120.1`, and every Wrangler invocation runs through `pnpm --filter @unpopping-candy/docs-mcp exec`.
- Ephemeral approval, dry-run, and smoke evidence stays under ignored `.artifacts/hosted-mcp/` and contains no request/response body, prompt/search text, entry content, header, address, rate key, or environment value.
- The dry-run bundle contains no runtime credential, Registry, filesystem, shell, local-project, or mutation capability.
- Implementation and deployment each proceed only when the approval verifier proves exactly one complete matching issue from a `gh issue list --limit 100` result; public deployment additionally requires GitHub Environment review, otherwise the final report names that boundary as blocked.
