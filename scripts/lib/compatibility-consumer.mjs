import { createServer } from "node:http";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

function createConsumerFiles(cell) {
  const styles = [
    "import '@unpopping-candy/tokens/styles.css';",
    "import '@unpopping-candy/icons/styles.css';",
    "import '@unpopping-candy/ui/styles.css';",
    "import '@unpopping-candy/social/styles.css';",
  ].join("\n");
  const routerImport =
    cell.framework === "react-router"
      ? "import { BrowserRouter } from 'react-router';"
      : "";
  const scenario =
    cell.framework === "react-router"
      ? "<BrowserRouter><Scenario /></BrowserRouter>"
      : "<Scenario />";
  const main = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
${styles}
import Scenario from './scenario.js';
${routerImport}
const root = document.getElementById('root');
if (!root) throw new TypeError('Missing root element.');
createRoot(root).render(<StrictMode>${scenario}</StrictMode>);
`;
  if (cell.framework !== "next") {
    return {
      sourceDir: "src",
      files: {
        "src/main.tsx": main,
        "vite-env.d.ts": '/// <reference types="vite/client" />\n',
      },
      build: ["node_modules/vite/bin/vite.js", "build"],
      output: "dist",
    };
  }
  const layout = `${styles}
import type { ReactNode } from 'react';
export default function Layout({ children }: { readonly children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
`;
  return {
    sourceDir: "app",
    files: {
      "app/layout.tsx": layout,
      "app/page.tsx": `import Scenario from './scenario';
export default function Page() { return <Scenario />; }
`,
      "next.config.mjs": "export default { output: 'export' };\n",
    },
    build: ["node_modules/next/dist/bin/next", "build"],
    output: "out",
  };
}

export async function writeCompatibilityConsumer(options) {
  const { consumerRoot, fixtureRoot, scenarioSource, cell, tarballs } = options;
  const framework =
    cell.framework === "vite"
      ? { vite: cell.frameworkVersion }
      : cell.framework === "next"
        ? { next: cell.frameworkVersion }
        : { "react-router": cell.frameworkVersion, vite: "8.1.0" };
  const typeVersions = cell.reactVersion.startsWith("18.")
    ? { "@types/react": "18.3.24", "@types/react-dom": "18.3.7" }
    : { "@types/react": "19.2.14", "@types/react-dom": "19.2.3" };
  const tarballPins = Object.fromEntries(
    tarballs.map((tarball) => [
      tarball.packageName,
      `file:../packs/${tarball.name}`,
    ]),
  );
  const dependencies = {
    ...tarballPins,
    react: cell.reactVersion,
    "react-dom": cell.reactVersion,
    ...framework,
  };
  const manifest = {
    name: "popcandy-packed-consumer",
    version: "0.0.0",
    private: true,
    type: "module",
    dependencies,
    devDependencies: {
      "@types/node": "24.3.0",
      typescript: "5.7.3",
      ...typeVersions,
    },
    overrides: tarballPins,
    resolutions: tarballPins,
  };
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  const generated = createConsumerFiles(cell);
  const imports = [scenarioSource, ...Object.values(generated.files)].join(
    "\n",
  );
  if (manifestText.includes("workspace:")) {
    throw new TypeError("Generated manifest contains workspace protocol.");
  }
  if (imports.includes("/src") || imports.includes("/dist")) {
    throw new TypeError("Generated imports contain private package paths.");
  }
  await mkdir(join(consumerRoot, generated.sourceDir), { recursive: true });
  await writeFile(join(consumerRoot, "package.json"), manifestText);
  await writeFile(
    join(consumerRoot, generated.sourceDir, "scenario.tsx"),
    scenarioSource,
  );
  await writeFile(
    join(consumerRoot, "types.ts"),
    await readFile(join(fixtureRoot, "types.ts"), "utf8"),
  );
  const tsconfig = {
    compilerOptions: {
      strict: true,
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      skipLibCheck: true,
      noEmit: true,
    },
    include: ["**/*.ts", "**/*.tsx"],
  };
  await writeFile(
    join(consumerRoot, "tsconfig.json"),
    `${JSON.stringify(tsconfig, null, 2)}\n`,
  );
  for (const [path, content] of Object.entries(generated.files)) {
    await mkdir(dirname(join(consumerRoot, path)), { recursive: true });
    await writeFile(join(consumerRoot, path), content);
  }
  if (cell.framework !== "next") {
    await copyFile(
      join(fixtureRoot, "index.html"),
      join(consumerRoot, "index.html"),
    );
  }
  return {
    generated,
    dependencies,
    publicPackagePins: tarballPins,
    imports: [...scenarioSource.matchAll(/from ['"]([^'"]+)['"]/g)].map(
      (match) => match[1],
    ),
  };
}

export async function serveCompatibilityBuild(root) {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const target = pathname === "/" ? "index.html" : pathname.slice(1);
    if (target.includes("..")) {
      response.writeHead(400).end();
      return;
    }
    try {
      const content = await readFile(join(root, target));
      const type = target.endsWith(".js")
        ? "text/javascript"
        : target.endsWith(".css")
          ? "text/css"
          : "text/html";
      response.writeHead(200, { "content-type": type }).end(content);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        response.writeHead(404).end();
      } else {
        response.writeHead(500).end();
      }
    }
  });
  await new Promise((resolvePromise, rejectPromise) => {
    server.once("error", rejectPromise);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new TypeError("Static server did not expose a TCP address.");
  }
  return { server, url: `http://127.0.0.1:${address.port}` };
}

export async function readInstalledVersion(root, packageName) {
  const path = join(
    root,
    "node_modules",
    ...packageName.split("/"),
    "package.json",
  );
  const manifest = JSON.parse(await readFile(path, "utf8"));
  if (typeof manifest.version !== "string") {
    throw new TypeError(`Installed ${packageName} has no version.`);
  }
  return manifest.version;
}
