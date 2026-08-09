import type { PropDoc } from './types.ts';

export interface InterfacePickReference {
  interfaceName: string;
  propNames: readonly string[];
}

export interface ExtractedInterface {
  name: string;
  props: readonly PropDoc[];
  nativeElement?: string;
  picks: readonly InterfacePickReference[];
}

export interface ExtractedComponentApi {
  props: readonly PropDoc[];
  nativeElement?: string;
}

function matchingBrace(source: string, openingIndex: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let index = openingIndex; index < source.length; index += 1) {
    const character = source[index] ?? '';
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') { quote = character; continue; }
    if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error('Unbalanced interface body.');
}

function splitTopLevelStatements(body: string): string[] {
  const output: string[] = [];
  let start = 0;
  let braces = 0;
  let parentheses = 0;
  let brackets = 0;
  let angles = 0;
  let quote: string | null = null;
  for (let index = 0; index < body.length; index += 1) {
    const character = body[index] ?? '';
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') { quote = character; continue; }
    if (character === '{') braces += 1;
    else if (character === '}') braces -= 1;
    else if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (character === '<') angles += 1;
    else if (character === '>') angles = Math.max(0, angles - 1);
    else if (character === ';' && braces === 0 && parentheses === 0 && brackets === 0 && angles === 0) {
      output.push(body.slice(start, index).trim());
      start = index + 1;
    }
  }
  const trailing = body.slice(start).trim();
  if (trailing) output.push(trailing);
  return output.filter(Boolean);
}

function normalizeType(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function propsFromBody(body: string): PropDoc[] {
  const props: PropDoc[] = [];
  for (const raw of splitTopLevelStatements(body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''))) {
    const statement = normalizeType(raw);
    const method = statement.match(/^([A-Za-z_$][\w$]*)(\?)?\s*\(([\s\S]*)\)\s*:\s*([\s\S]+)$/);
    if (method) {
      props.push({ name: method[1] ?? '', type: `(${normalizeType(method[3] ?? '')}) => ${normalizeType(method[4] ?? '')}`, required: !method[2] });
      continue;
    }
    const property = statement.match(/^([A-Za-z_$][\w$]*)(\?)?\s*:\s*([\s\S]+)$/);
    if (property) props.push({ name: property[1] ?? '', type: normalizeType(property[3] ?? ''), required: !property[2] });
  }
  return props.filter((prop) => prop.name).sort((a, b) => a.name.localeCompare(b.name));
}

function nativeElementFromText(value: string): string | undefined {
  const match = value.match(/HTML(Button|Input|TextArea|Div|Span|HR)?Element/);
  if (!match) return undefined;
  const names: Record<string, string> = { Button: 'button', Input: 'input', TextArea: 'textarea', Div: 'div', Span: 'span', HR: 'hr' };
  return match[1] ? names[match[1]] : 'element';
}

function picksFromHeader(header: string): InterfacePickReference[] {
  const output: InterfacePickReference[] = [];
  for (const match of header.matchAll(/Pick<\s*([A-Za-z_$][\w$]*)\s*,\s*([^>]+)>/g)) {
    const propNames = [...(match[2] ?? '').matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1] ?? '').filter(Boolean);
    if (match[1] && propNames.length) output.push({ interfaceName: match[1], propNames });
  }
  return output;
}

export function extractExportedInterfaces(source: string): Map<string, ExtractedInterface> {
  const output = new Map<string, ExtractedInterface>();
  const pattern = /export\s+interface\s+([A-Za-z_$][\w$]*)(?:\s*<[^>{]*>)?([^{}]*)\{/g;
  for (const match of source.matchAll(pattern)) {
    const name = match[1] ?? '';
    const openingIndex = (match.index ?? 0) + (match[0]?.lastIndexOf('{') ?? 0);
    const closingIndex = matchingBrace(source, openingIndex);
    const header = match[2] ?? '';
    const nativeElement = nativeElementFromText(header);
    output.set(name, {
      name,
      props: propsFromBody(source.slice(openingIndex + 1, closingIndex)),
      ...(nativeElement ? { nativeElement } : {}),
      picks: picksFromHeader(header),
    });
  }
  return output;
}

function functionNativeElement(source: string, componentName: string): string | undefined {
  const escaped = componentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`export\\s+function\\s+${escaped}\\s*\\([\\s\\S]*?:\\s*(?:Omit<)?[\\s\\S]*?HTML(?:Attributes<)?<*(HTML(?:Button|Input|TextArea|Div|Span|HR)?Element)`));
  return match?.[1] ? nativeElementFromText(match[1]) : undefined;
}

function resolvedProps(entry: ExtractedInterface, registry: ReadonlyMap<string, ExtractedInterface>, seen = new Set<string>()): PropDoc[] {
  if (seen.has(entry.name)) return [...entry.props];
  const nextSeen = new Set(seen).add(entry.name);
  const output = new Map(entry.props.map((prop) => [prop.name, prop]));
  for (const pick of entry.picks) {
    const parent = registry.get(pick.interfaceName);
    if (!parent) continue;
    const parentProps = new Map(resolvedProps(parent, registry, nextSeen).map((prop) => [prop.name, prop]));
    for (const name of pick.propNames) {
      const prop = parentProps.get(name);
      if (prop && !output.has(name)) output.set(name, prop);
    }
  }
  return [...output.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function extractComponentApi(source: string, componentName: string, registry?: ReadonlyMap<string, ExtractedInterface>): ExtractedComponentApi {
  const local = extractExportedInterfaces(source);
  const combined = new Map<string, ExtractedInterface>(registry ? [...registry] : []);
  for (const [name, entry] of local) combined.set(name, entry);
  const componentInterface = combined.get(`${componentName}Props`);
  if (componentInterface) {
    return {
      props: resolvedProps(componentInterface, combined),
      ...(componentInterface.nativeElement ? { nativeElement: componentInterface.nativeElement } : {}),
    };
  }
  const nativeElement = functionNativeElement(source, componentName);
  return { props: [], ...(nativeElement ? { nativeElement } : {}) };
}
