# Public API checklist

- One clear responsibility and change reason.
- Controlled behavior for product state; explicit uncontrolled behavior only when useful.
- Native DOM props, `className`, `style`, `ref`, and stable `data-cs-*` state hooks where practical.
- No undocumented internal import path.
- No API DTO, router, cache, auth, or application dependency.
- No visual value that should be a token.
- SemVer and migration impact identified before merge.
