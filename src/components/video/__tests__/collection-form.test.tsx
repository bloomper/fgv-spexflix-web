import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {CollectionForm} from "@/components/video/collection-form.client";

const VIDEOS = [
    {id: "v1", title: "Nobel", year: 1975, published: true},
    {id: "v2", title: "Extranumret", year: null, published: false},
    {id: "v3", title: "Cleopatra", year: 2024, published: true},
];

describe("CollectionForm", () => {
    it("needs a title, adds videos in order, and sends an empty description as null", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);

        render(<CollectionForm videos={VIDEOS} submitLabel="Skapa" onSubmit={onSubmit}/>);
        expect(screen.getByText("noVideos")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Skapa"})).toBeDisabled();
        expect(screen.getByRole("button", {name: "add"})).toBeDisabled();

        await userEvent.type(screen.getByLabelText("titleLabel"), "  Bästa numren ");
        await userEvent.selectOptions(screen.getByLabelText("addVideo"), "Extranumret");
        await userEvent.click(screen.getByRole("button", {name: "add"}));
        await userEvent.selectOptions(screen.getByLabelText("addVideo"), "Nobel, 1975");
        await userEvent.click(screen.getByRole("button", {name: "add"}));

        const items = within(screen.getByRole("list")).getAllByRole("listitem");

        expect(items[0]).toHaveTextContent("Extranumret · unpublished");
        expect(items[1]).toHaveTextContent("Nobel, 1975");
        expect(screen.queryByRole("option", {name: "Nobel, 1975"})).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Skapa"}));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({title: "Bästa numren", description: null, videoIds: ["v2", "v1"]}));
    });

    it("starts from a collection, and moves and removes its videos", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);

        render(<CollectionForm videos={VIDEOS} submitLabel="Spara" onSubmit={onSubmit}
                               initial={{title: "Nobel genom åren", description: "Alla", videoIds: ["v1", "v3", "gone"]}}/>);

        expect(screen.getByRole("button", {name: /moveUp.*Nobel, 1975/})).toBeDisabled();
        expect(screen.getByRole("button", {name: /moveDown.*\?/})).toBeDisabled();

        await userEvent.click(screen.getByRole("button", {name: /moveDown.*Nobel, 1975/}));
        await userEvent.click(screen.getByRole("button", {name: /moveUp.*\?/}));
        await userEvent.click(screen.getByRole("button", {name: /remove.*Cleopatra, 2024/}));
        await userEvent.click(screen.getByRole("button", {name: "Spara"}));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({title: "Nobel genom åren", description: "Alla", videoIds: ["gone", "v1"]}));
    });
});
