import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {Pencil} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {PosterImage} from "@/components/video/poster-image.client";
import {getMe, getPlayback, getVideo, spexifyUrl} from "@/lib/video/video.server";
import {kindName} from "@/utils/format";
import {formatDuration, parsePosition} from "@/utils/duration";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {isEditor} from "@/utils/auth";
import {Watch} from "./watch.client";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VideoPage({params, searchParams}: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
    return withPolicyPage(Policies.app.requireAccess, async (authz) => {
        const {id} = await params;

        if (!ID.test(id)) {
            notFound();
        }

        const t = await getTranslations("Watch");
        const tv = await getTranslations("Video");
        const locale = await getLocale();
        const [video, me] = await Promise.all([getVideo(id), getMe()]);

        if (!video) {
            notFound();
        }

        const playback = video.status === "READY" ? await getPlayback(id) : null;
        const requested = parsePosition((await searchParams).t);
        const startAt = requested ?? (video.finished ? 0 : video.progressSeconds ?? 0);
        const register = process.env.SPEXREGISTER_WEB_URL?.replace(/\/$/, "");

        return (
            <div className="space-y-6 p-4 sm:p-6">
                {playback ? (
                    <Watch videoId={video.id} playback={playback} chapters={video.chapters} durationSeconds={(video.durationMs ?? 0) / 1000}
                           startAt={startAt} inWatchList={video.inWatchList} spexifyUrl={me?.me.spexifyUser ? spexifyUrl() : null}
                           recordProgress={video.published}/>
                ) : (
                    <div className="relative">
                        <PosterImage videoId={video.id} title={video.title} className="w-full max-w-3xl rounded-lg opacity-60"/>
                        <p className="mt-2 text-muted-foreground">{video.status === "FAILED" ? t("failed") : t("processing")}</p>
                    </div>
                )}
                <div className="max-w-3xl space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{kindName(video.kind, locale)}</Badge>
                        {video.spex?.revival && <Badge variant="secondary">{tv("revival")}</Badge>}
                        {!video.published && <Badge variant="outline">{tv("unpublished")}</Badge>}
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{video.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {[video.year, video.spex?.categoryName, video.performance, video.performanceDate,
                            video.durationMs ? formatDuration(video.durationMs / 1000) : null].filter(Boolean).join(" · ")}
                    </p>
                    {video.description && <p className="whitespace-pre-line text-sm">{video.description}</p>}
                    <div className="flex flex-wrap gap-3 text-sm">
                        {video.spex && <Link href={`/videos?category=${video.spex.categoryId ?? ""}&year=${video.year ?? ""}`}
                                             className="text-primary hover:underline">{t("moreFromSpex")}</Link>}
                        {video.spex && register && (
                            <a href={`${register}/spex?open=${video.spex.id}`} target="_blank" rel="noopener noreferrer"
                               className="text-primary hover:underline">{t("inSpexregister")}</a>
                        )}
                    </div>
                    {isEditor(authz.roles) && (
                        <Button variant="ghost" nativeButton={false} render={<Link href={`/manage/videos/${video.id}`}/>}>
                            <Pencil/>{t("edit")}
                        </Button>
                    )}
                </div>
            </div>
        );
    });
}
