import {expect, test} from "./fixtures";

test.describe("Watching", () => {
    test("shows a video with its chapters and a link to the number in Spexify", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.goto("/videos/1");

        await expect(page.getByRole("heading", {level: 1, name: "Nobel"})).toBeVisible();
        await expect(page.getByRole("heading", {name: "Kapitel"})).toBeVisible();
        await expect(page.getByRole("button", {name: /Kärleksduetten/})).toBeVisible();
        await expect(page.getByRole("link", {name: "Lyssna på Kärleksduetten i Spexify"})).toHaveAttribute("href", /localhost:3002\/search/);
        await expect(page.getByRole("slider", {name: "Tidslinje"})).toBeVisible();
    });

    test("adds a video to the watch list", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.goto("/videos/1");
        await page.getByRole("button", {name: "Lägg till i min lista"}).click();
        await expect(page.getByRole("button", {name: "I min lista", exact: true})).toBeVisible();

        await page.goto("/watchlist");
        await expect(page.getByRole("link", {name: /Nobel/})).toBeVisible();
    });

    test("searches videos", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.getByRole("searchbox", {name: "Sök film, spex, nummer…"}).fill("nob");
        await page.keyboard.press("Enter");

        await expect(page.getByRole("heading", {name: "Sökresultat för ”nob”"})).toBeVisible();
        await expect(page.getByRole("link", {name: /Nobel/})).toBeVisible();
    });
});

test.describe("Editing", () => {
    test("shows unprocessed and unpublished videos to editors and creates a video from a spex", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto("/manage/videos");
        await expect(page.getByRole("link", {name: "Opublicerad film"})).toBeVisible();
        await expect(page.getByText("Bearbetas", {exact: true}).first()).toBeVisible();

        await page.getByText("Ny film").click();
        await page.getByLabel("Spex", {exact: true}).fill("Nob");
        await page.getByRole("button", {name: /Nobel 1975/}).click();
        await page.getByRole("button", {name: "Skapa"}).click();
        await expect(page).toHaveURL(/\/manage\/videos\/\d+$/);
        await expect(page.getByRole("button", {name: "Ladda upp filen"})).toBeVisible();
        await expect(page.getByRole("switch").first()).toBeDisabled();
    });

    test("lists the processing queue", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto("/manage/queue");
        await expect(page.getByRole("link", {name: "Bearbetas"})).toBeVisible();
        await expect(page.getByText("40 %")).toBeVisible();
    });
});

test.describe("Continue watching", () => {
    test("lists a started video on the start page and resumes where the viewer was", async ({page, loginAs, mock}) => {
        await mock.progress("1", 30);
        await loginAs("viewer");

        await expect(page.getByRole("heading", {name: "Fortsätt titta"})).toBeVisible();
        await page.getByRole("region", {name: "Fortsätt titta"}).getByRole("link", {name: /Nobel/}).click();
        await expect(page).toHaveURL(/\/videos\/1/);
        await expect(page.getByRole("heading", {level: 1, name: "Nobel"})).toBeVisible();
    });

    test("removes a video from the watch list", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.goto("/videos/1");
        await page.getByRole("button", {name: "Lägg till i min lista"}).click();
        await page.getByRole("button", {name: "I min lista", exact: true}).click();
        await expect(page.getByRole("button", {name: "Lägg till i min lista"})).toBeVisible();

        await page.goto("/watchlist");
        await expect(page.getByText("Din lista är tom. Lägg till filmer från deras sidor.")).toBeVisible();
    });
});
