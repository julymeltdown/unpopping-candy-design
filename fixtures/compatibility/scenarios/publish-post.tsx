"use client";

import { useState } from "react";
import { PostComposerView } from "@unpopping-candy/social";
import { UnpoppingCandyProvider } from "@unpopping-candy/theme";
import type { CompatibilityScenario } from "../types.js";

export const fixtureId =
  "publish-post" satisfies CompatibilityScenario["fixtureId"];
export const expectedAccessibleName =
  "Publish post compatibility fixture" satisfies CompatibilityScenario["expectedAccessibleName"];

export default function PublishPostScenario() {
  const [draft, setDraft] = useState("Packed consumer draft");
  const [pending, setPending] = useState(false);
  const submit = () => setPending(true);

  return (
    <UnpoppingCandyProvider storageKey={false}>
      <main aria-label={expectedAccessibleName}>
        <PostComposerView
          viewer={{ id: "viewer-1", handle: "mira", displayName: "Mira Park" }}
          value={draft}
          pending={pending}
          onValueChange={setDraft}
          onSubmit={submit}
        />
      </main>
    </UnpoppingCandyProvider>
  );
}
