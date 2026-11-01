import {expect, test} from "./fixtures";

test.describe("The application shell", () => {
    test("shows watching, editing and administration to an admin", async ({page, loginAs}) => {
        await loginAs("admin");

        const sidebar = page.locator('[data-slot="sidebar"]:visible');
        await expect(sidebar.getByRole("link", {name: "Hem"})).toHaveAttribute("href", "/");
        await expect(sidebar.getByRole("link", {name: "Filmer"}).first()).toHaveAttribute("href", "/videos");
        await expect(sidebar.getByRole("link", {name: "Min lista"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Redigera"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Administration"})).toBeVisible();
    });

    test("hides editing and administration from a viewer", async ({page, loginAs}) => {
        await loginAs("viewer");

        const sidebar = page.locator('[data-slot="sidebar"]:visible');
        await expect(sidebar.getByRole("link", {name: "Redigera"})).toHaveCount(0);
        await expect(sidebar.getByRole("link", {name: "Administration"})).toHaveCount(0);
        await page.goto("/admin/storage");
        await expect(page.getByRole("heading", {name: "Du har inte behörighet"})).toBeVisible();
    });

    test("greets the user and lists the published videos only", async ({page, loginAs}) => {
        await loginAs("viewer");

        await expect(page.getByRole("heading", {level: 1, name: "Hej Tina Tittare!"})).toBeVisible();
        await expect(page.getByRole("link", {name: /Nobel/}).first()).toBeVisible();
        await expect(page.getByText("Opublicerad film")).toHaveCount(0);
    });
});
