import { uuidOf } from "./constants";
import { answerDialog, expect, hydrated, test } from "./fixtures";

test.describe("Likes and the top list", () => {
  test("likes a video, finds it under Liked and on the start page, and takes the like back", async ({
                                                                                                      page,
                                                                                                      loginAs,
                                                                                                      mock,
                                                                                                    }) => {
    await loginAs("viewer");
    await page.goto(`/videos/${uuidOf(1)}`);
    await page.getByRole("button", { name: "Gilla", exact: true }).click();
    await expect(page.getByRole("button", { name: "Gillad" })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => (await mock.state()).liked).toEqual([uuidOf(1)]);

    await page.getByRole("link", { name: "Gillat", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Gillat", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Nobel/ })).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Gillat av dig" }).getByRole("link", { name: /Nobel/ })).toBeVisible();

    await page.goto(`/videos/${uuidOf(1)}`);
    await page.getByRole("button", { name: "Gillad" }).click();
    await expect.poll(async () => (await mock.state()).liked).toEqual([]);
  });

  test("ranks the videos by everyone's ratings and likes", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Topplistan: högst betyg" }).getByRole("link", { name: /Nobel/ })).toBeVisible();
    await page.getByRole("link", { name: "Hela topplistan" }).click();

    await expect(page.getByRole("heading", { name: "Topplistan", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Nobel/ })).toBeVisible();
    await page.getByRole("link", { name: "Mest gillat" }).click();
    await expect(page.getByRole("link", { name: /Extranumret/ })).toBeVisible();
    await expect(page.getByText("2 gillar")).toBeVisible();
    await page.getByRole("link", { name: "Mest sett" }).click();
    await expect(page.getByText("Inget har fått betyg, gillats eller setts här ännu.")).toBeVisible();
  });

  test("browses by decade, sorts the videos and shows only the liked or unwatched ones", async ({
                                                                                                  page,
                                                                                                  loginAs,
                                                                                                  mock,
                                                                                                }) => {
    await loginAs("viewer");
    await page.goto("/");
    await page.getByRole("link", { name: "1970-talet" }).click();
    await expect(page).toHaveURL(/\/videos\?decade=1970/);
    await expect(page.getByRole("link", { name: "1975", exact: true })).toBeVisible();

    await page.getByRole("combobox", { name: "Ordning" }).selectOption("TITLE");
    await expect(page).toHaveURL(/sort=TITLE/);
    await expect(page.getByRole("main").getByRole("listitem").first()).toContainText("Extranumret");

    await page.getByRole("link", { name: "Gillade" }).click();
    await expect(page.getByText("Inga filmer matchar.")).toBeVisible();
    await page.getByRole("link", { name: "Gillade" }).click();

    await page.goto(`/videos/${uuidOf(1)}`);
    await page.getByRole("button", { name: "Markera som sedd" }).click();
    await expect.poll(async () => (await mock.state()).finished).toEqual([uuidOf(1)]);
    await page.goto("/videos?unwatched=1");
    await expect(page.getByRole("link", { name: /Extranumret/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Nobel/ })).toHaveCount(0);
  });
});

