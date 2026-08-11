export const PUBLIC_PACKAGE_NAMES = Object.freeze([
  '@unpopping-candy/tokens',
  '@unpopping-candy/theme',
  '@unpopping-candy/icons',
  '@unpopping-candy/ui',
  '@unpopping-candy/social',
  '@unpopping-candy/knowledge',
  '@unpopping-candy/registry',
  '@unpopping-candy/cli',
  '@unpopping-candy/mcp',
]);

export const PRIVATE_TOOL_PACKAGE_NAMES = Object.freeze([
  '@unpopping-candy/evals',
  '@unpopping-candy/figma',
]);

export function classifyPackageManifest(manifest) {
  if (PUBLIC_PACKAGE_NAMES.includes(manifest.name)) return 'public';
  if (PRIVATE_TOOL_PACKAGE_NAMES.includes(manifest.name)) return 'private-tool';
  return 'unknown';
}
