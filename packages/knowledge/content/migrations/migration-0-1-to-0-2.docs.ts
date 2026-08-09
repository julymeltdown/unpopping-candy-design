export default {
  "schemaVersion": 1,
  "kind": "migration",
  "id": "migration.0-1-to-0-2",
  "name": "Commonspace UI 0.1 to 0.2",
  "version": "0.2.0",
  "status": "stable",
  "summary": "Introduces the AI-native knowledge, CLI, MCP, Registry, and generated-document layer without changing existing visual package APIs.",
  "keywords": [
    "migration",
    "0.1",
    "0.2",
    "ai",
    "knowledge"
  ],
  "useWhen": [
    "A 0.1.x consumer adopts the 0.2 AI tooling and generated documentation."
  ],
  "avoidWhen": [
    "The project only consumes visual packages and does not need AI tooling."
  ],
  "fromVersion": "0.1.0",
  "toVersion": "0.2.0",
  "changes": [
    {
      "kind": "manual",
      "from": "Hand-written DESIGN.md",
      "to": "Generated DESIGN.md",
      "guidance": "Edit component and pattern metadata, then regenerate agent artifacts."
    },
    {
      "kind": "manual",
      "from": "Unstructured component discovery",
      "to": "commonspace search and MCP resources",
      "guidance": "Run project detection before generating interfaces."
    },
    {
      "kind": "manual",
      "from": "Visual package source imports",
      "to": "Published package entrypoints",
      "guidance": "Continue importing only documented @commonspace/* entrypoints."
    }
  ],
  "accessibility": {
    "requirements": [
      "No visual or interaction behavior changes are implied by adopting the tooling layer."
    ]
  },
  "examples": {
    "preferred": [],
    "avoid": []
  }
} as const;
