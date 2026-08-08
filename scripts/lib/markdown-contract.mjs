export function extractRelativeMarkdownLinks(source) {
  const links = [];
  const linkPattern = /!?\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;

  for (const match of source.matchAll(linkPattern)) {
    const target = match[1];
    if (
      target.startsWith('#') ||
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.startsWith('tel:') ||
      target.startsWith('data:')
    ) {
      continue;
    }
    links.push(target);
  }

  return links;
}

export function hasBalancedCodeFences(source) {
  let openMarker = null;
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (!match) continue;
    const marker = match[1][0];
    if (openMarker === null) openMarker = marker;
    else if (openMarker === marker) openMarker = null;
  }
  return openMarker === null;
}
