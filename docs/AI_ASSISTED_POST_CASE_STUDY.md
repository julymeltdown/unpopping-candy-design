# AI-assisted publish-a-post case study

This Stage 0 record uses committed, deterministic repository inputs. It is an evidence schema for a future authorized real-model comparison, not a model benchmark result.

## Task and acceptance criteria

Build a controlled publish-a-post surface with a retained draft, pending publication state, and visible failure recovery. Use only public Unpopping Candy imports and documented props; keep submission, API, authentication, routing, uploads, and business policy in the application. The result must have a named main landmark, compile from packed packages, build for production, and pass its configured browser smoke assertion.

## Fixture and exact installed versions

The committed fixture is [`fixtures/compatibility/scenarios/publish-post.tsx`](../fixtures/compatibility/scenarios/publish-post.tsx). The executed Task 7 cell was `publish-post/vite-react-19/npm-10` with Node `v22.16.0`, npm `10.9.9`, Vite `8.1.0`, React `19.2.8`, TypeScript `5.7.3`, and Playwright Chromium `151.0.7922.34`. It installed all nine Unpopping Candy packages from checksum-validated local tarballs; the catalog version was `0.2.0`.

## Prompt

The bounded task text used for deterministic discovery was:

```text
Publish a post with consumer-owned draft and submission state. Preserve the draft while pending or failed, use public Unpopping Candy entrypoints, and keep API, authentication, routing, uploads, and business policy in the application.
```

No model received this prompt during Stage 0.

## Bounded inputs

- [`agent/manifests/catalog.json`](../agent/manifests/catalog.json), the committed exact catalog;
- [`agent/manifests/stories.json`](../agent/manifests/stories.json), stable Storybook IDs;
- [`popcandy.config.json`](../popcandy.config.json), repository integration paths;
- `social.post-composer-view` and its public props, states, tokens, and entrypoints;
- `pattern.form-actions` and `pattern.feedback-recovery`;
- the committed compatibility matrix and publish-post fixture;
- no network context, private package internals, Figma node, hosted service, or model output.

## `popcandy` transcript

The local deterministic workflow is reproducible from the repository root:

```bash
npm run popcandy -- info --path . --json
npm run popcandy -- search "publish post" --path . --json
npm run popcandy -- get social.post-composer-view --path . --json
npm run popcandy -- compose "publish a post with pending, success, and error states" --path . --json
npm run popcandy -- validate --path . --json
```

The committed catalog makes the relevant results deterministic: search returns `social.post-composer-view` first; `get` identifies public entrypoints `@unpopping-candy/social` and `@unpopping-candy/social/post`, controlled `value`, `pending`, `onValueChange`, and `onSubmit` props, and the story `catalog-social-post-composer-view--contract`. Validation rejects private entrypoints, invented props, hardcoded visual values, and presentation-owned remote workflows.

## Output diff

No model-authored output diff exists. The committed deterministic fixture is the only implementation evidence:

```bash
git show HEAD:fixtures/compatibility/scenarios/publish-post.tsx
git diff --exit-code -- fixtures/compatibility/scenarios/publish-post.tsx
```

Its observable choices are `PostComposerView` from the public social root, `UnpoppingCandyProvider` from the public theme root, application-owned `draft` and `pending` state, injected callbacks, and a named `main` landmark. This is not represented as generated output.

## Storybook, axe, and visual commands

```bash
pnpm --filter @unpopping-candy/docs test -- --run
pnpm test:browser
npm run preview:capture
pnpm fixtures:compat -- --fixture publish-post --cell vite-react-19 --manager npm-10
```

The Storybook project includes the a11y addon and Chromium browser project. `preview:capture` creates the repository overview image; it is not a pixel-diff service. Only commands actually executed in a dated evidence capture may be reported as passes.

## Model, provider, and timestamp

Real-model comparison: not executed

Model: none. Provider: none. Invocation timestamp: not applicable. No authorization was granted for a provider call or fresh capture. Stage 0 is ineligible for a public model-quality claim.

## Failures and corrections

No model failures or corrections exist. During deterministic packed-consumer work, local package resolution and manager-specific installation issues were corrected before the final Task 7 evidence: internal dependencies were packed together, npm/Yarn/pnpm were invoked at exact versions, and the consumer was isolated from workspace source and root `node_modules`. Those engineering corrections are compatibility evidence, not model-performance evidence.

## No-context comparison

No publish-a-post no-context model run was executed. The repository's older deterministic static evaluation fixtures cover a different profile-settings task and cannot be reused as this comparison. Therefore no score, win rate, quality delta, or causal claim is reported.

## Reproducibility and redaction

Reproduce from a clean checkout at the case-study commit with Node `>=22.13.0`, exact source `pnpm@11.4.0`, the committed lockfile, and the commands above. Record the full commit SHA, catalog digest, tarball SHA-256 values, exact tool/browser versions, command exits, and any retained diff before cleanup.

Public evidence must redact absolute user paths, usernames, tokens, credentials, provider request IDs, private prompts, and unpublished content. Preserve relative repository paths, stable IDs, package versions, digests, and command exits. A future model comparison must be newly authorized, timestamped, and captured rather than inferred from this deterministic record.
