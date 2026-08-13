import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  assertCompleteCaptureSet,
  assertProviderCliVersion,
  buildClaudeCommand,
  buildCodexCommand,
  parseClaudeEnvelope,
  parseCodexJsonl,
  parseModelEvaluationCapture,
  redactCapture,
  summarizeCaptures,
  wilsonInterval,
} from "../src/index.ts";
import type { ModelEvaluationCapture } from "../src/index.ts";

const now = new Date("2026-08-12T00:00:00.000Z");

function capture(
  overrides: Partial<ModelEvaluationCapture> = {},
): ModelEvaluationCapture {
  return {
    schemaVersion: 1,
    taskId: "profile-settings",
    contextMode: "none",
    prompt: "Build profile settings with all visible states.",
    contextDigest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    contextBytes: 0,
    rawOutput: '{"passed":true,"reason":"uses public APIs"}',
    provider: "codex",
    model: "codex-fixture-model",
    providerCli: { name: "@openai/codex", version: "0.147.0" },
    timestamp: "2026-08-11T12:00:00.000Z",
    evaluatorVersion: "0.2.0",
    repetition: 1,
    result: "pass",
    reason: "uses public APIs",
    usage: { inputTokens: 100, outputTokens: 20 },
    estimatedUsd: 0.01,
    evidencePath: "profile-settings/codex/none/1.jsonl",
    ...overrides,
  };
}

test("capture boundary requires complete reproducible provider evidence", () => {
  const valid = capture();
  assert.deepEqual(parseModelEvaluationCapture(valid, now), valid);
  assert.throws(
    () => parseModelEvaluationCapture(capture({ model: "codex" }), now),
    /full model ID/,
  );
});

test("capture boundary rejects stale, future, and absolute-path evidence", () => {
  const invalid: ReadonlyArray<[Partial<ModelEvaluationCapture>, RegExp]> = [
    [{ timestamp: "2026-07-12T23:59:59.999Z" }, /30 days/],
    [{ evidencePath: "/Users/alice/private/capture.jsonl" }, /relative/],
  ];
  for (const [overrides, message] of invalid) {
    assert.throws(
      () => parseModelEvaluationCapture(capture(overrides), now),
      message,
    );
  }
});

test("complete capture sets require every provider, context, and repetition", () => {
  const complete = ["codex", "claude"].flatMap((provider) =>
    ["none", "popcandy"].flatMap((contextMode) =>
      [1, 2, 3, 4, 5].map((repetition) =>
        capture({
          provider: provider === "codex" ? "codex" : "claude",
          model: `${provider}-fixture-model`,
          providerCli:
            provider === "codex"
              ? { name: "@openai/codex", version: "0.147.0" }
              : { name: "@anthropic-ai/claude-code", version: "2.1.114" },
          contextMode: contextMode === "none" ? "none" : "popcandy",
          contextBytes: contextMode === "none" ? 0 : 512,
          repetition,
        }),
      ),
    ),
  );
  assert.deepEqual(assertCompleteCaptureSet(complete, now), complete);
  assert.throws(
    () =>
      assertCompleteCaptureSet(
        complete.filter((item) => item.provider === "codex"),
        now,
      ),
    /both providers/,
  );
  assert.throws(
    () => assertCompleteCaptureSet(complete.slice(0, -1), now),
    /five/,
  );
});

test("public capture redaction removes API-like secrets and user paths", () => {
  const redacted = redactCapture(
    capture({
      prompt: 'OPENAI_API_KEY="synthetic-double" /Users/alice/work/private.ts',
      rawOutput: String.raw`{"type":"item.completed","item":{"text":"{\"OPENAI_API_KEY\":\"synthetic-escaped-openai\"} {\"ANTHROPIC_API_KEY\":\"synthetic-escaped-anthropic\"} transformed=c3ludGhldGljLW9wZW5haQ=="}} ANTHROPIC_API_KEY='synthetic-single' Bearer sk-ant-api03-abcdefghijklmnopqrstuvwxyz at C:\Users\Alice\secret.txt`,
      reason:
        'OPENAI_API_KEY variable is documented. {"OPENAI_API_KEY":"synthetic-json","ANTHROPIC_API_KEY":"synthetic-json-two"} /home/alice/source.ts ghp_abcdefghijklmnopqrstuvwxyz',
    }),
  );
  const serialized = JSON.stringify(redacted);
  assert.doesNotMatch(
    serialized,
    /synthetic-|abcdefghijklmnopqrstuvwxyz|\/Users\/alice|\/home\/alice|C:\\Users\\Alice/,
  );
  assert.match(
    serialized,
    /(?=.*\[REDACTED_SECRET\])(?=.*\[REDACTED_USER_PATH\])/,
  );
  assert.doesNotMatch(redacted.rawOutput, /OPENAI_API_KEY|ANTHROPIC_API_KEY/);
  assert.equal(redacted.rawOutput, "[REDACTED_RAW_OUTPUT]");
  assert.doesNotMatch(serialized, /c3ludGhldGljLW9wZW5haQ==/);
  assert.match(redacted.reason, /OPENAI_API_KEY variable is documented/);
});

