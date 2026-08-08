/**
 * Inspect CSS source for Commonspace public namespace violations.
 *
 * Custom properties are matched only where declarations can begin. This
 * intentionally excludes BEM modifiers such as `.cs-button--primary:`.
 */
export function inspectCssContract(source, label) {
  const errors = [];
  const customPropertyDeclaration = /(?:^|[;{]\s*)(--[a-zA-Z0-9_-]+)\s*:/gm;
  const classReference = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g;

  for (const match of source.matchAll(customPropertyDeclaration)) {
    const name = match[1];
    if (!name.startsWith('--cs-')) {
      errors.push(`${label}: custom property ${name} must use --cs- prefix`);
    }
  }

  for (const match of source.matchAll(classReference)) {
    const name = match[1];
    if (!name.startsWith('cs-') && !name.startsWith('is-')) {
      errors.push(`${label}: class .${name} must use cs- or is- namespace`);
    }
  }

  return [...new Set(errors)];
}
