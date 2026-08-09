# Figma mapping rules

- Figma properties describe the design model; code props describe the public React API. Map explicitly when names differ.
- Prefer parserless `.figma.ts` template files. They make the rendered snippet and imports deterministic.
- Connect component definitions, not arbitrary instances.
- Keep the component source path, Commonspace knowledge ID, and Storybook contract ID in the mapping manifest.
- Treat slots as composition boundaries. Do not flatten arbitrary nested content into invented props.
- Use one production node URL per catalog component unless an approved variant split is documented.
- Placeholder file keys and `node-id=0-*` are local scaffolding only and must fail the publish gate.
