"use client";

import { useState } from "react";
import { ProfileHeader } from "@unpopping-candy/social";
import { UnpoppingCandyProvider } from "@unpopping-candy/theme";
import { Button, Dialog } from "@unpopping-candy/ui";
import type { CompatibilityScenario } from "../types.js";

export const fixtureId =
  "member-moderation" satisfies CompatibilityScenario["fixtureId"];
export const expectedAccessibleName =
  "Member moderation compatibility fixture" satisfies CompatibilityScenario["expectedAccessibleName"];

export default function MemberModerationScenario() {
  const [canModerate] = useState(true);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const moderate = () => setPending(true);

  return (
    <UnpoppingCandyProvider storageKey={false}>
      <main aria-label={expectedAccessibleName}>
        <ProfileHeader
          profile={{
            user: {
              id: "member-1",
              handle: "sol",
              displayName: "Sol Kim",
              bio: "Community member",
            },
            followers: 128,
            following: 64,
          }}
          primaryAction={
            canModerate ? (
              <Button onClick={() => setOpen(true)}>Review member</Button>
            ) : undefined
          }
        />
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Moderate member"
          description="Confirm the application-owned moderation action."
          footer={
            <Button variant="danger" pending={pending} onClick={moderate}>
              Restrict member
            </Button>
          }
        >
          Permission and workflow state remain in this consumer.
        </Dialog>
      </main>
    </UnpoppingCandyProvider>
  );
}
