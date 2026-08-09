function slug(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function storyId(title, exportName) {
  const titleSlug = title.split('/').map(slug).filter(Boolean).join('-');
  const exportSlug = slug(exportName);
  if (!titleSlug || !exportSlug) throw new Error('Story title and export name must produce non-empty ids.');
  return `${titleSlug}--${exportSlug}`;
}

export function inspectStorySource(source) {
  const titles = [...source.matchAll(/\btitle\s*:\s*(['"])([^'"]*\/[^'"]*)\1/g)].map((match) => match[2]);
  if (titles.length !== 1 || !titles[0]) throw new Error(`Story source must contain exactly one static title; found ${titles.length}.`);
  const exports = [...source.matchAll(/\bexport\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g)].map((match) => match[1]);
  if (exports.length === 0) throw new Error(`Story source ${titles[0]} must export at least one named story.`);
  return { title: titles[0], exports, ids: exports.map((name) => storyId(titles[0], name)) };
}
