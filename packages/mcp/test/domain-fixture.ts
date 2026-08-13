import { join, resolve } from "node:path";
import {
  resolveCatalogContext,
  resolveProjectCatalogContext,
  validatePopcandyProject,
} from "../../cli/src/index.ts";
import {
  bundledCatalog,
  generateDesignMarkdown,
} from "../../knowledge/src/index.ts";
import { createRegistryService } from "../../registry/src/index.ts";
import tokens from "../../tokens/src/tokens.json" with { type: "json" };
import { createPopcandyMcpDomain } from "../src/domain.ts";

const templateRoot = join(
  resolve(new URL("../../..", import.meta.url).pathname),
  "packages/registry/templates",
);

const domain = createPopcandyMcpDomain({
  catalog: bundledCatalog,
  tokens,
  projectContext: resolveProjectCatalogContext,
  catalogContext: resolveCatalogContext,
  designMarkdown: (catalog) => generateDesignMarkdown(catalog, tokens),
  validate: validatePopcandyProject,
  registryManifest: (catalog) =>
    createRegistryService({ catalog, templateRoot }).manifest(),
  scaffold: (catalog, input) =>
    createRegistryService({ catalog, templateRoot }).scaffold(input),
});

export { bundledCatalog, domain };
