"use server";

import {revalidatePath} from "next/cache";
import {progressClear, progressSave, videoMarkWatched, videoRate, watchListAdd, watchListRemove} from "@/lib/video/video.server";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Saves where the user is in a video. Failures are ignored: watching does not depend on it.
 */
export async function saveProgressAction(videoId: string, positionSeconds: number): Promise<void> {
    if (!ID.test(videoId) || !Number.isFinite(positionSeconds)) {
        return;
    }
    await withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            await progressSave(videoId, Math.max(0, Math.round(positionSeconds)));
        } catch {
            // the server is unavailable; the next save catches up
        }
    });
}

/**
 * Marks a video as watched, or forgets where the user is in it (unwatched, and off "continue watching"). False when it
 * could not be saved.
 */
export async function setWatchedAction(videoId: string, watched: boolean): Promise<boolean> {
    if (!ID.test(videoId)) {
        return false;
    }
    return withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            await (watched ? videoMarkWatched(videoId) : progressClear(videoId));
            revalidatePath("/");
            revalidatePath(`/videos/${videoId}`);
            return true;
        } catch {
            return false;
        }
    });
}

export async function watchListAction(videoId: string, add: boolean): Promise<boolean> {
    if (!ID.test(videoId)) {
        return false;
    }
    return withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            await (add ? watchListAdd(videoId) : watchListRemove(videoId));
            revalidatePath("/watchlist");
            return true;
        } catch {
            return false;
        }
    });
}

/**
 * Rates a video from 1 to 5; 0 removes the rating. False when it could not be saved.
 */
export async function rateVideoAction(videoId: string, rating: number): Promise<boolean> {
    if (!ID.test(videoId) || !Number.isInteger(rating) || rating < 0 || rating > 5) {
        return false;
    }
    return withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            await videoRate(videoId, rating);
            revalidatePath("/");
            return true;
        } catch {
            return false;
        }
    });
}
