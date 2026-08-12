import test from "node:test";
import { verifyRegistryTemplates } from "../../scripts/verify-registry-templates.mjs";

test("every Registry template typechecks against public source exports", async () => {
  await verifyRegistryTemplates();
});
