import {uuidOf} from "./constants";
import {expect, test} from "./fixtures";

test.describe("Watching", () => {
    test("shows a video with its chapters and a link to the number in Spexify", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.goto(`/videos/${uuidOf(1)}`);

        await expect(page.getByRole("heading", {level: 1, name: "Nobel"})).toBeVisible();
        await expect(page.getByRole("heading", {name: "Kapitel"})).toBeVisible();
        await expect(page.getByRole("button", {name: /Kärleksduetten/})).toBeVisible();
        await expect(page.getByRole("link", {name: "Lyssna på Kärleksduetten i Spexify"})).toHaveAttribute("href", /localhost:3002\/search/);
        await expect(page.getByRole("slider", {name: "Tidslinje"})).toBeVisible();
    });

    test("adds a video to the watch list", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.goto(`/videos/${uuidOf(1)}`);
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
        await page.getByLabel("Sök spex på titel eller år").fill("Nob");
        await page.getByRole("button", {name: /Nobel 1975/}).click();
        await page.getByRole("button", {name: "Skapa"}).click();
        await expect(page).toHaveURL(/\/manage\/videos\/[0-9a-f-]{36}$/);
        await expect(page.getByRole("button", {name: "Ladda upp filen"})).toBeVisible();
        await expect(page.getByRole("switch").first()).toBeDisabled();
    });

    test("creates a video about an original and its revival, found from either, and one about no spex", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto("/manage/videos/new");
        await page.getByLabel("Sök spex på titel eller år").fill("Nob");
        await page.getByRole("button", {name: /Nobel 2026 \(nyuppsättning\)/}).click();
        await page.getByLabel("Lägg till fler spex, t.ex. för en jubileumsföreställning").fill("Nob");
        await expect(page.getByRole("button", {name: /Nobel 2026/}).filter({hasText: "vald"})).toBeDisabled();
        await page.getByRole("button", {name: /Nobel 1975/}).click();
        await expect(page.getByRole("list", {name: "Valda spex"}).getByRole("listitem")).toHaveCount(2);
        await page.getByLabel("Titel", {exact: true}).fill("Nobel då och nu");
        await page.getByRole("button", {name: "Skapa"}).click();
        await expect(page).toHaveURL(/\/manage\/videos\/[0-9a-f-]{36}$/);
        await expect(page.getByRole("list", {name: "Valda spex"}).getByRole("listitem").first()).toContainText("Nobel 2026");

        await page.goto("/manage/videos/new");
        await page.getByRole("checkbox", {name: "Inte kopplat till något spex"}).filter({visible: true}).click();
        await page.getByLabel("Titel", {exact: true}).filter({visible: true}).fill("Jubileumskavalkaden");
        await page.getByRole("button", {name: "Skapa"}).filter({visible: true}).click();
        await expect(page.getByRole("heading", {level: 1, name: "Jubileumskavalkaden"})).toBeVisible();
        await expect(page.getByRole("checkbox", {name: "Inte kopplat till något spex"})).toBeChecked();

        await page.goto(`/videos/${uuidOf(1)}`);
        await page.getByRole("link", {name: "Mer från spexet"}).click();
        await expect(page.getByText("Filmer från Nobel, med nyuppsättningar")).toBeVisible();
        await expect(page.getByRole("link", {name: "Visa alla filmer"})).toBeVisible();
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
        await mock.progress(uuidOf(1), 30);
        await loginAs("viewer");

        await expect(page.getByRole("heading", {name: "Fortsätt titta"})).toBeVisible();
        await page.getByRole("region", {name: "Fortsätt titta"}).getByRole("link", {name: /Nobel/}).click();
        await expect(page).toHaveURL(`/videos/${uuidOf(1)}`);
        await expect(page.getByRole("heading", {level: 1, name: "Nobel"})).toBeVisible();
    });

    test("takes a video off continue watching from the start page", async ({page, loginAs, mock}) => {
        await mock.progress(uuidOf(1), 30);
        await loginAs("viewer");

        const row = page.getByRole("region", {name: "Fortsätt titta"});

        await expect(row.getByRole("link", {name: /Nobel/})).toBeVisible();
        await row.getByRole("button", {name: "Ta bort Nobel från Fortsätt titta"}).click();
        await expect(page.getByRole("heading", {name: "Fortsätt titta"})).toHaveCount(0);
        expect((await mock.state()).progress[uuidOf(1)]).toBeUndefined();
    });

    test("removes a video from the watch list", async ({page, loginAs}) => {
        await loginAs("viewer");
        await page.goto(`/videos/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Lägg till i min lista"}).click();
        await page.getByRole("button", {name: "I min lista", exact: true}).click();
        await expect(page.getByRole("button", {name: "Lägg till i min lista"})).toBeVisible();

        await page.goto("/watchlist");
        await expect(page.getByText("Din lista är tom. Lägg till filmer från deras sidor.")).toBeVisible();
    });
});

test.describe("Ratings", () => {
    test("rates a video, sees everyone's average, and finds it as highest rated", async ({page, loginAs, mock}) => {
        await loginAs("viewer");
        await page.goto(`/videos/${uuidOf(1)}`);

        await expect(page.getByText("5,0 av 5 i snitt (1 betyg)")).toBeVisible();
        await page.getByRole("radiogroup", {name: "Ditt betyg för filmen"}).getByRole("radio", {name: "4 stjärnor"}).click();
        await expect.poll(async () => (await mock.state()).ratings[uuidOf(1)]).toBe(4);

        await page.goto(`/videos/${uuidOf(1)}`);
        await expect(page.getByText("4,5 av 5 i snitt (2 betyg)")).toBeVisible();
        await expect(page.getByRole("radiogroup", {name: "Ditt betyg för filmen"}).getByRole("radio", {name: "4 stjärnor"}))
            .toHaveAttribute("aria-checked", "true");

        await page.goto("/");
        await expect(page.getByRole("region", {name: "Högst betyg av dig"}).getByRole("link", {name: /Nobel/})).toBeVisible();
    });
});