test.describe("Playlists", () => {
  test("adds a video and a chapter to a new playlist and plays it", async ({ page, loginAs, mock }) => {
    await loginAs("viewer");
    await page.goto(`/videos/${uuidOf(1)}`);
    await hydrated(page, "video");

    await page.getByRole("button", { name: "Lägg till i spellista" }).click();
    await page.getByRole("menuitem", { name: "Ny spellista…" }).click();
    await page.getByRole("dialog").getByLabel("Namn").fill("Bästa numren");
    await answerDialog(page, "Skapa");
    await expect(page.getByText("Filmen är tillagd i spellistan.")).toBeVisible();

    await page.getByRole("button", { name: "Lägg till Kärleksduetten i en spellista" }).click();
    await page.getByRole("menuitem", { name: "Bästa numren" }).click();
    await expect(page.getByText("Klippet är tillagt i spellistan.")).toBeVisible();
    await expect.poll(async () => (await mock.state()).playlists.find((playlist: {
      name: string
    }) => playlist.name === "Bästa numren")?.items.length).toBe(2);

    await page.getByRole("link", { name: "Spellistor" }).click();
    await expect(page.getByRole("region", { name: "Dina spellistor" }).getByRole("link", { name: /Bästa numren/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Andras offentliga spellistor" }).getByRole("link", { name: /Annas favoriter/ })).toBeVisible();
    await page.getByRole("link", { name: /Bästa numren/ }).click();

    await expect(page.getByRole("heading", { name: "Bästa numren", level: 1 })).toBeVisible();
    await expect(page.getByText("Klipp ur Nobel · 1975 · 0:20")).toBeVisible();

    // The clip first, then play the list from it
    await page.getByRole("button", { name: "Flytta Kärleksduetten upp" }).click();
    await expect(page.getByRole("main").getByRole("listitem").first()).toContainText("Kärleksduetten");
    await page.getByRole("button", { name: "Spela", exact: true }).click();
    await expect(page).toHaveURL(/playlist=.*&item=.*&autoplay=1/);
    const playing = page.getByRole("region", { name: /Bästa numren/ });

    await expect(playing.getByText("1 av 2")).toBeVisible();
    await expect(playing.getByRole("listitem").first()).toHaveAttribute("aria-current", "true");
    await expect(page.getByRole("button", { name: "Nästa: Nobel" })).toBeVisible();
  });

  test("renames a playlist, makes it public and deletes it", async ({ page, loginAs, mock }) => {
    await loginAs("viewer");
    await page.goto("/playlists");
    await page.getByRole("button", { name: "Ny spellista" }).click();
    await page.getByRole("dialog").getByLabel("Namn").fill("Tillfällig");
    await answerDialog(page, "Skapa");
    await expect(page.getByRole("heading", { name: "Tillfällig", level: 1 })).toBeVisible();
    await expect(page.getByText("Spellistan är tom.")).toBeVisible();

    await page.getByRole("button", { name: "Ändra" }).click();
    await page.getByLabel("Namn").fill("Omdöpt");
    await page.getByRole("switch", { name: /Offentlig/ }).click();
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByRole("heading", { name: "Omdöpt", level: 1 })).toBeVisible();
    await expect.poll(async () => (await mock.state()).playlists.find((playlist: {
      name: string
    }) => playlist.name === "Omdöpt")?.isPublic).toBe(true);

    await page.getByRole("button", { name: "Ta bort spellistan" }).click();
    await answerDialog(page, "Ta bort spellistan");
    await expect(page).toHaveURL(/\/playlists$/);
    await expect(page.getByRole("link", { name: /Omdöpt/ })).toHaveCount(0);
  });

  test("plays others' public playlists but does not change them", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await page.goto(`/playlists/${uuidOf(600)}`);
    await expect(page.getByText(/av Anna Annan/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Spela", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ändra" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Ta bort/ })).toHaveCount(0);
  });
});

test.describe("The player", () => {
  test("has controls in the page's language", async ({ page, loginAs }) => {
    await loginAs("viewer");
    await page.goto(`/videos/${uuidOf(1)}`);
    await expect(page.getByRole("button", { name: "Helskärm" })).toBeVisible();
    await expect(page.getByRole("slider", { name: "Volym" })).toBeAttached();
    await expect(page.locator("video")).not.toHaveAttribute("controls");

    await page.getByRole("button", { name: "Byt språk" }).click();
    await page.getByRole("menuitem", { name: "English" }).click();
    await page.goto(`/videos/${uuidOf(1)}`);
    await expect(page.getByRole("button", { name: "Full screen" })).toBeVisible();
  });

  test("never makes the page scroll, not even with the timeline's hover box at either end", async ({
                                                                                                     page,
                                                                                                     loginAs,
                                                                                                   }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs("viewer");
    await page.goto(`/videos/${uuidOf(1)}`);
    await hydrated(page, "video");

    const timeline = page.getByRole("slider", { name: "Tidslinje" });
    const box = (await timeline.boundingBox())!;
    const size = () => page.evaluate(() => ({
      width: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth,
      height: document.documentElement.scrollHeight,
    }));
    const before = await size();

    expect(before.width).toBeLessThanOrEqual(before.clientWidth);
    for (const x of [box.x + 1, box.x + box.width / 2, box.x + box.width - 1]) {
      await page.mouse.move(x, box.y + box.height / 2);
      await page.waitForTimeout(100);
      // Neither wider nor taller than without the hover box
      expect(await size()).toEqual(before);
    }
  });
});
