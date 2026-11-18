import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { HeaderSearch } from "@/components/header-search.client";
import { BrowseMenu } from "@/components/browse-menu.client";
import { SiteHeader } from "@/components/site-header.client";

const push = vi.hoisted(() => vi.fn());
const query = vi.hoisted(() => ({ value: "" }));
const actions = vi.hoisted(() => ({ searchPreviewAction: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(query.value),
}));
vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...rest }: { children?: ReactNode; href: string; onClick?: () => void }) =>
    <a href={href} onClick={onClick} {...rest}>{children}</a>,
}));
vi.mock("@/components/video/actions.server", () => actions);
vi.mock("@/components/ui/sidebar", () => ({ useSidebar: () => ({ toggleSidebar: vi.fn(), openMobile: false }) }));
vi.mock("@/components/app-switcher.client", () => ({ AppSwitcher: ({ title }: { title: string }) => <span>{title}</span> }));
vi.mock("@/components/mode-toggle.client", () => ({ ModeToggle: () => null }));
vi.mock("@/components/language-toggle.client", () => ({ LanguageToggle: () => null }));

const BROWSE = {
  videoKinds: [{ id: "k1", nameSv: "Föreställning", nameEn: "Show" }, { id: "k2", nameSv: "Nummer", nameEn: "Number" }],
  categories: [{ id: "c1", name: "Chalmersspexet" }],
  years: [2026, 1975, 1979],
};

describe("HeaderSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.value = "";
    actions.searchPreviewAction.mockResolvedValue([{ id: "v1", title: "Nobel", year: 1975 }, { id: "v2", title: "Nobelfesten", year: null }]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const type = async (text: string) => {
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: text } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
  };

  it("shows the first videos found as the viewer types, and every result on Enter", async () => {
    vi.useFakeTimers();
    render(<HeaderSearch />);
    fireEvent.focus(screen.getByRole("searchbox"));

    await type("n");
    expect(actions.searchPreviewAction).not.toHaveBeenCalled();

    await type("nob");
    expect(actions.searchPreviewAction).toHaveBeenCalledWith("nob");

    const results = screen.getByRole("region", { name: "quickResults" });

    expect(results).toHaveTextContent("Nobel1975");
    expect(screen.getByRole("link", { name: /Nobelfesten/ })).toHaveAttribute("href", "/videos/v2");
    expect(screen.getByRole("link", { name: /allResults/ })).toHaveAttribute("href", "/search?q=nob");

    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(screen.queryByRole("region")).not.toBeInTheDocument();

    fireEvent.submit(screen.getByRole("search"));
    expect(push).toHaveBeenCalledWith("/search?q=nob");
  });

  it("says when nothing is found, and opens the search page from an empty field", async () => {
    vi.useFakeTimers();
    actions.searchPreviewAction.mockResolvedValue([]);
    render(<HeaderSearch />);
    fireEvent.focus(screen.getByRole("searchbox"));
    await type("xyz");
    expect(screen.getByText("none")).toBeInTheDocument();

    fireEvent.blur(screen.getByRole("searchbox"));
    expect(screen.queryByText("none")).not.toBeInTheDocument();

    await type("");
    fireEvent.submit(screen.getByRole("search"));
    expect(push).toHaveBeenCalledWith("/search");
  });

  it("follows a search made on the search page", () => {
    query.value = "q=caesar";
    render(<HeaderSearch />);
    expect(screen.getByRole("searchbox")).toHaveValue("caesar");
  });
});

describe("BrowseMenu", () => {
  it("browses by kind, decade, spex category and every spex", async () => {
    render(<BrowseMenu browse={BROWSE} />);
    fireEvent.click(screen.getByRole("button", { name: /browse/ }));

    expect(await screen.findByRole("menuitem", { name: "Föreställning" })).toHaveAttribute("href", "/videos?kind=k1");
    expect(screen.getByRole("menuitem", { name: /"decade":2020/ })).toHaveAttribute("href", "/videos?decade=2020");
    expect(screen.getAllByRole("menuitem", { name: /"decade":/ })).toHaveLength(2);
    expect(screen.getByRole("menuitem", { name: "Chalmersspexet" })).toHaveAttribute("href", "/videos?category=c1");
    expect(screen.getByRole("menuitem", { name: "allSpex" })).toHaveAttribute("href", "/spex");
  });
});

describe("SiteHeader", () => {
  it("turns opaque once the page scrolls, and offers browsing", () => {
    const { container } = render(<SiteHeader applications={[]} browse={BROWSE} />);
    const header = container.querySelector("header") as HTMLElement;

    expect(header).not.toHaveAttribute("data-scrolled");
    expect(screen.getByRole("button", { name: /browse/ })).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-scrolled", "true");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).not.toHaveAttribute("data-scrolled");
  });
});
