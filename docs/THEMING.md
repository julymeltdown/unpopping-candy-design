# Theming

## Token layers

Commonspace uses reference, semantic, and component tokens.

### Reference

Reference tokens are raw values. Components should not generally consume them when a semantic role exists.

```css
--cs-ref-neutral-0
--cs-ref-neutral-950
--cs-ref-blue-500
--cs-space-4
--cs-radius-md
--cs-motion-normal
```

### Semantic

Semantic tokens define intent and are the primary consumer extension surface.

```css
--cs-canvas
--cs-surface
--cs-ink
--cs-ink-muted
--cs-border
--cs-accent
--cs-positive
--cs-warning
--cs-critical
```

### Component

Component tokens coordinate shared dimensions without exposing a component's internal DOM.

```css
--cs-button-height-md
--cs-field-height
--cs-dialog-width-md
```

## Theme contract

Themes are selected by `data-cs-theme`:

```html
<html data-cs-theme="light">
<html data-cs-theme="dark">
<html data-cs-theme="system">
<html data-cs-theme="high-contrast">
```

`system` follows `prefers-color-scheme`. High contrast uses stronger boundaries and avoids relying on shadows.

## Density contract

```html
<div data-cs-density="comfortable">
<div data-cs-density="compact">
```

Density changes control dimensions, not information hierarchy. A compact component must retain target-size and accessibility requirements.

## Accent contract

```html
<div data-cs-accent="blue">
<div data-cs-accent="violet">
<div data-cs-accent="neutral">
```

Accent is reserved for action, selection, focus, and meaningful product emphasis. Status feedback uses positive, warning, and critical roles instead.

## Provider scopes

### Local

Local scope renders a theme boundary. Use it for embedded products, previews, and themed subtrees.

### Document

Document scope writes attributes to the document root. Use it for applications where Commonspace owns the page.

## Persistence

By default, the provider uses:

```text
commonspace:theme:v1
```

Only theme, density, and accent are persisted. Invalid JSON or unknown values are replaced by documented defaults. Set `storageKey={false}` to disable persistence.

## First paint

For document themes, render the bootstrap script before the stylesheet-dependent UI. The generator serializes and escapes the storage key rather than interpolating untrusted raw text.

## Overrides

Prefer scoped semantic overrides:

```css
.brand-area {
  --cs-accent: #2458e6;
  --cs-accent-hover: #1947c4;
}
```

Avoid overriding raw reference tokens globally unless you own every Commonspace surface in the document.

## Theme review checklist

- light, dark, system, and high-contrast checked;
- comfortable and compact density checked;
- text and control contrast checked;
- focus remains visible;
- state is not communicated by color alone;
- reduced motion remains usable;
- product images remain visually dominant;
- consumer overrides use documented tokens.
