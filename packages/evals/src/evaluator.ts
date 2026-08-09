import type { ComponentDoc, KnowledgeCatalog } from '@commonspace/knowledge';
import type {
  AgentContextMode,
  AgentEvaluationReport,
  AgentEvaluationScenario,
  AgentEvaluationSuite,
  EvaluationFinding,
} from './types.ts';

const MODE_ORDER: readonly AgentContextMode[] = [
  'none',
  'design-md',
  'skill',
  'mcp',
  'skill-mcp',
  'skill-mcp-storybook',
];

const COMMON_DOM_PROPS = new Set([
  'children', 'className', 'style', 'id', 'role', 'title', 'tabIndex', 'slot', 'key', 'ref',
  'hidden', 'lang', 'dir', 'draggable', 'contentEditable', 'suppressHydrationWarning',
  'onClick', 'onChange', 'onInput', 'onSubmit', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp',
  'onPointerDown', 'onPointerUp', 'onMouseEnter', 'onMouseLeave', 'onOpenChange', 'onValueChange',
  'type', 'name', 'value', 'defaultValue', 'placeholder', 'disabled', 'required', 'readOnly',
  'autoFocus', 'autoComplete', 'min', 'max', 'minLength', 'maxLength', 'step', 'pattern',
  'accept', 'multiple', 'checked', 'defaultChecked', 'href', 'target', 'rel', 'download',
  'src', 'alt', 'width', 'height', 'loading', 'decoding', 'open', 'defaultOpen', 'form',
]);

interface ImportedComponent {
  exportedName: string;
  localName: string;
  entrypoint: string;
  doc?: ComponentDoc;
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/');
}

function entrypointSet(catalog: KnowledgeCatalog): Set<string> {
  const output = new Set<string>();
  for (const entry of catalog.entries) {
    if (entry.kind !== 'component') continue;
    for (const item of entry.entrypoints) output.add(item);
  }
  return output;
}

function componentByName(catalog: KnowledgeCatalog): Map<string, ComponentDoc> {
  const output = new Map<string, ComponentDoc>();
  for (const entry of catalog.entries) if (entry.kind === 'component') output.set(entry.name, entry);
  return output;
}

function parseNamedImports(source: string, catalog: KnowledgeCatalog): ImportedComponent[] {
  const byName = componentByName(catalog);
  const output: ImportedComponent[] = [];
  const pattern = /import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"];?/g;
  for (const match of source.matchAll(pattern)) {
    const entrypoint = match[2] ?? '';
    if (!entrypoint.startsWith('@commonspace/')) continue;
    const members = (match[1] ?? '').split(',').map((item) => item.trim()).filter(Boolean);
    for (const member of members) {
      if (member.startsWith('type ')) continue;
      const [exportedRaw, localRaw] = member.split(/\s+as\s+/);
      const exportedName = exportedRaw?.trim() ?? '';
      const localName = localRaw?.trim() || exportedName;
      if (!exportedName || !localName) continue;
      const directDoc = byName.get(exportedName);
      output.push({ exportedName, localName, entrypoint, doc: directDoc });
    }
  }
  return output;
}

function findInvalidImports(catalog: KnowledgeCatalog, filePath: string, source: string): EvaluationFinding[] {
  const allowed = entrypointSet(catalog);
  const findings: EvaluationFinding[] = [];
  const pattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"](@commonspace\/[^'"]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const specifier = match[1] ?? '';
    const invalidPrivatePath = /\/(?:src|dist)(?:\/|$)/.test(specifier);
    const validAsset = /\/(?:styles\.css|tokens\.json)$/.test(specifier);
    if (!invalidPrivatePath && (allowed.has(specifier) || validAsset)) continue;
    findings.push({
      code: invalidPrivatePath ? 'private-import' : 'unknown-entrypoint',
      severity: 'error',
      path: filePath,
      message: invalidPrivatePath
        ? `Import ${specifier} bypasses a public package entrypoint.`
        : `Import ${specifier} is not present in the installed Commonspace catalog.`,
      evidence: `line ${lineOf(source, match.index ?? 0)}`,
    });
  }
  return findings;
}

