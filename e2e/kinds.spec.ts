import { uuidOf } from "./constants";
import { answerDialog, expect, test } from "./fixtures";

test.describe("Video kinds", () => {
  test("an admin adds and reorders kinds, and an editor picks one for a video", async ({ page, loginAs, mock }) => {
    await loginAs("admin");
    await page.goto("/admin/kinds");
    await expect(page.getByRole("heading", { level: 1, name: "Filmsorter" })).toBeVisible();

    await page.getByLabel("Namn på svenska").last().fill("Jubileum");
    await page.getByLabel("Namn på engelska").last().fill("Jubilee");
    await page.getByRole("button", { name: "Lägg till sort" }).click();
    await expect(page.getByText("Sorten är tillagd")).toBeVisible();
    await expect(page.getByText("/ Jubilee")).toBeVisible();

    await page.getByRole("button", { name: "Flytta upp Nummer" }).click();
    await expect.poll(async () => (await mock.state()).kinds.find(kind => kind.nameSv === "Nummer")?.position).toBe(1);

    await page.goto("/manage/videos/new");
    await expect(page.getByLabel("Sort")).toHaveValue(uuidOf(902));
    await page.getByRole("checkbox", { name: "Inte kopplat till något spex" }).click();
    await page.getByLabel("Titel", { exact: true }).fill("Jubileumsfilmen");
    await page.getByLabel("Sort").selectOption({ label: "Jubileum" });
    await page.getByRole("button", { name: "Skapa" }).click();
    await expect(page).toHaveURL(/\/manage\/videos\/[0-9a-f-]{36}$/);
    await expect(page.getByLabel("Sort").locator("option:checked")).toHaveText("Jubileum");
  });

  test("a kind videos use cannot be deleted, an unused one can", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/admin/kinds");

    await expect(page.getByRole("button", { name: "Radera Föreställning" })).toBeDisabled();
    await page.getByRole("button", { name: "Radera Övrigt" }).click();
    await answerDialog(page, "Radera");
    await expect(page.getByText("Sorten är raderad")).toBeVisible();
    await expect(page.getByRole("button", { name: "Radera Övrigt" })).toHaveCount(0);
  });

  test("viewers filter the videos by kind", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await page.goto("/videos");

    const kinds = page.getByRole("navigation", { name: "Sorter" });

    await kinds.getByRole("link", { name: "Trailer" }).click();
    await expect(page).toHaveURL(new RegExp(`kind=${uuidOf(903)}`));
    await expect(page.getByText("Inga filmer matchar.")).toBeVisible();
    await kinds.getByRole("link", { name: "Föreställning" }).click();
    await expect(page.getByRole("link", { name: /Nobel/ })).toBeVisible();
  });
});
