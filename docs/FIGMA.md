# Figma Code Connect integration

## Purpose

Unpopping Candy generates Code Connect mapping templates for every public React component. The mapping allows a Figma component instance to resolve to the exact package import and preferred code usage instead of being reconstructed from visual appearance alone.

## Generated files

```text
figma/code-connect/*.figma.ts
figma/manifest.json
agent/manifests/figma.json
figma.config.json
```

Each mapping preserves:

- stable knowledge ID;
- public package import;
- component source path;
- Storybook contract ID;
- preferred example;
- Figma node URL status.

## Placeholder policy

The repository does not invent Figma node URLs. Until a component has been mapped to a real published Figma component, its generated configuration remains a placeholder.

```bash
npm run figma:check
```

This verifies deterministic templates and reports ready versus placeholder mappings.

```bash
npm run figma:publish-check
```

This command must fail while any publish target is a placeholder. That failure is an intentional safety gate.

## Mapping workflow

1. Publish or identify the canonical Figma component.
2. Copy its exact node URL.
3. Update the component's structured Figma metadata or `figma/popcandy.figma.json` according to the generated manifest.
4. Regenerate templates.
5. Run parse and preview:
   ```bash
   npm run figma:parse
   npm run figma:preview
   ```
6. Compare props, variants, names, and examples.
7. Run:
   ```bash
   npm run figma:publish-check
   npm run figma:publish
   ```

Use the `connect-popcandy-figma` Skill for the detailed mapping procedure.

## Publication requirements

A mapping is not ready when:

- the URL is a placeholder;
- the URL does not reference a Figma component node;
- the public import no longer exists;
- the generated preferred example uses an unknown prop;
- the Story ID is missing;
- Figma variants cannot be mapped without silently changing component semantics.

## Source of truth

Figma is a connected design surface, not the source of the React API. Public TypeScript source and component metadata remain authoritative for code. The real Figma component is authoritative for design-node identity and variant-property mapping.
