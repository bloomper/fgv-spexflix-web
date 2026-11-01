import {uuidOf} from "./constants";
import {expect, test} from "./fixtures";

test.describe("When something is unavailable", () => {
    test("a new video cannot pick a spex while Spexregister is down, but watching works", async ({page, loginAs, mock}) => {
        await mock.spexregister(false);
        await loginAs("editor");
        await page.goto("/manage/videos/new");
        await page.getByLabel("Spex", {exact: true}).fill("Nob");

        await expect(page.getByText("Spexregistret går inte att nå just nu. Försök igen om en stund.")).toBeVisible();
        await page.goto(`/videos/${uuidOf(1)}`);
        await expect(page.getByRole("heading", {level: 1, name: "Nobel"})).toBeVisible();
    });

    test("a failed server call is shown, and the page keeps working", async ({page, loginAs, mock}) => {
        await mock.failNext("WatchListAdd", "INTERNAL_ERROR");
        await loginAs("viewer");
        await page.goto(`/videos/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Lägg till i min lista"}).click();

        await expect(page.getByText("Listan kunde inte ändras.")).toBeVisible();
        await page.getByRole("button", {name: "Lägg till i min lista"}).click();
        await expect(page.getByRole("button", {name: "I min lista", exact: true})).toBeVisible();
    });

    test("a video being processed says so instead of playing", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto(`/videos/${uuidOf(3)}`);
        await expect(page.getByText("Filmen bearbetas och kan ses snart.")).toBeVisible();
    });

    test("a video that does not exist is not found", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.goto(`/videos/${uuidOf(999)}`);
        await expect(page.getByRole("heading", {name: "Sidan finns inte"})).toBeVisible();
    });
});
