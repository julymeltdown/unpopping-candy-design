# Accessibility policy

Unpopping Candy targets WCAG 2.2 AA for public components, documented compositions, and maintained Storybook contract states. A target is not a blanket conformance claim: each release must identify what was automated, what was manually observed, and what remains unexecuted.

## Supported browser window

The policy window is the latest two major versions available at release time for Chrome, Edge, Firefox, Safari on macOS, and Safari on iOS. Exact versions belong in release evidence because “latest two” changes over time.

Stage 0 automated Storybook and compatibility evidence uses Chromium. It does not prove the other browser lanes.

## Component requirements

Public components must expose appropriate native elements or documented semantics, keyboard behavior, visible focus, accessible names, label/error relationships, disabled and pending states, reduced-motion behavior, zoom/reflow tolerance, and meaningful high-contrast states. Consumer-provided content must preserve those contracts.

Applications remain responsible for route focus, page titles, live data announcements, localized names and errors, authorization messaging, workflow recovery, and end-to-end task accessibility.

## Automated evidence

For every visible state, retain the story ID, theme/density/viewport, interaction steps, axe result, browser version, commit SHA, command, exit status, and artifact locator. Run the configured Storybook browser project with:

```bash
pnpm --filter @unpopping-candy/docs test -- --run
```

Automated checks catch only a subset of accessibility failures. An axe pass is never recorded as screen-reader, mobile, or WCAG conformance evidence.

## Manual assistive-technology evidence schema

Every manual record must include: commit SHA; package/catalog versions; component/story and state; operating system and device; browser and assistive-technology exact versions; input method; steps; expected and observed speech, focus, role, name, state, and value; result (`pass`, `fail`, or `blocked`); issue link; tester; date; and redacted artifact locator.

Required lanes before a release claims them:

- VoiceOver with Safari on macOS: keyboard and rotor navigation, reading order, labels, state changes, errors, dialogs, and focus restoration.
- NVDA with Chrome on Windows: browse/forms modes, keyboard operation, names/roles/values, live feedback, errors, and focus restoration.
- real iOS Safari with VoiceOver: touch exploration, swipe order, activation, zoom/reflow, orientation, virtual keyboard, safe areas, and dynamic feedback on physical hardware.

Simulators, DOM inspection, and automated accessibility trees may supplement the real iOS Safari lane but cannot replace physical-device evidence.

## Claim discipline

Unexecuted checks are never reported as passes. Stage 0 has no committed manual VoiceOver/Safari, NVDA/Chrome, or real iOS Safari capture, so it makes no manual assistive-technology pass claim. Missing hardware, browser, or tester access is recorded as `blocked`, with the missing prerequisite, rather than extrapolated from Chromium or axe.

Accessibility regressions should be reported through [support](./SUPPORT.md); security-sensitive accessibility issues use [private vulnerability reporting](./SECURITY.md).
