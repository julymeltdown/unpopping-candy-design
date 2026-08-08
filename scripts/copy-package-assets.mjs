import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const [, , packageDirectory, ...pairs] = process.argv;
if (!packageDirectory || pairs.length === 0 || pairs.length % 2 !== 0) {
  throw new Error('Usage: node copy-package-assets.mjs <package-dir> <source> <destination> [...]');
}

const root = resolve(process.cwd(), packageDirectory);
for (let index = 0; index < pairs.length; index += 2) {
  const source = resolve(root, pairs[index]);
  const destination = resolve(root, pairs[index + 1]);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}