function attributesFromOpeningTag(tagSource: string): string[] {
  const attributes: string[] = [];
  let index = tagSource.indexOf(' ');
  if (index < 0) return attributes;

  const skipBalanced = (opening: string, closing: string): void => {
    let depth = 0;
    let quote: string | null = null;
    for (; index < tagSource.length; index += 1) {
      const character = tagSource[index] ?? '';
      if (quote) {
        if (character === '\\') index += 1;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'") { quote = character; continue; }
      if (character === opening) depth += 1;
      else if (character === closing) {
        depth -= 1;
        if (depth === 0) { index += 1; return; }
      }
    }
  };

  while (index < tagSource.length) {
    while (/\s/.test(tagSource[index] ?? '')) index += 1;
    const current = tagSource[index] ?? '';
    if (!current || current === '>' || (current === '/' && tagSource[index + 1] === '>')) break;
    if (current === '{') { skipBalanced('{', '}'); continue; }

    const start = index;
    while (/[A-Za-z0-9_.:-]/.test(tagSource[index] ?? '')) index += 1;
    const name = tagSource.slice(start, index);
    if (!name) { index += 1; continue; }
    if (!attributes.includes(name)) attributes.push(name);

    while (/\s/.test(tagSource[index] ?? '')) index += 1;
    if (tagSource[index] !== '=') continue;
    index += 1;
    while (/\s/.test(tagSource[index] ?? '')) index += 1;
    const valueStart = tagSource[index] ?? '';
    if (valueStart === '"' || valueStart === "'") {
      const quote = valueStart;
      index += 1;
      while (index < tagSource.length) {
        const character = tagSource[index] ?? '';
        if (character === '\\') index += 2;
        else if (character === quote) { index += 1; break; }
        else index += 1;
      }
    } else if (valueStart === '{') skipBalanced('{', '}');
    else while (index < tagSource.length && !/\s|>/.test(tagSource[index] ?? '')) index += 1;
  }
  return attributes;
}

function isAllowedProp(name: string, component: ImportedComponent): boolean {
  if (COMMON_DOM_PROPS.has(name)) return true;
  if (name.startsWith('aria-') || name.startsWith('data-') || /^on[A-Z]/.test(name)) return true;
  const metadataProps = new Set(component.doc?.props.map((prop) => prop.name) ?? []);
  return metadataProps.has(name);
}

function findUnknownProps(catalog: KnowledgeCatalog, filePath: string, source: string): EvaluationFinding[] {
  const findings: EvaluationFinding[] = [];
  for (const component of parseNamedImports(source, catalog)) {
    if (!component.doc) continue;
    const escaped = component.localName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const openingPattern = new RegExp(`<${escaped}\\b([\\s\\S]*?)(?:\\/>|>)`, 'g');
    for (const match of source.matchAll(openingPattern)) {
      const tagSource = match[0] ?? '';
      for (const prop of attributesFromOpeningTag(tagSource)) {
        if (isAllowedProp(prop, component)) continue;
        findings.push({
          code: 'unknown-prop',
          severity: 'error',
          path: filePath,
          message: `${component.exportedName} does not document a ${prop} prop.`,
          evidence: `line ${lineOf(source, match.index ?? 0)}`,
        });
      }
    }
  }
  return findings;
}

function findHardcodedVisualValues(filePath: string, source: string): EvaluationFinding[] {
  const findings: EvaluationFinding[] = [];
  const candidates: Array<{ code: string; pattern: RegExp; message: string }> = [
    { code: 'hardcoded-color', pattern: /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\([^)]*\)/g, message: 'Use a Commonspace semantic color token instead of a literal color.' },
    { code: 'hardcoded-spacing', pattern: /\b(?:padding|margin|gap|rowGap|columnGap|borderRadius)\s*:\s*['"](?:-?\d+(?:\.\d+)?)(?:px|rem|em)['"]/g, message: 'Use a Commonspace spacing or radius token instead of a literal visual value.' },
    { code: 'hardcoded-shadow', pattern: /\b(?:boxShadow|filter|backdropFilter)\s*:\s*['"][^'"]+['"]/g, message: 'Use a documented elevation or surface treatment.' },
    { code: 'generic-gradient', pattern: /(?:linear|radial)-gradient\s*\(/g, message: 'Unspecified gradients are not part of the Commonspace visual contract.' },
  ];
  for (const candidate of candidates) {
    for (const match of source.matchAll(candidate.pattern)) {
      const evidence = match[0] ?? '';
      if (evidence.includes('var(--cs-')) continue;
      findings.push({ code: candidate.code, severity: 'error', path: filePath, message: candidate.message, evidence: `line ${lineOf(source, match.index ?? 0)}: ${evidence}` });
    }
  }
  return findings;
}

function visibleText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/&[A-Za-z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findAccessibilityIssues(filePath: string, source: string): EvaluationFinding[] {
  const findings: EvaluationFinding[] = [];
  for (const match of source.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const attributes = match[1] ?? '';
    const content = visibleText(match[2] ?? '');
    if (/aria-label\s*=|aria-labelledby\s*=|title\s*=/.test(attributes) || /[A-Za-z0-9가-힣]/.test(content)) continue;
    findings.push({ code: 'unnamed-button', severity: 'error', path: filePath, message: 'Button controls require a visible or accessible name.', evidence: `line ${lineOf(source, match.index ?? 0)}` });
  }
  for (const match of source.matchAll(/<img\b([^>]*)>/g)) {
    if (/\balt\s*=/.test(match[1] ?? '')) continue;
    findings.push({ code: 'missing-alt', severity: 'error', path: filePath, message: 'Images require an alt attribute, including alt="" when decorative.', evidence: `line ${lineOf(source, match.index ?? 0)}` });
  }
  for (const match of source.matchAll(/<(input|textarea|select)\b([^>]*)>/g)) {
    const attributes = match[2] ?? '';
    if (/aria-label\s*=|aria-labelledby\s*=|\bid\s*=/.test(attributes)) continue;
    findings.push({ code: 'unnamed-field', severity: 'error', path: filePath, message: `Raw ${match[1]} controls require a programmatic label.`, evidence: `line ${lineOf(source, match.index ?? 0)}` });
  }
  return findings;
}

function stateIsCovered(state: string, source: string): boolean {
  const normalized = state.toLowerCase();
  const patterns: Readonly<Record<string, RegExp>> = {
    loading: /\bloading\b|<Spinner\b|<Skeleton\b/i,
    error: /\berror\b|<Alert\b[^>]*\btone\s*=\s*['"](?:critical|warning)['"]/i,
    empty: /<EmptyState\b|\blength\s*===\s*0\b|\bno\s+[a-z]+/i,
    disabled: /\bdisabled\b/i,
    pending: /\bpending\b/i,
    success: /\bsuccess\b|\btone\s*=\s*['"]success['"]/i,
    offline: /\boffline\b/i,
  };
  return patterns[normalized]?.test(source) ?? new RegExp(`\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(source);
}

function componentUsage(catalog: KnowledgeCatalog, source: string): { commonspace: number; total: number; ids: readonly string[] } {
  const imports = parseNamedImports(source, catalog);
  const commonspaceNames = new Set(imports.filter((entry) => entry.doc).map((entry) => entry.localName));
  const tags = [...source.matchAll(/<([A-Z][A-Za-z0-9.]*)\b/g)].map((match) => match[1] ?? '');
  let commonspace = 0;
  const ids = new Set<string>();
  const byLocalName = new Map(imports.filter((entry) => entry.doc).map((entry) => [entry.localName, entry.doc?.id] as const));
  for (const tag of tags) {
    const rootTag = tag.split('.')[0] ?? tag;
    if (!commonspaceNames.has(rootTag)) continue;
    commonspace += 1;
    const id = byLocalName.get(rootTag);
    if (id) ids.add(id);
  }
  return { commonspace, total: tags.length, ids: [...ids].sort() };
}

function bounded(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function evaluateAgentOutput(catalog: KnowledgeCatalog, scenario: AgentEvaluationScenario): AgentEvaluationReport {
  const findings: EvaluationFinding[] = [];
  const fullSource = scenario.files.map((file) => file.content).join('\n');
  let commonspaceComponentsUsed = 0;
  let jsxComponentsUsed = 0;
  const usedComponentIds = new Set<string>();

  for (const file of scenario.files) {
    const path = normalizePath(file.path);
    findings.push(...findInvalidImports(catalog, path, file.content));
    findings.push(...findUnknownProps(catalog, path, file.content));
    findings.push(...findHardcodedVisualValues(path, file.content));
    findings.push(...findAccessibilityIssues(path, file.content));
    const usage = componentUsage(catalog, file.content);
    commonspaceComponentsUsed += usage.commonspace;
    jsxComponentsUsed += usage.total;
    for (const id of usage.ids) usedComponentIds.add(id);
  }

  const requiredStates = [...new Set(scenario.requiredStates ?? [])].map((state) => state.toLowerCase()).sort();
  const coveredStates = requiredStates.filter((state) => stateIsCovered(state, fullSource));
  const missingStates = requiredStates.filter((state) => !coveredStates.includes(state));
  for (const state of missingStates) findings.push({ code: 'missing-state', severity: 'warning', path: scenario.files[0]?.path ?? '.', message: `Required ${state} state is not represented.` });

  const expectedComponents = [...new Set(scenario.expectedComponents ?? [])].sort();
  const missingComponents = expectedComponents.filter((id) => !usedComponentIds.has(id));
  const componentRecall = expectedComponents.length ? (expectedComponents.length - missingComponents.length) / expectedComponents.length : 1;
  for (const id of missingComponents) findings.push({ code: 'missing-component', severity: 'warning', path: scenario.files[0]?.path ?? '.', message: `Expected Commonspace component ${id} is not used.` });

  const metrics = {
    invalidImports: findings.filter((finding) => finding.code === 'private-import' || finding.code === 'unknown-entrypoint').length,
    unknownProps: findings.filter((finding) => finding.code === 'unknown-prop').length,
    hardcodedVisualValues: findings.filter((finding) => finding.code.startsWith('hardcoded-') || finding.code === 'generic-gradient').length,
    accessibilityIssues: findings.filter((finding) => ['unnamed-button', 'missing-alt', 'unnamed-field'].includes(finding.code)).length,
    stateCoverage: requiredStates.length ? coveredStates.length / requiredStates.length : 1,
    commonspaceReuse: jsxComponentsUsed ? commonspaceComponentsUsed / jsxComponentsUsed : 0,
    componentRecall,
    commonspaceComponentsUsed,
    jsxComponentsUsed,
  };

  let score = 100;
  score -= Math.min(40, metrics.invalidImports * 25);
  score -= Math.min(30, metrics.unknownProps * 12);
  score -= Math.min(24, metrics.hardcodedVisualValues * 6);
  score -= Math.min(24, metrics.accessibilityIssues * 12);
  score -= Math.round((1 - metrics.stateCoverage) * 15);
  if (metrics.commonspaceReuse < 0.6) score -= Math.round((0.6 - metrics.commonspaceReuse) / 0.6 * 10);
  score -= Math.round((1 - metrics.componentRecall) * 12);
  score = bounded(score);

  const passed = score >= 85
    && metrics.invalidImports === 0
    && metrics.unknownProps === 0
    && metrics.hardcodedVisualValues === 0
    && metrics.accessibilityIssues === 0
    && metrics.stateCoverage >= 0.75
    && metrics.commonspaceReuse >= 0.6
    && metrics.componentRecall >= 0.75;

  return {
    schemaVersion: 1,
    id: scenario.id,
    mode: scenario.mode,
    task: scenario.task,
    passed,
    score,
    metrics,
    coveredStates,
    missingStates,
    missingComponents,
    findings: findings.sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code) || a.message.localeCompare(b.message)),
  };
}

function modeSummary(reports: readonly AgentEvaluationReport[], mode: AgentContextMode) {
  const selected = reports.filter((report) => report.mode === mode);
  const passing = selected.filter((report) => report.passed).length;
  return {
    total: selected.length,
    passing,
    averageScore: selected.length ? Number((selected.reduce((sum, report) => sum + report.score, 0) / selected.length).toFixed(2)) : 0,
  };
}

export function evaluateScenarioSuite(catalog: KnowledgeCatalog, scenarios: readonly AgentEvaluationScenario[], generatedAt = '2026-08-09T00:00:00.000Z'): AgentEvaluationSuite {
  const reports = scenarios
    .map((scenario) => evaluateAgentOutput(catalog, scenario))
    .sort((a, b) => MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode) || a.id.localeCompare(b.id));
  const passing = reports.filter((report) => report.passed).length;
  return {
    schemaVersion: 1,
    generatedAt,
    scenarios: reports,
    summary: {
      total: reports.length,
      passing,
      failing: reports.length - passing,
      averageScore: reports.length ? Number((reports.reduce((sum, report) => sum + report.score, 0) / reports.length).toFixed(2)) : 0,
      byMode: Object.fromEntries(MODE_ORDER.map((mode) => [mode, modeSummary(reports, mode)])) as AgentEvaluationSuite['summary']['byMode'],
    },
  };
}
