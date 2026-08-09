#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const candidates = [
  ['commonspace', ['info', '--json']],
  ['npx', ['--no-install', 'commonspace', 'info', '--json']],
];
for (const [command, args] of candidates) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status === 0) process.exit(0);
}
console.error('Commonspace CLI was not found. Install @commonspace/cli or run from the Commonspace UI repository.');
process.exit(1);
