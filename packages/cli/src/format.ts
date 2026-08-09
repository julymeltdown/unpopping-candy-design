import type { CliResult } from './types.ts';

export function formatCliResult(result: CliResult, json: boolean): string {
  if (json) return `${JSON.stringify(result, null, 2)}\n`;
  if (!result.ok) return `Error [${result.error.code}]: ${result.error.message}\n`;
  if (result.command === 'search' && typeof result.data === 'object' && result.data && 'results' in result.data) {
    const results = (result.data as { results: readonly { id: string; name: string; summary: string; score: number }[] }).results;
    return results.length ? `${results.map((item) => `${item.id.padEnd(34)} ${String(item.score).padStart(3)}  ${item.name} — ${item.summary}`).join('\n')}\n` : 'No matches.\n';
  }
  if (result.command === 'list' && typeof result.data === 'object' && result.data && 'entries' in result.data) {
    const entries = (result.data as { entries: readonly { id: string; name: string; summary: string }[] }).entries;
    return `${entries.map((item) => `${item.id.padEnd(34)} ${item.name} — ${item.summary}`).join('\n')}\n`;
  }
  return `${JSON.stringify(result.data, null, 2)}\n`;
}
