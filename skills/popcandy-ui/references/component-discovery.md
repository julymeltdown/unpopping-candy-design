# Component discovery

Use exact installed-version knowledge.

```bash
popcandy info --json
popcandy search "profile settings" --kind pattern --json
popcandy compose "profile settings" --json
popcandy get pattern.form-actions --json
popcandy get ui.text-field --json
```

Prefer, in order:

1. A complete template that closely matches the requested workflow.
2. A documented product pattern.
3. Existing components composed with Stack, Inline, Container, Surface, and Separator.
4. A new component only when no existing public contract can express a reusable responsibility.

Do not select components by visual similarity alone. Compare use conditions, avoid conditions, state coverage, accessibility requirements, and package boundaries.