test("Wilson intervals are bounded and cover the hand-checked five-run estimate", () => {
  assert.deepEqual(wilsonInterval(0, 0), { lower: 0, upper: 1 });
  const interval = wilsonInterval(3, 5);
  assert.ok(Math.abs(interval.lower - 0.2307) < 0.0001);
  assert.ok(Math.abs(interval.upper - 0.8824) < 0.0001);
});

test("summaries keep context groups separate and report percentage-point improvement", () => {
  const noContext = [1, 2, 3, 4, 5].map((repetition) =>
    capture({ repetition, result: repetition <= 2 ? "pass" : "fail" }),
  );
  const withContext = [1, 2, 3, 4, 5].map((repetition) =>
    capture({
      contextMode: "popcandy",
      contextBytes: 512,
      repetition,
      result: repetition <= 4 ? "pass" : "fail",
      usage: { inputTokens: 200, outputTokens: 40 },
      estimatedUsd: 0.02,
    }),
  );
  const summary = summarizeCaptures([...noContext, ...withContext], now);
  assert.equal(summary.groups.length, 2);
  assert.deepEqual(
    summary.groups.map((group) => group.contextMode),
    ["none", "popcandy"],
  );
  assert.deepEqual(
    summary.groups.map((group) => group.complianceRate),
    [0.4, 0.8],
  );
  assert.equal(summary.groups[1]?.improvementPercentagePoints, 40);
  assert.equal(summary.groups[1]?.totalTokens, 1_200);
  assert.equal(summary.groups[1]?.estimatedUsd, 0.1);
  assert.equal(summary.groups[1]?.fiveRunComplete, true);
  assert.equal(summary.groups[1]?.newestCaptureAgeDays, 0.5);
  assert.equal(summary.groups[1]?.oldestCaptureAgeDays, 0.5);
});

test("Codex JSONL parser selects the final completed agent message and terminal usage", () => {
  const output = parseCodexJsonl(
    [
      '{"type":"item.completed","item":{"type":"agent_message","text":"first"}}',
      '{"type":"item.completed","item":{"type":"agent_message","text":"final"}}',
      '{"type":"turn.completed","usage":{"input_tokens":11,"output_tokens":7}}',
    ].join("\n"),
  );
  assert.equal(output.output, "final");
  assert.deepEqual(output.usage, { inputTokens: 11, outputTokens: 7 });
  assert.match(output.raw, /"text":"first"/);
  for (const raw of [
    `${output.raw}\n{"type":"turn.completed","usage":{"input_tokens":1,"output_tokens":1}}`,
    `${output.raw}\n{"type":"item.completed","item":{"type":"agent_message","text":"late"}}`,
  ]) {
    assert.throws(() => parseCodexJsonl(raw), /terminal event|final event/);
  }
});

test("Claude parser reads only structured output and envelope usage", () => {
  const output = parseClaudeEnvelope(
    JSON.stringify({
      type: "result",
      result: "untrusted fallback",
      structured_output: { passed: true, reason: "public imports only" },
      usage: { input_tokens: 13, output_tokens: 5 },
    }),
  );
  assert.equal(output.output, '{"passed":true,"reason":"public imports only"}');
  assert.deepEqual(output.usage, { inputTokens: 13, outputTokens: 5 });
  assert.throws(
    () =>
      parseClaudeEnvelope('{"type":"result","result":"fallback","usage":{}}'),
    /structured_output/,
  );
  assert.throws(
    () =>
      parseClaudeEnvelope(
        '{"type":"assistant","structured_output":{},"usage":{"input_tokens":1,"output_tokens":1}}',
      ),
    /result envelope/,
  );
});

test("provider preflight and command contracts are pinned and explicit", () => {
  assert.throws(
    () => assertProviderCliVersion("codex", "0.148.0"),
    /0\.147\.0/,
  );
  const codexArgs =
    "exec --ignore-user-config --strict-config --disable shell_tool --disable unified_exec --disable shell_snapshot -c shell_environment_policy.inherit=none -c shell_environment_policy.experimental_use_profile=false -c shell_environment_policy.ignore_default_excludes=false --ephemeral --sandbox read-only --model codex-fixture-model --json --output-schema capture-schema.json -".split(
      " ",
    );
  assert.deepEqual(buildCodexCommand("codex-fixture-model"), codexArgs);
  const claudeArgs =
    '--bare|--print|--tools||--model|claude-fixture-model|--output-format|json|--json-schema|{"type":"object"}|--max-budget-usd|0|--no-session-persistence|--permission-mode|plan'.split(
      "|",
    );
  assert.deepEqual(
    buildClaudeCommand("claude-fixture-model", '{"type":"object"}', 0),
    claudeArgs,
  );
});

test("fixture-only plan enumerates twenty runs without provider preflight", () => {
  const script = new URL(
    "../../../scripts/run-model-evals.mjs",
    import.meta.url,
  );
  const args =
    `plan --codex-model codex-fixture-model --claude-model claude-fixture-model --max-estimated-usd 0 --claude-max-budget-usd 0`.split(
      " ",
    );
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", script.pathname, ...args],
    { encoding: "utf8", env: { PATH: "" } },
  );
  assert.equal(result.status, 0, result.stderr);
  const plan: unknown = JSON.parse(result.stdout);
  assert.ok(
    typeof plan === "object" &&
      plan !== null &&
      "runs" in plan &&
      Array.isArray(plan.runs),
  );
  assert.equal(plan.runs.length, 20);
});
