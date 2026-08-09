# Migration order

1. Add token, icon, UI, and optional social style imports.
2. Add UnpoppingCandyProvider without changing business logic.
3. Replace layout and feedback primitives.
4. Replace forms and overlays.
5. Replace repeated product patterns.
6. Migrate route shells.
7. Remove legacy CSS and dependencies only after consumer and browser tests pass.

Keep each commit independently reviewable and reversible.
