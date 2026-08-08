import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const generatedDirectories = [
  ...['tokens', 'theme', 'icons', 'ui', 'social'].map((name) =>
    join(root, 'packages', name, 'dist'),
  ),
  join(root, 'apps', 'playground', 'dist'),
  join(root, 'apps', 'consumer-fixture', 'dist'),
  join(root, 'apps', 'docs', 'storybook-static'),
  join(root, '.tmp'),
];

await Promise.all(
  generatedDirectories.map((path) => rm(path, { recursive: true, force: true })),
);
