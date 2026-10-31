"use server";

import {revalidatePath} from "next/cache";
import {progressSave, watchListAdd, watchListRemove} from "@/lib/video/video.server";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

const ID = /^\d{1,19}$/;

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
