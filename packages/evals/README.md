# @unpopping-candy/evals

Deterministic quality evaluation for interfaces generated with Unpopping Candy.

The evaluator does not call a language model. It scores source artifacts against the installed Unpopping Candy knowledge catalog and reports:

- public-import compliance;
- invented component props;
- hardcoded visual values;
- basic accessibility failures;
- required loading, error, empty, disabled, and pending states;
- Unpopping Candy component reuse.

```ts
import { bundledCatalog } from '@unpopping-candy/knowledge';
import { evaluateAgentOutput } from '@unpopping-candy/evals';

const report = evaluateAgentOutput(bundledCatalog, scenario);
```
