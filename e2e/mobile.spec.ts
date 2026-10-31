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
});
