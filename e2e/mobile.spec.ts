import {expect, test} from "./fixtures";

const WIDTH = 375;

test.describe("Phone width: no page scrolls sideways", () => {
    test("the watching pages fit the screen", async ({page, loginAs}) => {
        await page.setViewportSize({width: WIDTH, height: 812});
        await loginAs("viewer");

        for (const path of ["/", "/videos", "/videos/1", "/watchlist", "/search?q=nob"]) {
            await page.goto(path);
            await page.getByRole("heading", {level: 1}).first().waitFor();
            expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(WIDTH);
        }
    });

    test("the editing and admin pages fit the screen", async ({page, loginAs}) => {
        await page.setViewportSize({width: WIDTH, height: 812});
        await loginAs("admin");

        for (const path of ["/manage/videos", "/manage/videos/1", "/manage/queue", "/manage/trash", "/manage/audit", "/admin/storage", "/admin/settings"]) {
            await page.goto(path);
            await page.getByRole("heading", {level: 1}).first().waitFor();
            expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(WIDTH);
            // Tables may scroll inside their frame, but not so far that their last column is out of sight
            for (const table of await page.locator("table").all()) {
                expect(await table.evaluate(element => element.scrollWidth), path).toBeLessThanOrEqual(WIDTH);
            }
        }
    });
});
