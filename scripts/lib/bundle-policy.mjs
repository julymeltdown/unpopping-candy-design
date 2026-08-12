import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PUBLIC_PACKAGE_NAMES } from "./public-packages.mjs";
import { repositoryRoot } from "./project-inspection.mjs";

const root = repositoryRoot();
const policyPath = join(root, "config/bundle-budgets.json");
const policySource = await readFile(policyPath, "utf8");
const stages = ["stage-0", "stage-1", "stage-2", "stage-3"];
const budgetKeys = ["baseline", "unplanned", ...stages];

export const packageFolders = PUBLIC_PACKAGE_NAMES.map(
  (name) => name.split("/")[1],
);
export const BUNDLE_POLICY = JSON.parse(policySource);

function sorted(values) {
  return [...values].sort();
}

function policyDigest(policy) {
  const value = structuredClone(policy);
  value.policyDigest = "";
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  if (
    JSON.stringify(sorted(Object.keys(value))) !== JSON.stringify(sorted(keys))
  ) {
    throw new TypeError(`${label} has unknown or missing keys.`);
  }
}

export function validateBundlePolicy(policy, source = policySource) {
  exactKeys(
    policy,
    ["schemaVersion", "policyDigest", "packages", "reservedCatalogIds"],
    "Bundle policy",
  );
  if (policy.schemaVersion !== 1) {
    throw new TypeError("Unsupported bundle policy schema.");
  }
  exactKeys(policy.packages, packageFolders, "Bundle package policy");
  const packageSection = source.slice(
    source.indexOf('"packages"'),
    source.indexOf('"reservedCatalogIds"'),
  );
  for (const folder of packageFolders) {
    const matches =
      packageSection.match(new RegExp(`"${folder}"\\s*:`, "g")) ?? [];
    if (matches.length !== 1) {
      throw new TypeError(`Duplicate package policy entry: ${folder}.`);
    }
    const budget = policy.packages[folder];
    exactKeys(budget, budgetKeys, `${folder} budget`);
    for (const key of budgetKeys) {
      if (!Number.isSafeInteger(budget[key]) || budget[key] <= 0) {
        throw new TypeError(`${folder}.${key} must be a positive integer.`);
      }
    }
    const ordered = budgetKeys.map((key) => budget[key]);
    if (
      ordered.some((value, index) => index > 0 && value < ordered[index - 1])
    ) {
      throw new TypeError(`${folder} bundle allocations must not decrease.`);
    }
  }
  exactKeys(policy.reservedCatalogIds, stages, "Reserved catalog policy");
  const seen = new Set();
  for (const stage of stages) {
    const ids = policy.reservedCatalogIds[stage];
    if (!Array.isArray(ids)) {
      throw new TypeError(`${stage} catalog IDs must be an array.`);
    }
    for (const id of ids) {
      if (typeof id !== "string" || !/^ui\.[a-z0-9-]+$/.test(id)) {
        throw new TypeError(`Invalid reserved catalog ID in ${stage}.`);
      }
      if (seen.has(id)) throw new TypeError(`Duplicate catalog ID: ${id}.`);
      seen.add(id);
    }
  }
  if (policy.reservedCatalogIds["stage-0"].length) {
    throw new TypeError("Stage 0 must not reserve public catalog IDs.");
  }
  if (policy.policyDigest !== policyDigest(policy)) {
    throw new TypeError("Bundle policy digest mismatch.");
  }
  return policy;
}

export function resolveBudgetMode({
  stage,
  addedCatalogIds,
  changedCatalogIds,
  comparisonProvided = true,
}) {
  if (!stages.includes(stage)) {
    throw new TypeError(`Unknown bundle stage: ${stage}.`);
  }
  const added = sorted(new Set(addedCatalogIds));
  const changed = sorted(new Set(changedCatalogIds));
  const reserved = new Set(BUNDLE_POLICY.reservedCatalogIds[stage]);
  const unreserved = added.filter((id) => !reserved.has(id));
  if (unreserved.length) {
    throw new TypeError(
      `Catalog ID is not reserved for ${stage}: ${unreserved.join(", ")}.`,
    );
  }
  const expanded = added.length > 0 || changed.length > 0;
  return {
    mode:
      stage === "stage-0" || (comparisonProvided && expanded)
        ? stage
        : "unplanned",
    catalogIds: added,
  };
}

export function assertWithinBudgets(measurements, mode) {
  return measurements.map((measurement) => {
    const ceiling = BUNDLE_POLICY.packages[measurement.name]?.[mode];
    if (!Number.isSafeInteger(ceiling)) {
      throw new TypeError(
        `Unknown bundle package or mode: ${measurement.name}/${mode}.`,
      );
    }
    if (measurement.bytes > ceiling) {
      throw new TypeError(
        `${measurement.name} bundle is ${measurement.bytes} bytes; ${mode} ceiling is ${ceiling}.`,
      );
    }
    return { ...measurement, ceiling };
  });
}
