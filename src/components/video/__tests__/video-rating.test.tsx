import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {VideoRating} from "@/components/video/video-rating.client";

const rateVideoAction = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({error: vi.fn()}));

vi.mock("@/components/video/actions.server", () => ({rateVideoAction}));
vi.mock("sonner", () => ({toast}));

describe("VideoRating", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        rateVideoAction.mockResolvedValue(true);
    });

    it("rates the video and shows everyone's average", async () => {
        render(<VideoRating videoId="v-1" rating={0} averageRating={3.5} ratingCount={2}/>);

        expect(screen.getByText(/average:.*"average":"3,5".*"count":2/)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("radio", {name: /"count":4/}));

        expect(rateVideoAction).toHaveBeenCalledWith("v-1", 4);
        expect(screen.getByRole("radio", {name: /"count":4/})).toHaveAttribute("aria-checked", "true");
    });

    it("takes the rating back when it cannot be saved", async () => {
        rateVideoAction.mockResolvedValue(false);
        render(<VideoRating videoId="v-1" rating={2} ratingCount={0}/>);

        expect(screen.getByText("noRatings")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("radio", {name: /"count":5/}));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("rateFailed"));
        expect(screen.getByRole("radio", {name: /"count":2/})).toHaveAttribute("aria-checked", "true");
    });
});
