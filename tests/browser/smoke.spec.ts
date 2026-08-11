import { expect, test } from "@playwright/test";

test("serves a keyboard-focusable Button contract story", async ({ page }) => {
  await page.goto("/iframe.html?id=catalog-ui-button--contract&viewMode=story");
  const button = page.getByRole("button", { name: "Continue" });
  await expect(button).toBeVisible();
  await button.focus();
  await expect(button).toBeFocused();
});
