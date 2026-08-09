# Commonspace Agent Skills

## Purpose

Skills teach an agent the procedure for using Commonspace correctly. They do not duplicate the component catalog. Component and pattern facts are retrieved from CLI or MCP at task time.

## Included Skills

| Skill | Trigger |
|---|---|
| `commonspace-ui` | Any task in a project that uses Commonspace packages |
| `build-commonspace-interface` | Creating a new page, block, or product surface |
| `migrate-to-commonspace` | Migrating an existing interface without changing business behavior |
| `review-commonspace-interface` | Reviewing imports, composition, tokens, states, and accessibility |
| `author-commonspace-component` | Adding or changing a public design-system component |
| `connect-commonspace-figma` | Mapping code components to real Figma component nodes |

## Structure

```text
skills/<skill>/
├─ SKILL.md
├─ references/
├─ scripts/
└─ assets/
```

Only `SKILL.md` is mandatory. Detailed material is split into focused references and loaded when required.

## Installation

Until a separate Skills registry package is published, copy the selected folder into the agent client's supported Skills directory or reference it directly from this repository.

The repository-generated inventory is:

```text
agent/manifests/skills.json
```

## Required behavior

All interface-building Skills enforce the same sequence:

```text
Detect project
→ Search catalog
→ Compose a bounded plan
→ Inspect exact entries
→ Implement through public APIs
→ Add Storybook states
→ Validate source
→ Run interaction and accessibility checks
```

## Skill validation

`npm run skills:check` verifies:

- required YAML frontmatter;
- directory and declared name agreement;
- version metadata;
- missing references;
- unsafe or broken relative links;
- generated Skill inventory freshness.

`npm run skills:generate` rewrites only generated inventory; it does not rewrite human-authored Skill procedures.

## Authoring rules

- Keep the core procedure compact.
- Move detailed examples to references.
- Refer to stable CLI commands and MCP tool names.
- Do not embed a static copy of component props.
- Do not instruct agents to bypass public exports.
- State what evidence is required before completion.
- Add a focused Skill only when its workflow differs materially from an existing Skill.
