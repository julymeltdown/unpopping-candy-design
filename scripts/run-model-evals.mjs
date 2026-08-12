import {
  buildModelEvaluationPlan,
  parseModelEvaluationCommand,
} from "./lib/model-eval-contract.mjs";
import { runModelEvaluations } from "./lib/model-eval-execution.mjs";
import { reportModelEvaluations } from "./lib/model-eval-reporting.mjs";

const command = parseModelEvaluationCommand(process.argv.slice(2));
if (command.mode === "report") await reportModelEvaluations();
else if (command.mode === "run") await runModelEvaluations(command.config);
else {
  process.stdout.write(
    `${JSON.stringify(buildModelEvaluationPlan(command.config), null, 2)}\n`,
  );
}
