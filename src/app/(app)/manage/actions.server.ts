"use server";

import {revalidatePath} from "next/cache";
import {
    chaptersSet,
    getSpexifyTracks,
    searchSpex,
    subtitleRemove,
    videoCreate,
    videoDelete,
    videoPosterFrame,
    videoPublish,
    videoReprocess,
    videoRestore,
    videoSetFile,
    videoTrash,
    videoUpdate
} from "@/lib/video/video.server";
import {trashEmpty} from "@/lib/admin/admin.server";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import type {ChapterInput, VideoInput} from "@/gql/graphql";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UPLOAD = /^[0-9a-f-]{36}$/;

function requireId(id: string) {
    if (!ID.test(id)) {
        throw new Error("Invalid id");
    }
}

function changed(videoId?: string) {
    revalidatePath("/manage/videos");
    revalidatePath("/manage/trash");
    revalidatePath("/manage/queue");
    revalidatePath("/videos");
    if (videoId) {
        revalidatePath(`/manage/videos/${videoId}`);
        revalidatePath(`/videos/${videoId}`);
    }
}

const editor = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.editor.requireEditor, () => toActionResult(work));
const admin = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(work));

export async function searchSpexAction(q: string) {
    return editor(async () => searchSpex(q.slice(0, 100)));
}

export async function spexifyTracksAction(videoId: string) {
    requireId(videoId);
    return editor(async () => getSpexifyTracks(videoId));
}

export async function createVideoAction(input: VideoInput): Promise<ActionResult<string | undefined>> {
    return editor(async () => {
        const created = await videoCreate(input);

        changed();
        return created?.id;
    });
}

export async function updateVideoAction(id: string, input: VideoInput): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await videoUpdate(id, input);
        changed(id);
        return null;
    });
}

export async function setFileAction(id: string, uploadId: string): Promise<ActionResult<null>> {
    requireId(id);
    if (!UPLOAD.test(uploadId)) {
        throw new Error("Invalid upload");
    }
    return editor(async () => {
        await videoSetFile(id, uploadId);
        changed(id);
        return null;
    });
}

export async function publishVideoAction(id: string, published: boolean): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await videoPublish(id, published);
        changed(id);
        return null;
    });
}

export async function trashVideoAction(id: string, trashed: boolean): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await (trashed ? videoTrash(id) : videoRestore(id));
        changed(id);
        return null;
    });
}

export async function deleteVideoAction(id: string): Promise<ActionResult<null>> {
    requireId(id);
    return admin(async () => {
        await videoDelete(id);
        changed();
        return null;
    });
}

export async function emptyTrashAction(): Promise<ActionResult<null>> {
    return admin(async () => {
        await trashEmpty();
        changed();
        return null;
    });
}

export async function posterFrameAction(id: string, seconds: number): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await videoPosterFrame(id, Math.max(0, seconds));
        changed(id);
        return null;
    });
}

export async function reprocessAction(id: string): Promise<ActionResult<null>> {
    requireId(id);
    return admin(async () => {
        await videoReprocess(id);
        changed(id);
        return null;
    });
}

export async function setChaptersAction(id: string, chapters: ChapterInput[]): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await chaptersSet(id, chapters);
        changed(id);
        return null;
    });
}

export async function removeSubtitleAction(id: string, language: string): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await subtitleRemove(id, language);
        changed(id);
        return null;
    });
}
