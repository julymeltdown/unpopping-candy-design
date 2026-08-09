# Theming

## Token layers

Unpopping Candy uses reference, semantic, and component tokens.

### Reference

Reference tokens are raw values. Components should not generally consume them when a semantic role exists.

```css
--popcandy-ref-neutral-0
--popcandy-ref-neutral-950
--popcandy-ref-blue-500
--popcandy-space-4
--popcandy-radius-md
--popcandy-motion-normal
```

### Semantic

Semantic tokens define intent and are the primary consumer extension surface.

```css
--popcandy-canvas
--popcandy-surface
--popcandy-ink
--popcandy-ink-muted
--popcandy-border
--popcandy-accent
--popcandy-positive
--popcandy-warning
--popcandy-critical
```

### Component

Component tokens coordinate shared dimensions without exposing a component's internal DOM.

```css
--popcandy-button-height-md
--popcandy-field-height
--popcandy-dialog-width-md
```

## Theme contract

Themes are selected by `data-popcandy-theme`:

```html
<html data-popcandy-theme="light">
<html data-popcandy-theme="dark">
<html data-popcandy-theme="system">
<html data-popcandy-theme="high-contrast">
```

`system` follows `prefers-color-scheme`. High contrast uses stronger boundaries and avoids relying on shadows.

## Density contract

```html
<div data-popcandy-density="comfortable">
<div data-popcandy-density="compact">
```

Density changes control dimensions, not information hierarchy. A compact component must retain target-size and accessibility requirements.

## Accent contract

```html
<div data-popcandy-accent="blue">
<div data-popcandy-accent="violet">
<div data-popcandy-accent="neutral">
```

Accent is reserved for action, selection, focus, and meaningful product emphasis. Status feedback uses positive, warning, and critical roles instead.

## Provider scopes

### Local

Local scope renders a theme boundary. Use it for embedded products, previews, and themed subtrees.

### Document

Document scope writes attributes to the document root. Use it for applications where Unpopping Candy owns the page.

## Persistence

By default, the provider uses:

```text
popcandy:theme:v1
```

Only theme, density, and accent are persisted. Invalid JSON or unknown values are replaced by documented defaults. Set `storageKey={false}` to disable persistence.

## First paint

For document themes, render the bootstrap script before the stylesheet-dependent UI. The generator serializes and escapes the storage key rather than interpolating untrusted raw text.

## Overrides

Prefer scoped semantic overrides:

```css
.brand-area {
  --popcandy-accent: #2458e6;
  --popcandy-accent-hover: #1947c4;
}
```

Avoid overriding raw reference tokens globally unless you own every Unpopping Candy surface in the document.

## Theme review checklist

- light, dark, system, and high-contrast checked;
- comfortable and compact density checked;
- text and control contrast checked;
- focus remains visible;
- state is not communicated by color alone;
- reduced motion remains usable;
- product images remain visually dominant;
- consumer overrides use documented tokens.
