import {uuidOf} from "./constants";
import {answerDialog, expect, hydrated, test} from "./fixtures";

test.describe("Watching more", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("viewer");
    });

    test("shows the collections a video is in and goes on to the next video", async ({page}) => {
        await page.goto(`/videos/${uuidOf(1)}`);
        await expect(page.getByRole("link", {name: "Nobel genom åren"})).toBeVisible();

        await page.getByRole("button", {name: "Nästa: Extranumret"}).click();
        await expect(page).toHaveURL(new RegExp(`/videos/${uuidOf(4)}\\?autoplay=1$`));
        await expect(page.getByRole("heading", {level: 1, name: "Extranumret"})).toBeVisible();
    });

    test("marks a video as watched and unwatched, and takes it off continue watching", async ({page, mock}) => {
        await page.goto(`/videos/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Markera som sedd"}).click();
        await expect(page.getByRole("button", {name: "Markera som osedd"})).toBeVisible();
        await expect.poll(async () => (await mock.state()).finished).toEqual([uuidOf(1)]);

        await page.getByRole("button", {name: "Markera som osedd"}).click();
        await expect.poll(async () => (await mock.state()).finished).toEqual([]);

        await page.goto(`/videos/${uuidOf(4)}?t=20`);
        await page.getByRole("button", {name: "Markera som sedd"}).click();
        await page.getByRole("button", {name: "Markera som osedd"}).click();
        await expect.poll(async () => (await mock.state()).progress[uuidOf(4)]).toBeUndefined();
    });

    test("lists collections and plays one from the start", async ({page}) => {
        await page.goto("/collections");
        await page.getByRole("link", {name: /Nobel genom åren/}).click();

        await expect(page.getByRole("heading", {level: 1, name: "Nobel genom åren"})).toBeVisible();
        // Listeners see only the listed videos, in the collection's order
        await expect(page.getByRole("link", {name: /Opublicerad film/})).toHaveCount(0);
        await page.getByText("Spela från början").click();
        await expect(page.getByRole("heading", {level: 1, name: "Extranumret"})).toBeVisible();
    });

    test("shows the keyboard shortcuts", async ({page}) => {
        await page.goto(`/videos/${uuidOf(1)}`);
        await hydrated(page, "video");
        await page.keyboard.press("?");
        await expect(page.getByRole("dialog", {name: "Kortkommandon"})).toBeVisible();
    });
});

test.describe("Managing collections", () => {
    test("an editor creates a collection, and the change log shows it", async ({page, loginAs, mock}) => {
        await loginAs("editor");
        await page.goto("/manage/collections");
        await page.getByText("Ny samling").click();
        await page.getByLabel("Titel").fill("Bästa numren");
        await page.getByLabel("Lägg till film").selectOption({label: "Extranumret, 1975"});
        await page.getByRole("button", {name: "Lägg till", exact: true}).click();
        await page.getByLabel("Lägg till film").selectOption({label: "Nobel, 1975"});
        await page.getByRole("button", {name: "Lägg till", exact: true}).click();
        await page.getByRole("button", {name: "Flytta upp Nobel, 1975"}).click();
        await page.getByRole("button", {name: "Skapa"}).click();

        await expect(page).toHaveURL(/\/manage\/collections\/[0-9a-f-]{36}$/);
        await expect.poll(async () => (await mock.state()).collections.find(c => c.title === "Bästa numren")?.videoIds)
            .toEqual([uuidOf(1), uuidOf(4)]);
        await expect(page.getByRole("heading", {name: "Ändringar"})).toBeVisible();

        await page.goto("/manage/audit?type=COLLECTION");
        await expect(page.getByRole("link", {name: "Skapade samlingen Bästa numren", exact: true})).toBeVisible();
    });

    test("only an admin deletes a collection", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto(`/manage/collections/${uuidOf(500)}`);
        await expect(page.getByRole("button", {name: "Radera samlingen"})).toHaveCount(0);

        await loginAs("admin");
        await page.goto(`/manage/collections/${uuidOf(500)}`);
        await page.getByRole("button", {name: "Radera samlingen"}).click();
        await answerDialog(page, "Radera samlingen");
        await expect(page).toHaveURL(/\/manage\/collections$/);
        await expect(page.getByText("Det finns inga samlingar ännu.")).toBeVisible();
    });
});
