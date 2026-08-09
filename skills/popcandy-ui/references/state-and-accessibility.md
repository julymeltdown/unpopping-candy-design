# State and accessibility completion

Before completion, identify whether the surface can be:

- initially loading;
- populated;
- empty or filtered-empty;
- loading another page;
- partially failed while preserving previous data;
- offline;
- disabled;
- pending;
- read-only;
- not found or unauthorized.

For each interactive element verify:

- native semantics or equivalent ARIA;
- a stable accessible name;
- visible `:focus-visible` treatment;
- keyboard operation and logical focus order;
- no state communicated by color alone;
- usable 320px reflow and 200% zoom;
- reduced-motion behavior;
- focus restoration after an overlay closes.
