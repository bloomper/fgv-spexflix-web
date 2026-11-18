import { expect, test } from "./fixtures";

test.describe("The application shell", () => {
  test("shows watching, editing and administration to an admin", async ({ page, loginAs }) => {
    await loginAs("admin");

    const sidebar = page.locator("[data-slot=\"sidebar\"]:visible");
    await expect(sidebar.getByRole("link", { name: "Hem" })).toHaveAttribute("href", "/");
    await expect(sidebar.getByRole("link", { name: "Filmer" }).first()).toHaveAttribute("href", "/videos");
    await expect(sidebar.getByRole("link", { name: "Se senare" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Redigera" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Administration" })).toBeVisible();
  });

  test("hides editing and administration from a viewer", async ({ page, loginAs }) => {
    await loginAs("viewer");

    const sidebar = page.locator("[data-slot=\"sidebar\"]:visible");
    await expect(sidebar.getByRole("link", { name: "Redigera" })).toHaveCount(0);
    await expect(sidebar.getByRole("link", { name: "Administration" })).toHaveCount(0);
    await page.goto("/admin/storage");
    await expect(page.getByRole("heading", { name: "Du har inte behörighet" })).toBeVisible();
  });

  test("greets the user and lists the published videos only", async ({ page, loginAs }) => {
    await loginAs("viewer");

    // The newest show is featured at the top, over the rows
    await expect(page.getByRole("heading", { level: 1, name: "Nobel" })).toBeVisible();
    await expect(page.getByText("Hej Tina Tittare!")).toBeVisible();
    await expect(page.getByRole("link", { name: /Nobel/ }).first()).toBeVisible();
    await expect(page.getByText("Opublicerad film")).toHaveCount(0);
  });

  test("shows one row per kind and decade and per collection, and no empty rows", async ({ page, loginAs }) => {
    await loginAs("viewer");

    await expect(page.getByRole("region", { name: "Föreställning" }).getByRole("link", { name: /Nobel/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Nummer" }).getByRole("link", { name: /Extranumret/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "1970-talet" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Nobel genom åren" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Trailer" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Se senare" })).toHaveCount(0);

    // Saving from a card fills "Se senare"
    const numbers = page.getByRole("region", { name: "Nummer" });

    // The card shows its buttons when it grows on hover
    await numbers.getByRole("link", { name: /Extranumret/ }).hover();
    await numbers.getByRole("button", { name: "Se senare" }).click();
    await expect(numbers.getByRole("button", { name: "Se senare" })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.getByRole("region", { name: "Se senare" }).getByRole("link", { name: /Extranumret/ })).toBeVisible();
  });

  test("browses from the header and opens a spex's title page", async ({ page, loginAs }) => {
    await loginAs("viewer");

    await page.getByRole("button", { name: "Bläddra" }).click();
    await page.getByRole("menuitem", { name: "Alla spex" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Alla spex" })).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: /Nobel/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Nobel" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Föreställning" }).getByRole("link", { name: /Nobel/ })).toBeVisible();
    await expect(page.getByRole("list", { name: "Nummer" }).getByRole("link", { name: /Extranumret/ })).toBeVisible();
    await page.getByRole("button", { name: "Spela från början" }).click();
    await expect(page).toHaveURL(/\/videos\/.*autoplay=1/);
  });
});
