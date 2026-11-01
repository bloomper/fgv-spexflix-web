import {uuidOf} from "./constants";
import {expect, test} from "./fixtures";

test.describe("The trash", () => {
    test("an editor trashes a video and restores it, but cannot delete", async ({page, loginAs, mock}) => {
        await loginAs("editor");
        await page.goto(`/manage/videos/${uuidOf(1)}`);
        page.once("dialog", dialog => dialog.accept());
        await page.getByRole("button", {name: "Lägg i papperskorgen"}).click();
        await expect(page).toHaveURL(/\/manage\/videos$/);

        await page.goto("/manage/trash");
        await expect(page.getByText("Nobel", {exact: true})).toBeVisible();
        await expect(page.getByRole("button", {name: "Radera"})).toHaveCount(0);
        await page.getByRole("button", {name: "Återställ"}).click();
        await expect(page.getByText("Papperskorgen är tom.")).toBeVisible();
        expect((await mock.state()).videos.find(v => v.id === uuidOf(1))?.trashedAt).toBeNull();
    });

    test("an admin deletes from the trash and empties it", async ({page, loginAs, mock}) => {
        await loginAs("admin");
        page.on("dialog", dialog => dialog.accept());
        for (const id of [uuidOf(1), uuidOf(2)]) {
            await page.goto(`/manage/videos/${id}`);
            await page.getByRole("button", {name: "Lägg i papperskorgen"}).click();
            await expect(page).toHaveURL(/\/manage\/videos$/);
        }

        await page.goto("/manage/trash");
        await page.getByRole("listitem").filter({hasText: "Opublicerad film"}).getByRole("button", {name: "Radera"}).click();
        await expect(page.getByText("Opublicerad film")).toHaveCount(0);
        await page.getByRole("button", {name: "Töm papperskorgen"}).click();
        await expect(page.getByText("Papperskorgen är tom.")).toBeVisible();
        expect((await mock.state()).videos.map(v => v.title)).toEqual(["Bearbetas"]);
    });
});

test.describe("The change log", () => {
    test("shows editors their own changes and admins everyone's", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto(`/manage/videos/${uuidOf(1)}`);
        await page.getByRole("switch").first().click();
        await expect(page.getByText("Opublicerad", {exact: true}).first()).toBeVisible();
        await page.goto("/manage/audit");
        await expect(page.getByText("Avpublicerade filmen Nobel")).toBeVisible();

        await loginAs("admin");
        await page.goto("/manage/audit");
        await expect(page.getByText("Avpublicerade filmen Nobel")).toBeVisible();
        await expect(page.getByText("Erik Redaktör").first()).toBeVisible();
    });
});
