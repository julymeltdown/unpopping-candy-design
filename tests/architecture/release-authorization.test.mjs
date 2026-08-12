import assert from "node:assert/strict";
import { mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  authorizationPlan,
  parseAuthorizationEvidence,
  redactApprover,
  requireAuthorization,
  validateAuthorizationEvidence,
} from "../../scripts/verify-release-authorizations.mjs";

const now = new Date("2026-08-13T00:00:00.000Z");
const validEvidence = {
  schemaVersion: 1,
  npmOrganization: "@unpopping-candy",
  approvedBy: "owner@example.invalid",
  approvedAt: "2026-08-01T00:00:00.000Z",
  brandConfirmed: true,
  expiresAt: "2026-09-01T00:00:00.000Z",
};

test("release authorization accepts exact current namespace and brand evidence", () => {
  const parsed = parseAuthorizationEvidence(validEvidence);
  assert.deepEqual(
    validateAuthorizationEvidence(parsed, now, ["npm", "brand"]),
    [],
  );
  assert.equal(redactApprover(parsed.approvedBy), "[REDACTED_APPROVER]");
});

test("release authorization rejects malformed stale or wrong evidence", () => {
  for (const [label, evidence, pattern] of [
    [
      "wrong organization",
      { ...validEvidence, npmOrganization: "@other" },
      /organization/,
    ],
    ["brand absent", { ...validEvidence, brandConfirmed: false }, /brand/],
    [
      "expired",
      { ...validEvidence, expiresAt: "2026-08-12T00:00:00.000Z" },
      /expired/,
    ],
    [
      "too old",
      { ...validEvidence, approvedAt: "2026-04-01T00:00:00.000Z" },
      /90 days/,
    ],
  ]) {
    const errors = validateAuthorizationEvidence(
      parseAuthorizationEvidence(evidence),
      now,
      ["npm", "brand"],
    );
    assert.match(errors.join("\n"), pattern, label);
    assert.doesNotMatch(errors.join("\n"), /owner@example\.invalid/, label);
  }
  const { npmOrganization: _npmOrganization, ...missingOrganization } =
    validEvidence;
  assert.throws(
    () => parseAuthorizationEvidence(missingOrganization),
    /npmOrganization/,
  );
});

test("authorization plan is read-only and missing evidence is non-fatal", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-authorization-test-"));
  const path = join(root, "release.json");
  const missing = await authorizationPlan(path, now);
  assert.deepEqual(missing, { status: "missing", scopes: ["npm", "brand"] });

  await writeFile(path, `${JSON.stringify(validEvidence)}\n`);
  const before = await readFile(path, "utf8");
  const present = await authorizationPlan(path, now);
  assert.equal(present.status, "valid");
  assert.equal(present.approvedBy, "[REDACTED_APPROVER]");
  assert.equal(await readFile(path, "utf8"), before);
});

test("release authorization mode fails closed when evidence is missing", async () => {
  const root = await mkdtemp(
    join(tmpdir(), "popcandy-authorization-required-"),
  );
  await assert.rejects(
    () =>
      requireAuthorization(join(root, "release.json"), now, ["npm", "brand"]),
    /evidence is missing/,
  );
});

test("release authorization rejects symlinked evidence without leaking its contents", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-authorization-symlink-"));
  const source = join(root, "source.json");
  const linked = join(root, "release.json");
  await writeFile(source, `${JSON.stringify(validEvidence)}\n`);
  await symlink(source, linked);
  const plan = await authorizationPlan(linked, now);
  assert.equal(plan.status, "invalid");
  assert.match(plan.errors.join("\n"), /non-symlink/);
  assert.doesNotMatch(JSON.stringify(plan), /owner@example\.invalid/);
});

test("repository license and package publication policy are exact", async () => {
  const repository = new URL("../..", import.meta.url);
  const license = await readFile(new URL("LICENSE.md", repository), "utf8");
  assert.match(license, /^MIT License\n/);
  assert.match(license, /Permission is hereby granted, free of charge/);

  const packageFolders = [
    "tokens",
    "theme",
    "icons",
    "ui",
    "social",
    "knowledge",
    "registry",
    "cli",
    "mcp",
  ];
  for (const folder of packageFolders) {
    const manifest = JSON.parse(
      await readFile(
        new URL(`packages/${folder}/package.json`, repository),
        "utf8",
      ),
    );
    assert.equal(manifest.license, "MIT", folder);
    assert.notEqual(manifest.private, true, folder);
  }
  for (const folder of ["evals", "figma"]) {
    const manifest = JSON.parse(
      await readFile(
        new URL(`packages/${folder}/package.json`, repository),
        "utf8",
      ),
    );
    assert.equal(manifest.private, true, folder);
    assert.equal(manifest.publishConfig, undefined, folder);
  }

  const readiness = await readFile(
    new URL("scripts/verify-release-readiness.mjs", repository),
    "utf8",
  );
  for (const literal of [
    "scripts/verify-release-authorizations.mjs",
    '"--scope"',
    '"npm,brand"',
    '"bundle:check"',
    '"--stage"',
    '"stage-0"',
    '"--json"',
    '".artifacts/bundles/stage-0.json"',
  ]) {
    assert.ok(readiness.includes(literal), literal);
  }
});
