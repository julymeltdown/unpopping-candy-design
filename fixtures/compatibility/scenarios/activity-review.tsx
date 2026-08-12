"use client";

import { useState } from "react";
import { NotificationItem } from "@unpopping-candy/social";
import { UnpoppingCandyProvider } from "@unpopping-candy/theme";
import { Alert, Button, Spinner, Stack } from "@unpopping-candy/ui";
import type { CompatibilityScenario } from "../types.js";

export const fixtureId =
  "activity-review" satisfies CompatibilityScenario["fixtureId"];
export const expectedAccessibleName =
  "Activity review compatibility fixture" satisfies CompatibilityScenario["expectedAccessibleName"];

export default function ActivityReviewScenario() {
  const [status, setStatus] = useState<"loading" | "error" | "ready">("ready");
  const notification = {
    id: "notification-1",
    type: "follow" as const,
    actors: [{ id: "member-2", handle: "ji", displayName: "Ji Lee" }],
    message: "Ji Lee followed you",
    createdAt: "2026-08-11T00:00:00.000Z",
    read: false,
  };

  return (
    <UnpoppingCandyProvider storageKey={false}>
      <main aria-label={expectedAccessibleName}>
        <Stack gap={3}>
          <Button onClick={() => setStatus("loading")}>Show loading</Button>
          <Button onClick={() => setStatus("error")}>Show error</Button>
          <Button onClick={() => setStatus("ready")}>Show activity</Button>
          {status === "loading" ? <Spinner label="Loading activity" /> : null}
          {status === "error" ? (
            <Alert tone="critical" title="Activity unavailable">
              Try again.
            </Alert>
          ) : null}
          {status === "ready" ? (
            <NotificationItem notification={notification} />
          ) : null}
        </Stack>
      </main>
    </UnpoppingCandyProvider>
  );
}
