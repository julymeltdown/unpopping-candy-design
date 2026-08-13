import assert from "node:assert/strict";
import test from "node:test";
import { bundledCatalog, searchCatalog } from "@unpopping-candy/knowledge";
import { composeInterfacePlan } from "../src/compose.ts";

test("composition planning selects the social publishing frame for a post workflow", () => {
  // Given: a request whose workflow is publishing a social post.
  const request = "publish a post with pending, success, and error states";

  // When: the catalog composes the nearest complete implementation frame.
  const plan = composeInterfacePlan(bundledCatalog, request, (query, options) =>
    searchCatalog(bundledCatalog, query, options),
  );

  // Then: the selected frame and components stay on the post workflow.
  assert.equal(plan.template?.id, "template.social-feed-page");
  assert.ok(
    plan.components.some((entry) => entry.id === "social.post-composer-view"),
  );
});
