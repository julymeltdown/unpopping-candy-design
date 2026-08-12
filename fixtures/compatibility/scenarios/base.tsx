"use client";

import { UnpoppingCandyProvider } from "@unpopping-candy/theme";
import { Button } from "@unpopping-candy/ui";
import type { CompatibilityScenario } from "../types.js";

export const fixtureId = "base" satisfies CompatibilityScenario["fixtureId"];
export const expectedAccessibleName =
  "Base compatibility fixture" satisfies CompatibilityScenario["expectedAccessibleName"];

export default function BaseScenario() {
  return (
    <UnpoppingCandyProvider theme="light" accent="violet" storageKey={false}>
      <main aria-label={expectedAccessibleName}>
        <Button variant="primary">Verify packed styles</Button>
      </main>
    </UnpoppingCandyProvider>
  );
}
