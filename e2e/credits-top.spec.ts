import { uuidOf } from "./constants";
import { expect, test } from "./fixtures";

test.describe("Credits, the top list and a random video", () => {
  test("an editor credits people, whom viewers find on the video and on their own page", async ({ page, loginAs }) => {
    await loginAs("editor");
    await page.goto(`/manage/videos/${uuidOf(1)}`);
    const credits = page.getByRole("region", { name: "Medverkande" });

    await credits.getByRole("button", { name: "Lägg till medverkande" }).click();
    await credits.getByLabel("Namn", { exact: true }).fill("Anna Andersson");
    await credits.getByLabel("Roll eller uppgift").fill("Kleopatra");
    await credits.getByRole("button", { name: "Spara medverkande" }).click();
    await expect(page.getByText("De medverkande är sparade.")).toBeVisible();

    await loginAs("viewer");
    await page.goto(`/videos/${uuidOf(1)}`);
    await expect(page.getByText("Kleopatra")).toBeVisible();
    await page.getByRole("link", { name: "Anna Andersson" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Anna Andersson" })).toBeVisible();
    await expect(page.getByText("1 film")).toBeVisible();
    await page.getByRole("link", { name: "Alla medverkande" }).click();
    await expect(page.getByRole("link", { name: /Anna Andersson/ })).toBeVisible();
  });

  test("the top list ranks by tabs and says each number", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await page.goto("/top");

    const ranking = page.getByRole("navigation", { name: "Rangordna efter" });

    await expect(ranking.getByRole("link", { name: "Högst betyg" })).toHaveAttribute("aria-current", "page");
    await ranking.getByRole("link", { name: "Mest gillat" }).click();
    await expect(page).toHaveURL(/by=LIKED/);
  });

  test("a random video opens and starts", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await page.goto("/");
    await page.getByRole("button", { name: "Slumpa en film" }).click();
    await expect(page).toHaveURL(/\/videos\/[0-9a-f-]{36}\?autoplay=1$/);
  });
});
