import { uuidOf } from "./constants";
import { expect, test } from "./fixtures";

test.describe("Administration", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs("admin");
  });

  test("shows the storage", async ({ page }) => {
    await page.goto("/admin/storage");
    await expect(page.getByRole("heading", { level: 1, name: "Lagring" })).toBeVisible();
    await expect(page.getByText("Original", { exact: true })).toBeVisible();
    await expect(page.getByText("Ledigt", { exact: true })).toBeVisible();
  });

  test("changes the settings, and the welcome text is shown on the start page", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.getByLabel("Välkomsttext (svenska)").fill("Välkommen till spexens filmer!");
    await page.getByLabel("Största fil (GB)").fill("80");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Sparat")).toBeVisible();

    await page.goto("/");
    await expect(page.getByText("Välkommen till spexens filmer!")).toBeVisible();
  });

  test("processes a video again", async ({ page, mock }) => {
    await page.goto(`/manage/videos/${uuidOf(1)}`);
    await page.getByRole("button", { name: "Bearbeta om" }).click();

    await expect(page.getByText("Filen väntar på bearbetning")).toBeVisible();
    expect((await mock.state()).videos.find(v => v.id === uuidOf(1))?.jobStatus).toBe("QUEUED");
  });

  test("is not for editors", async ({ page, loginAs }) => {
    await loginAs("editor");
    for (const path of ["/admin/storage", "/admin/settings"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: /Lagring|Inställningar/ })).toHaveCount(0);
    }
  });
});
