import {type Page} from "@playwright/test";
import {expect, hydrated, test} from "./fixtures";

const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from("ftypisom"), Buffer.alloc(4096)]);
const VIDEO_FILE = "input[type=file][accept^='video'], input[type=file][accept*='.mp4']";

async function chooseFile(page: Page, selector: string, name: string, mimeType: string, buffer: Buffer) {
    await hydrated(page, selector);
    await page.locator(selector).first().setInputFiles({name, mimeType, buffer});
}

async function newVideo(page: Page) {
    await page.goto("/manage/videos/new");
    await page.getByLabel("Spex", {exact: true}).fill("Nob");
    await page.getByRole("button", {name: /Nobel 1975/}).click();
    await page.getByRole("button", {name: "Skapa"}).click();
    await expect(page).toHaveURL(/\/manage\/videos\/\d+$/);
}

test.describe("Editing a video", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("editor");
    });

    test("uploads the file with tus, waits for processing and publishes", async ({page, mock, loginAs}) => {
        await newVideo(page);
        await chooseFile(page, VIDEO_FILE, "nobel-premiaren.mp4", "video/mp4", MP4);

        await expect(page.getByText("Filen väntar på bearbetning")).toBeVisible();
        await expect(page.getByText("Väntar på tur…")).toBeVisible();
        await expect(page.getByRole("switch").first()).toBeDisabled();

        await mock.process();
        // The page refreshes itself while the job waits or runs
        await expect(page.getByText(/Kvalitetsnivåer: 720p/)).toBeVisible({timeout: 10_000});
        await page.getByRole("switch").first().click();
        await expect(page.getByText("Publicerad", {exact: true})).toBeVisible();

        await loginAs("viewer");
        await page.goto("/videos");
        await expect(page.getByRole("link", {name: /Nobel/})).toHaveCount(2);
    });

    test("shows why processing failed", async ({page, mock}) => {
        await newVideo(page);
        await chooseFile(page, VIDEO_FILE, "trasig.mp4", "video/mp4", MP4);
        await expect(page.getByText("Väntar på tur…")).toBeVisible();

        await mock.process("ffmpeg kunde inte läsa filen");
        await expect(page.getByText("Bearbetningen misslyckades: ffmpeg kunde inte läsa filen")).toBeVisible({timeout: 10_000});
    });

    test("saves the video's details", async ({page}) => {
        await page.goto("/manage/videos/1");
        await page.getByLabel("Föreställning", {exact: true}).fill("Andra föreställningen");
        await page.getByRole("button", {name: "Spara", exact: true}).click();

        await expect(page.getByText("Sparat")).toBeVisible();
        await page.reload();
        await expect(page.getByLabel("Föreställning", {exact: true})).toHaveValue("Andra föreställningen");
    });

    test("sets chapters, one linked to a track in Spexify", async ({page, mock}) => {
        await page.goto("/manage/videos/1");
        await expect(page.getByText("Markera var numren börjar, och koppla dem till låtarna i Spexify.")).toBeVisible();
        await page.getByRole("button", {name: "Ta bort kapitlet Ouvertyr"}).click();
        await page.getByRole("button", {name: "Lägg till kapitel"}).click();
        await page.getByLabel("Start").last().fill("1:30");
        await page.getByLabel("Titel", {exact: true}).last().fill("Finalen");
        await page.getByRole("button", {name: "Spara kapitlen"}).click();
        await expect(page.getByText("Sparat")).toBeVisible();

        const chapters = (await mock.state()).videos.find(v => v.id === "1")?.chapters;

        expect(chapters?.map(chapter => [chapter.startSeconds, chapter.title, chapter.spexifyTrackId]))
            .toEqual([[20, "Kärleksduetten", "12"], [90, "Finalen", null]]);
    });

    test("refuses a chapter without a start", async ({page}) => {
        await page.goto("/manage/videos/1");
        await page.getByRole("button", {name: "Lägg till kapitel"}).click();
        await page.getByLabel("Titel", {exact: true}).last().fill("Utan tid");
        await page.getByLabel("Start").last().fill("");
        await page.getByRole("button", {name: "Spara kapitlen"}).click();

        await expect(page.getByText("Varje kapitel behöver en starttid (m:ss) och en titel.")).toBeVisible();
    });

    test("chapters are not linked while Spexify is down", async ({page, mock}) => {
        await mock.spexify(false);
        await page.goto("/manage/videos/1");
        await expect(page.getByText(/Spexify har inga låtar för det här spexet/)).toBeVisible();
    });

    test("uploads subtitles in SRT and removes them", async ({page, mock}) => {
        await page.goto("/manage/videos/1");
        await page.getByLabel("Språkkod").fill("sv");
        await page.getByLabel("Namn", {exact: true}).fill("Svenska");
        await hydrated(page, "#sub-file");
        await page.getByLabel("Fil (WebVTT eller SRT)").setInputFiles({
            name: "nobel.srt", mimeType: "application/x-subrip", buffer: Buffer.from("1\n00:00:01,000 --> 00:00:04,500\nOuvertyr\n"),
        });
        await page.getByRole("button", {name: "Ladda upp", exact: true}).click();

        await expect(page.getByRole("button", {name: "Ta bort", exact: true})).toBeVisible();
        expect((await mock.state()).videos.find(v => v.id === "1")?.subtitles).toEqual([{language: "sv", label: "Svenska"}]);

        await page.getByRole("button", {name: "Ta bort", exact: true}).click();
        await expect(page.getByRole("button", {name: "Ta bort", exact: true})).toHaveCount(0);
    });

    test("takes the poster from the video", async ({page, mock}) => {
        await page.goto("/manage/videos/1");
        await page.getByRole("button", {name: "Använd bilden som affisch"}).click();

        await expect(page.getByText("Sparat")).toBeVisible();
        expect((await mock.state()).videos.find(v => v.id === "1")?.posterSeconds).toBe(0);
    });

    test("tells the editor when someone else changed the video", async ({page, mock}) => {
        await mock.failNext("VideoUpdate", "CONFLICT");
        await page.goto("/manage/videos/1");
        await page.getByRole("button", {name: "Spara", exact: true}).click();

        await expect(page.getByText("Någon annan har ändrat detta. Ladda om sidan och försök igen.")).toBeVisible();
    });
});
