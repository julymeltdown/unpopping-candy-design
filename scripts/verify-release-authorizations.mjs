import { lstat, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { repositoryRoot } from "./lib/project-inspection.mjs";

const root = repositoryRoot();
const evidencePath = join(root, ".artifacts/authorizations/release.json");
const scopes = ["npm", "brand"];
const evidenceKeys = [
  "schemaVersion",
  "npmOrganization",
  "approvedBy",
  "approvedAt",
  "brandConfirmed",
  "expiresAt",
];
const ninetyDays = 90 * 24 * 60 * 60 * 1000;

function exactObject(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const missing = expected.find((key) => !actual.includes(key));
    if (missing) throw new TypeError(`${label} is missing ${missing}.`);
    throw new TypeError(`${label} has unknown or missing keys.`);
  }
}

function timestamp(value, label) {
  if (typeof value !== "string")
    throw new TypeError(`${label} must be an ISO timestamp.`);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new TypeError(`${label} must be an exact UTC ISO timestamp.`);
  }
  return value;
}

export function parseAuthorizationEvidence(value) {
  exactObject(value, evidenceKeys, "Release authorization evidence");
  if (value.schemaVersion !== 1)
    throw new TypeError("Unsupported authorization schema.");
  if (typeof value.npmOrganization !== "string") {
    throw new TypeError("npmOrganization must be a string.");
  }
  if (
    typeof value.approvedBy !== "string" ||
    value.approvedBy.length === 0 ||
    value.approvedBy.length > 256 ||
    /[\u0000-\u001f]/.test(value.approvedBy)
  ) {
    throw new TypeError("approvedBy must be a bounded non-empty identifier.");
  }
  if (typeof value.brandConfirmed !== "boolean") {
    throw new TypeError("brandConfirmed must be a boolean.");
  }
  return {
    schemaVersion: 1,
    npmOrganization: value.npmOrganization,
    approvedBy: value.approvedBy,
    approvedAt: timestamp(value.approvedAt, "approvedAt"),
    brandConfirmed: value.brandConfirmed,
    expiresAt: timestamp(value.expiresAt, "expiresAt"),
  };
}

function validateScopes(requestedScopes) {
  if (!Array.isArray(requestedScopes) || requestedScopes.length === 0) {
    throw new TypeError("At least one authorization scope is required.");
  }
  if (new Set(requestedScopes).size !== requestedScopes.length) {
    throw new TypeError("Authorization scopes must be unique.");
  }
  for (const scope of requestedScopes) {
    if (!scopes.includes(scope))
      throw new TypeError(`Unknown authorization scope: ${scope}.`);
  }
  return requestedScopes;
}

export function validateAuthorizationEvidence(evidence, now, requestedScopes) {
  const selected = validateScopes(requestedScopes);
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError("Authorization clock must be a valid Date.");
  }
  const errors = [];
  const approvedAt = new Date(evidence.approvedAt);
  const expiresAt = new Date(evidence.expiresAt);
  if (approvedAt > now) errors.push("Approval date is in the future.");
  if (now.getTime() - approvedAt.getTime() > ninetyDays) {
    errors.push("Approval is older than 90 days.");
  }
  if (expiresAt <= now) errors.push("Authorization evidence is expired.");
  if (expiresAt <= approvedAt)
    errors.push("Authorization expiry must follow approval.");
  if (expiresAt.getTime() - approvedAt.getTime() > ninetyDays) {
    errors.push("Authorization expiry exceeds 90 days from approval.");
  }
  if (
    selected.includes("npm") &&
    evidence.npmOrganization !== "@unpopping-candy"
  ) {
    errors.push("npm organization must be @unpopping-candy.");
  }
  if (selected.includes("brand") && evidence.brandConfirmed !== true) {
    errors.push("Unpopping Candy brand ownership is not confirmed.");
  }
  return errors;
}

export function redactApprover() {
  return "[REDACTED_APPROVER]";
}

async function readEvidence(path) {
  try {
    const info = await lstat(path);
    if (info.isSymbolicLink() || !info.isFile()) {
      throw new TypeError(
        "Authorization evidence must be a regular non-symlink file.",
      );
    }
    if (info.size > 32 * 1024) {
      throw new TypeError("Authorization evidence exceeds 32 KiB.");
    }
    return parseAuthorizationEvidence(JSON.parse(await readFile(path, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    if (error instanceof SyntaxError)
      throw new TypeError("Authorization evidence is not valid JSON.");
    throw error;
  }
}

export async function authorizationPlan(path, now = new Date()) {
  let evidence;
  try {
    evidence = await readEvidence(path);
  } catch (error) {
    return {
      status: "invalid",
      scopes,
      errors: [
        error instanceof Error
          ? error.message
          : "Authorization evidence is invalid.",
      ],
    };
  }
  if (!evidence) return { status: "missing", scopes };
  const errors = validateAuthorizationEvidence(evidence, now, scopes);
  return {
    status: errors.length ? "invalid" : "valid",
    scopes,
    approvedBy: redactApprover(evidence.approvedBy),
    ...(errors.length ? { errors } : {}),
  };
}

export async function requireAuthorization(path, now, requestedScopes) {
  const selected = validateScopes(requestedScopes);
  const evidence = await readEvidence(path);
  if (!evidence)
    throw new TypeError("Release authorization evidence is missing.");
  const errors = validateAuthorizationEvidence(evidence, now, selected);
  if (errors.length) throw new TypeError(errors.join("\n"));
  return { scopes: selected, approvedBy: redactApprover(evidence.approvedBy) };
}

function parseArguments(argv) {
  const values = argv.filter((argument) => argument !== "--");
  if (values.length === 1 && values[0] === "--plan") return { plan: true };
  if (values.length === 2 && values[0] === "--scope") {
    return { requestedScopes: validateScopes(values[1].split(",")) };
  }
  throw new TypeError("Use either --plan or --scope npm,brand.");
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.plan) {
    process.stdout.write(
      `${JSON.stringify(await authorizationPlan(evidencePath), null, 2)}\n`,
    );
    return;
  }
  const result = await requireAuthorization(
    evidencePath,
    new Date(),
    options.requestedScopes,
  );
  process.stdout.write(
    `Release authorization verified for ${result.scopes.join(", ")} (${result.approvedBy}).\n`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
