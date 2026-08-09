import { inspectAiContracts } from './lib/ai-contract.mjs';
import { repositoryRoot } from './lib/project-inspection.mjs';

const result = await inspectAiContracts(repositoryRoot());
if (result.errors.length) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}
console.log(`AI contracts verified: ${result.counts.entries} entries, ${result.counts.stories} stories, ${result.counts.skills} Skills, ${result.counts.mcpTools} MCP tools, ${result.counts.registryTemplates} Registry templates, ${result.counts.evalScenarios} eval scenarios, ${result.counts.figmaMappings} Figma mappings.`);
