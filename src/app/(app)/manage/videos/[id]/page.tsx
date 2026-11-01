import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {getPlayback, getVideo} from "@/lib/video/video.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {isAdmin} from "@/utils/auth";
import {VideoEditor} from "./video-editor.client";

const ID = /^\d{1,19}$/;

export default async function EditVideoPage({params}: { params: Promise<{ id: string }> }) {
    return withPolicyPage(Policies.editor.requireEditor, async (authz) => {
        const {id} = await params;

        if (!ID.test(id)) {
            notFound();
        }

        const t = await getTranslations("Manage");
        const video = await getVideo(id);

        if (!video || video.trashedAt) {
            notFound();
        }

        const playback = video.status === "READY" ? await getPlayback(id) : null;

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">{video.title}</h1>
                    <Link href={`/videos/${video.id}`} className="text-sm text-primary hover:underline">{t("viewAsViewer")}</Link>
                </div>
                <VideoEditor video={{...video, spex: video.spex ? {...video.spex, revival: video.spex.revival === true} : null}}
                             playback={playback} admin={isAdmin(authz.roles)}/>
            </div>
        );
    });
}
