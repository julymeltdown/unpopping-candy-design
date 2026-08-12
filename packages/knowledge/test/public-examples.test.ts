import assert from "node:assert/strict";
import test from "node:test";
import { bundledCatalog } from "../src/index.ts";
import { publicContractErrors } from "./public-example-contract.ts";

test("documented variant aliases stay unique and exact", () => {
  for (const entry of bundledCatalog.entries) {
    if (entry.kind !== "component") continue;
    const names = entry.variants.map(({ name }) => name);
    assert.equal(new Set(names).size, names.length, entry.id);
    if (entry.id === "ui.button")
      assert.deepEqual(names, ["primary", "secondary", "ghost", "danger"]);
  }
});

test("preferred example literals resolve documented variant aliases", () => {
  const errors = publicContractErrors(
    '<Button variant="not-a-variant">Save</Button>',
    "mutated Button example",
  );
  assert.deepEqual(errors, [
    "mutated Button example: Button.variant expected primary | secondary | ghost | danger",
  ]);
});

test("preferred JSX rejects aliases, qualifications, and prop spreads", () => {
  assert.deepEqual(
    publicContractErrors(
      '<Candy.Button variant="primary">Save</Candy.Button>',
      "qualified Button",
      "Button",
    ),
    ["qualified Button: expected direct Button JSX"],
  );
  assert.deepEqual(
    publicContractErrors("<Action>Save</Action>", "aliased Button", "Button"),
    ["aliased Button: expected direct Button JSX"],
  );
  assert.deepEqual(
    publicContractErrors(
      "<Button {...props}>Save</Button>",
      "spread Button",
      "Button",
    ),
    ["spread Button: Button uses unverified prop spread"],
  );

  for (const [label, code, expected] of [
    [
      "qualified expected prefix",
      '<Button.Group variant="not-a-variant" />',
      "Button",
    ],
    [
      "nested qualified component",
      '<Inline><Candy.Button variant="not-a-variant" /></Inline>',
      "Inline",
    ],
    [
      "nested aliased component",
      '<Inline><Action variant="not-a-variant" /></Inline>',
      "Inline",
    ],
    [
      "qualified nested spread",
      "<Inline><Candy.Button {...props} /></Inline>",
      "Inline",
    ],
    [
      "string decoy",
      'const decoy = "<Button>"; <Action>Save</Action>',
      "Button",
    ],
  ] as const) {
    assert.ok(
      publicContractErrors(code, label, expected).length > 0,
      `${label} must fail closed`,
    );
  }
});

test("preferred JSX keeps scanning after comments", () => {
  for (const [label, code] of [
    [
      "line comment boundary",
      '<Button variant="primary">Save</Button> // visible explanation\n<Action>Unsafe</Action>',
    ],
    [
      "block comment boundary",
      '<Button variant="primary">Save</Button> /* visible explanation */ <Candy.Button variant="not-a-variant" />',
    ],
  ] as const) {
    assert.ok(
      publicContractErrors(code, label, "Button").length > 0,
      `${label} must fail closed`,
    );
  }
});

test("preferred JSX keeps scanning inside quoted attribute expressions", () => {
  const errors = publicContractErrors(
    '<Button id={"safe } value"} variant="not-a-variant">Save</Button>',
    "quoted brace attribute",
    "Button",
  );
  assert.deepEqual(errors, [
    "quoted brace attribute: Button.variant expected primary | secondary | ghost | danger",
  ]);
});
