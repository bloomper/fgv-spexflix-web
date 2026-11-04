import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoForm } from "@/components/video/video-form.client";

const searchSpexAction = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@/app/(app)/manage/actions.server", () => ({ searchSpexAction }));
vi.mock("sonner", () => ({ toast }));

const KINDS = [
  { id: "k-show", nameSv: "Föreställning", nameEn: "Show" },
  { id: "k-number", nameSv: "Nummer", nameEn: "Number" },
  { id: "k-trailer", nameSv: "Trailer", nameEn: "Trailer" },
];
const NOBEL = { id: "6", title: "Nobel", year: 1975, revival: false, parentId: null, categoryName: "Chalmersspexet" };
const NOBEL_REVIVAL = {
  id: "7",
  title: "Nobel",
  year: 1992,
  revival: true,
  parentId: "6",
  categoryName: "Chalmersspexet",
};
const CLEOPATRA = {
  id: "8",
  title: "Cleopatra",
  year: 2024,
  revival: false,
  parentId: null,
  categoryName: "Chalmersspexet",
};

describe("VideoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchSpexAction.mockResolvedValue({ ok: true, data: [NOBEL, NOBEL_REVIVAL] });
  });

  it("needs a spex, or no spex marked and a title, before it can be saved, and sends empty fields as null", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<VideoForm kinds={KINDS} submitLabel="Spara" onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: "Spara" })).toBeDisabled();

    await userEvent.type(screen.getByLabelText("title"), "  Blandade visor ");
    expect(screen.getByRole("button", { name: "Spara" })).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox", { name: "none" }));
    expect(screen.getByLabelText("title")).toBeRequired();
    await userEvent.selectOptions(screen.getByLabelText("kind"), "Nummer");
    await userEvent.click(screen.getByRole("button", { name: "Spara" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      spexIds: [],
      title: "Blandade visor",
      year: null,
      kindId: "k-number",
      performance: null,
      performanceDate: null,
      description: null,
    }));
  });

  it("searches Spexregister after two letters and picks a spex", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<VideoForm kinds={KINDS} submitLabel="Spara" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("search"), "N");
    await new Promise(resolve => setTimeout(resolve, 350));
    expect(searchSpexAction).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("search"), "o");
    const result = await screen.findByRole("button", { name: /Nobel 1992/ });

    expect(searchSpexAction).toHaveBeenCalledWith("No");
    expect(result).toHaveTextContent("(revival)");
    expect(result).toHaveTextContent("Chalmersspexet");

    await userEvent.click(result);
    expect(screen.getByLabelText("title")).toHaveAttribute("placeholder", "Nobel");
    expect(screen.getByLabelText("year")).toHaveAttribute("placeholder", "1992");

    await userEvent.type(screen.getByLabelText("year"), "1993");
    await userEvent.type(screen.getByLabelText("performance"), " Premiären ");
    await userEvent.type(screen.getByLabelText("performanceDate"), "1993-02-12");
    await userEvent.type(screen.getByLabelText("description"), "Inspelad live");
    await userEvent.click(screen.getByRole("button", { name: "Spara" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      spexIds: ["7"],
      title: null,
      year: 1993,
      kindId: "k-show",
      performance: "Premiären",
      performanceDate: "1993-02-12",
      description: "Inspelad live",
    }));
  });

  it("tells when the search fails", async () => {
    searchSpexAction.mockResolvedValue({ ok: false, code: "UNAVAILABLE", message: "Spexregister svarar inte" });

    render(<VideoForm kinds={KINDS} submitLabel="Spara" onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("search"), "Ali");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Spexregister svarar inte"));
  });

  it("starts from a video's values, adds more spex and makes another the main one", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    searchSpexAction.mockResolvedValue({ ok: true, data: [CLEOPATRA] });
    render(<VideoForm kinds={KINDS} submitLabel="Spara" onSubmit={onSubmit} initial={{
      spex: [NOBEL_REVIVAL],
      title: "Nobel – live",
      year: 1992,
      kind: { id: "k-trailer" },
      performance: "Gala",
      performanceDate: "1992-11-01",
      description: "Text",
    }} />);

    expect(screen.getByLabelText("title")).toHaveValue("Nobel – live");
    expect(screen.getByLabelText("year")).toHaveValue("1992");
    expect(screen.getByLabelText("kind")).toHaveValue("k-trailer");
    expect(screen.getByLabelText("performance")).toHaveValue("Gala");
    expect(screen.getByLabelText("performanceDate")).toHaveValue("1992-11-01");
    expect(screen.getByRole("list", { name: "picked" })).toHaveTextContent(/Nobel 1992/);

    await userEvent.type(screen.getByLabelText("searchMore"), "Cleo");
    await userEvent.click(await screen.findByRole("button", { name: /Cleopatra 2024/ }));
    const picked = screen.getByRole("list", { name: "picked" });

    await userEvent.click(within(picked).getByRole("button", { name: /makeMainOf.*Cleopatra 2024/ }));
    expect(within(picked).getAllByRole("listitem")[0]).toHaveTextContent(/Cleopatra 2024/);
    await userEvent.click(screen.getByRole("button", { name: "Spara" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ spexIds: ["8", "7"] })));
  });

  it("starts with no spex marked for a video without spex", () => {
    render(<VideoForm kinds={KINDS} submitLabel="Spara" onSubmit={vi.fn()}
                      initial={{ spex: [], title: "Jubileet", kind: { id: "k-show" } }} />);

    expect(screen.getByRole("checkbox", { name: "none" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Spara" })).toBeEnabled();
  });
});
