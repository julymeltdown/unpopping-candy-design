import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { bundledCatalog } from "../../knowledge/src/index.ts";
import { createRegistryService } from "../../registry/src/index.ts";
import {
  resolveCatalogContext,
  resolveProjectCatalogContext,
} from "../src/catalog-context.ts";
import { validatePopcandyProject } from "../src/validate.ts";

const templateRoot = join(
  resolve(new URL("../../..", import.meta.url).pathname),
  "packages/registry/templates",
);
const registry = createRegistryService({
  catalog: bundledCatalog,
  templateRoot,
});

export const services = {
  projectContext: resolveProjectCatalogContext,
  catalogContext: resolveCatalogContext,
  validate: validatePopcandyProject,
  scaffold: (
    catalog: typeof bundledCatalog,
    input: Parameters<typeof registry.scaffold>[0],
  ) => createRegistryService({ catalog, templateRoot }).scaffold(input),
};

export async function createCliFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "popcandy-cli-"));
  await mkdir(join(root, "src"), { recursive: true });
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({
      name: "fixture-app",
      packageManager: "pnpm@11.4.0",
      dependencies: {
        react: "19.2.0",
        vite: "8.1.0",
        "@unpopping-candy/ui": "0.1.0",
        "@unpopping-candy/theme": "0.1.0",
        "@unpopping-candy/tokens": "0.1.0",
      },
    }),
  );
  await writeFile(
    join(root, "package-lock.json"),
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "node_modules/@unpopping-candy/theme": { version: "0.1.0" },
        "node_modules/@unpopping-candy/tokens": { version: "0.1.0" },
        "node_modules/@unpopping-candy/ui": { version: "0.1.0" },
      },
    }),
  );
  await writeFile(
    join(root, "popcandy.config.json"),
    JSON.stringify({ source: "src" }),
  );
  await writeFile(
    join(root, "src/main.tsx"),
    [
      "import '@unpopping-candy/tokens/styles.css';",
      "import '@unpopping-candy/icons/styles.css';",
      "import '@unpopping-candy/ui/styles.css';",
      "import type { SocialPostViewModel } from '@unpopping-candy/social/model';",
      "import { Button } from '@unpopping-candy/ui/button';",
      "export const App = (_post: SocialPostViewModel) => <Button>Save</Button>;",
    ].join("\n"),
  );
  return root;
}
