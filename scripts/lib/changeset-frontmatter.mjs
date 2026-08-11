const FRONTMATTER_PATTERN = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const PACKAGE_NAME_PATTERN = /^(?:"([^"\r\n]+)"|'([^'\r\n]+)'|([^\s#][^:\r\n]*?))\s*:/gm;

export function parseChangesetFrontmatterPackageNames(markdown) {
  const frontmatter = markdown.match(FRONTMATTER_PATTERN);
  if (!frontmatter) return [];

  const packageNames = [];
  for (const match of frontmatter[1].matchAll(PACKAGE_NAME_PATTERN)) {
    packageNames.push(match[1] ?? match[2] ?? match[3].trim());
  }
  return packageNames;
}
