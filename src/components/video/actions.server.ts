"use server";

import {revalidatePath} from "next/cache";
import {
    playlistAddItem,
    playlistCreate,
    playlistDelete,
    playlistRemoveItem,
    playlistReorder,
    playlistUpdate,
    progressClear,
    progressSave,
    videoLike,
    videoMarkWatched,
    videoRate,
    watchListAdd,
    watchListRemove
} from "@/lib/video/video.server";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
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

/**
 * Revalidating a path here also makes Next fetch every page visited before again when it is next shown, which
 * `useServerState` needs. Never revalidate the video page being watched for a watch list or a rating: each render signs
 * a new playback address, and the player would start over.
 */
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

/**
 * Likes a video or takes the like back. False when it could not be saved. Like the watch list, never revalidates the
 * video page being watched.
 */
export async function likeVideoAction(videoId: string, liked: boolean): Promise<boolean> {
    if (!ID.test(videoId)) {
        return false;
    }
    return withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            await videoLike(videoId, liked);
            revalidatePath("/liked");
            return true;
        } catch {
            return false;
        }
    });
}

async function playlistChange<T>(work: () => Promise<T>, playlistId?: string): Promise<ActionResult<T>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const result = await work();

        revalidatePath("/playlists");
        if (playlistId) {
            revalidatePath(`/playlists/${playlistId}`);
        }
        return result;
    }));
}

const invalid = {ok: false, code: "BAD_REQUEST", message: "?"} as const;

/**
 * Creates a playlist, and with a video adds it (or, with a start, its chapter) as the first item. Gives the new id.
 */
export async function createPlaylistAction(name: string, item?: { videoId: string; startSeconds: number | null }): Promise<ActionResult<string | null>> {
    if (item && !ID.test(item.videoId)) {
        return invalid;
    }
    return playlistChange(async () => {
        const created = await playlistCreate({name, isPublic: false});

        if (created && item) {
            await playlistAddItem(created.id, item.videoId, item.startSeconds);
        }
        return created?.id ?? null;
    });
}

export async function updatePlaylistAction(id: string, input: { name: string; description: string | null; isPublic: boolean }): Promise<ActionResult<unknown>> {
    return ID.test(id) ? playlistChange(() => playlistUpdate(id, input), id) : invalid;
}

export async function deletePlaylistAction(id: string): Promise<ActionResult<unknown>> {
    return ID.test(id) ? playlistChange(() => playlistDelete(id)) : invalid;
}

/**
 * Adds a whole video, or with a start the chapter that starts there, last in a playlist.
 */
export async function addToPlaylistAction(playlistId: string, videoId: string, startSeconds: number | null): Promise<ActionResult<unknown>> {
    if (!ID.test(playlistId) || !ID.test(videoId) || (startSeconds !== null && !Number.isInteger(startSeconds))) {
        return invalid;
    }
    return playlistChange(() => playlistAddItem(playlistId, videoId, startSeconds), playlistId);
}

export async function removeFromPlaylistAction(playlistId: string, itemId: string): Promise<ActionResult<unknown>> {
    return ID.test(playlistId) && ID.test(itemId) ? playlistChange(() => playlistRemoveItem(playlistId, itemId), playlistId) : invalid;
}

export async function reorderPlaylistAction(playlistId: string, itemIds: string[]): Promise<ActionResult<unknown>> {
    return ID.test(playlistId) && itemIds.every(id => ID.test(id)) ? playlistChange(() => playlistReorder(playlistId, itemIds), playlistId) : invalid;
}
