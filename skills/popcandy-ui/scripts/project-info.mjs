#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const candidates = [
  ['popcandy', ['info', '--json']],
  ['npx', ['--no-install', 'popcandy', 'info', '--json']],
];
for (const [command, args] of candidates) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status === 0) process.exit(0);
}
console.error('Unpopping Candy CLI was not found. Install @unpopping-candy/cli or run from the Unpopping Candy repository.');
process.exit(1);
