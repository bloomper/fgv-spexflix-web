import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SortSelect } from "@/components/sort-select.client";

const push = vi.hoisted(() => vi.fn());
const search = vi.hoisted(() => ({ value: "category=c1&sort=TITLE" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/videos",
  useSearchParams: () => new URLSearchParams(search.value),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const OPTIONS = [
  { value: "YEAR_DESC", label: "Nyast först" },
  { value: "TITLE", label: "Titel" },
  { value: "RATING", label: "Högst betyg" },
];

describe("SortSelect", () => {
  it("keeps the other filters and leaves the default order out of the address", () => {
    const { rerender } = render(
      <SortSelect
        options={OPTIONS}
        value="TITLE"
        label="Ordning"
      />
    );
    const select = screen.getByRole("combobox", { name: "Ordning" });

    fireEvent.change(select, { target: { value: "RATING" } });
    expect(push).toHaveBeenLastCalledWith("/videos?category=c1&sort=RATING");
    fireEvent.change(select, { target: { value: "YEAR_DESC" } });
    expect(push).toHaveBeenLastCalledWith("/videos?category=c1");

    search.value = "sort=TITLE";
    rerender(
      <SortSelect
        options={OPTIONS}
        value="TITLE"
        label="Ordning"
      />
    );
    fireEvent.change(select, { target: { value: "YEAR_DESC" } });
    expect(push).toHaveBeenLastCalledWith("/videos");
  });
});
