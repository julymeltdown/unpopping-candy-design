/**
 * Inspect CSS source for Unpopping Candy public namespace violations.
 *
 * Custom properties are matched only where declarations can begin. This
 * intentionally excludes BEM modifiers such as `.popcandy-button--primary:`.
 */
export function inspectCssContract(source, label) {
  const errors = [];
  const customPropertyDeclaration = /(?:^|[;{]\s*)(--[a-zA-Z0-9_-]+)\s*:/gm;
  const classReference = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g;

  for (const match of source.matchAll(customPropertyDeclaration)) {
    const name = match[1];
    if (!name.startsWith('--popcandy-')) {
      errors.push(`${label}: custom property ${name} must use --popcandy- prefix`);
    }
  }

  for (const match of source.matchAll(classReference)) {
    const name = match[1];
    if (!name.startsWith('popcandy-') && !name.startsWith('is-')) {
      errors.push(`${label}: class .${name} must use popcandy- or is- namespace`);
    }
  }

  return [...new Set(errors)];
}
