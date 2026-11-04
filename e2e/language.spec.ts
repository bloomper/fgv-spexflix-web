import { uuidOf } from "./constants";
import { expect, test } from "./fixtures";

test.describe("Language", () => {
  test("switches to English and back", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await page.getByRole("button", { name: "Byt språk" }).click();
    await page.getByRole("menuitem", { name: "English" }).click();

    await page.goto(`/videos/${uuidOf(1)}`);
    await expect(page.getByRole("button", { name: "Watch later", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Change language" }).click();
    await page.getByRole("menuitem", { name: "Svenska" }).click();
    await expect(page.getByRole("button", { name: "Se senare", exact: true })).toBeVisible();
  });
});

test.describe("Visitor statistics", () => {
  test("no tracker is loaded without Umami's address and website", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await expect(page.locator("script[src='/stats/script.js']")).toHaveCount(0);
  });
});
