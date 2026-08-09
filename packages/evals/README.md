# @commonspace/evals

Deterministic quality evaluation for interfaces generated with Commonspace UI.

The evaluator does not call a language model. It scores source artifacts against the installed Commonspace knowledge catalog and reports:

- public-import compliance;
- invented component props;
- hardcoded visual values;
- basic accessibility failures;
- required loading, error, empty, disabled, and pending states;
- Commonspace component reuse.

```ts
import { bundledCatalog } from '@commonspace/knowledge';
import { evaluateAgentOutput } from '@commonspace/evals';

const report = evaluateAgentOutput(bundledCatalog, scenario);
```
