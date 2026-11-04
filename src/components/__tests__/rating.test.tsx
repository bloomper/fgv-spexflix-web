import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AverageRating, RatingInput, RatingStars } from "@/components/rating.client";

describe("RatingInput", () => {
  it("rates by click, removes the rating when the same star is chosen again, and moves with the arrow keys", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<RatingInput value={0} onChange={onChange} label="Betyg" />);

    await userEvent.click(screen.getByRole("radio", { name: /"count":3/ }));
    expect(onChange).toHaveBeenLastCalledWith(3);

    rerender(<RatingInput value={3} onChange={onChange} label="Betyg" />);
    expect(screen.getByRole("radio", { name: /"count":3/ })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: /"count":3/ }));
    expect(onChange).toHaveBeenLastCalledWith(0);

    screen.getByRole("radio", { name: /"count":3/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(4);
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it("shows nothing for no rating", () => {
    const { container } = render(<RatingStars value={0} />);

    expect(container).toBeEmptyDOMElement();
    render(<RatingStars value={2} />);
    expect(screen.getByRole("img", { name: /rated:.*"count":2/ })).toBeInTheDocument();
  });
});

describe("AverageRating", () => {
  it("shows everyone's average with one decimal, as one star or five filled to the nearest half", () => {
    const { container, rerender } = render(<AverageRating average={3.74} count={4} />);

    expect(screen.getByRole("img", { name: /average:.*"average":"3,7".*"count":4/ })).toHaveTextContent("3,7(4)");
    expect(container.querySelectorAll("svg")).toHaveLength(1);

    rerender(<AverageRating average={3.74} count={4} stars />);
    // Three full stars, a half and an empty one: five outlines and four fillings
    expect(container.querySelectorAll("svg")).toHaveLength(9);
  });

  it("shows nothing when nobody has rated", () => {
    const { container } = render(<AverageRating average={null} count={0} />);

    expect(container).toBeEmptyDOMElement();
  });
});
