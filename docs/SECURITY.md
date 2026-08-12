# Security policy

## Reporting a vulnerability

Use GitHub private vulnerability reporting for this repository:

[Privately report a security vulnerability](https://github.com/julymeltdown/unpopping-candy-design/security/advisories/new)

Do not disclose a suspected vulnerability in a public issue, discussion, pull request, Storybook, fixture, or model prompt. If GitHub does not present the private-report form, contact the repository owners through GitHub without including exploit details publicly and request a private channel.

Include affected package and version or commit, impact, prerequisites, minimal reproduction, proof of concept, known mitigations, and whether disclosure is already public. Remove credentials, personal data, private product content, and unrelated secrets.

## Scope and expectations

In scope are the nine public package entrypoints, CLI and local MCP input boundaries, Registry path/checksum/apply guards, generated artifact integrity, package/tarball resolution, and repository release tooling.

Stage 0 has no remote Registry or hosted MCP service. Reports about hypothetical hosted surfaces should identify the relevant committed code or planned threat boundary. Placeholder Figma mappings are not public design-node claims.

Maintainers will triage reports privately and coordinate validation, remediation, advisory text, and disclosure timing with the reporter. This document does not promise a response or resolution SLA.

## Safe handling

Do not access data you do not own, disrupt services, persist after demonstrating impact, use social engineering, or publish secrets. Local Registry apply remains dry-run by default; do not test write behavior outside a workspace you control.

Publication, provider calls, deployment, workflow dispatch, remote writes, and public disclosure remain external actions requiring explicit owner authorization. A local proof or dry run is not authorization.

For non-security defects, use the [support policy](./SUPPORT.md).
