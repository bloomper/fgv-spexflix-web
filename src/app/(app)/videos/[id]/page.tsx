import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {Pencil} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {PosterImage} from "@/components/video/poster-image.client";
import {getMe, getPlayback, getPlaylist, getPlaylists, getVideo, spexifyUrl} from "@/lib/video/video.server";
import {kindName} from "@/utils/format";
import {VideoRating} from "@/components/video/video-rating.client";
import {formatDuration, parsePosition} from "@/utils/duration";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {isEditor} from "@/utils/auth";
import {CollectionLinks, Watch} from "./watch.client";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VideoPage({params, searchParams}: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string; autoplay?: string; playlist?: string; item?: string }> }) {
    return withPolicyPage(Policies.app.requireAccess, async (authz) => {
        const {id} = await params;

        if (!ID.test(id)) {
            notFound();
        }

        const t = await getTranslations("Watch");
        const tv = await getTranslations("Video");
        const locale = await getLocale();
        const query = await searchParams;
        const playlistId = query.playlist && ID.test(query.playlist) ? query.playlist : null;
        const [video, me, playlists, playlist] = await Promise.all([getVideo(id), getMe(), getPlaylists().catch(() => []),
            playlistId ? getPlaylist(playlistId).catch(() => null) : null]);

        if (!video) {
            notFound();
        }

        const playback = video.status === "READY" ? await getPlayback(id) : null;
        // Playing a playlist: the item asked for, else the first of this video; a clip starts and stops at its chapter
        const index = playlist ? Math.max(playlist.items.findIndex(item => item.id === query.item && item.video.id === video.id),
            playlist.items.findIndex(item => item.video.id === video.id)) : -1;
        const item = playlist && index >= 0 ? playlist.items[index] : null;
        const itemHref = (entry: { id: string; video: { id: string } }, autoplay: boolean) =>
            `/videos/${entry.video.id}?playlist=${playlist?.id}&item=${entry.id}${autoplay ? "&autoplay=1" : ""}`;
        const following = playlist && item ? playlist.items[index + 1] : undefined;
        const requested = parsePosition(query.t);
        const startAt = requested ?? item?.startSeconds ?? (item ? 0 : video.finished ? 0 : video.progressSeconds ?? 0);
        const next = item
            ? following ? {href: itemHref(following, true), title: following.title ?? following.video.title} : null
            : video.next ? {href: `/videos/${video.next.id}?autoplay=1`, title: video.next.title} : null;
        const register = process.env.SPEXREGISTER_WEB_URL?.replace(/\/$/, "");
        const main = video.spex[0];

        return (
            <div className="space-y-6 p-4 sm:p-6">
                {playback ? (
                    <Watch videoId={video.id} playback={playback} chapters={video.chapters} durationSeconds={(video.durationMs ?? 0) / 1000}
                           startAt={startAt} endAt={item?.startSeconds !== null && item?.startSeconds !== undefined ? item.endSeconds : null}
                           inWatchList={video.inWatchList} liked={video.liked} finished={video.finished}
                           spexifyUrl={me?.me.spexifyUser ? spexifyUrl() : null} recordProgress={video.published}
                           next={next} autoPlay={query.autoplay === "1"}
                           playlists={playlists.filter(candidate => candidate.owned).map(candidate => ({id: candidate.id, name: candidate.name}))}
                           playlist={playlist && item ? {
                               id: playlist.id, name: playlist.name, index,
                               items: playlist.items.map(entry => ({
                                   id: entry.id, href: itemHref(entry, false), title: entry.title ?? entry.video.title,
                                   videoTitle: entry.video.title, clip: entry.startSeconds !== null && entry.startSeconds !== undefined,
                                   durationSeconds: entry.durationSeconds,
                               })),
                           } : null}/>
                ) : (
                    <div className="relative">
                        <PosterImage videoId={video.id} title={video.title} className="w-full max-w-3xl rounded-lg opacity-60"/>
                        <p className="mt-2 text-muted-foreground">{video.status === "FAILED" ? t("failed") : t("processing")}</p>
                    </div>
                )}
                <div className="max-w-3xl space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{kindName(video.kind, locale)}</Badge>
                        {main?.revival && <Badge variant="secondary">{tv("revival")}</Badge>}
                        {!video.published && <Badge variant="outline">{tv("unpublished")}</Badge>}
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{video.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {[video.year, main?.categoryName, video.performance, video.performanceDate,
                            video.durationMs ? formatDuration(video.durationMs / 1000) : null].filter(Boolean).join(" · ")}
                    </p>
                    {video.published && (
                        <VideoRating videoId={video.id} rating={video.myRating} averageRating={video.averageRating} ratingCount={video.ratingCount}
                                     likeCount={video.likeCount}/>
                    )}
                    <CollectionLinks collections={video.collections}/>
                    {video.description && <p className="whitespace-pre-line text-sm">{video.description}</p>}
                    {video.spex.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {video.spex.map(spex => {
                                const name = [spex.title, spex.year].filter(Boolean).join(" ");

                                return (
                                    <li key={spex.id} className="flex flex-wrap gap-x-2">
                                        <Link href={`/videos?spex=${spex.familyId}`} className="text-primary hover:underline">
                                            {video.spex.length > 1 ? tv("allFromSpex", {title: spex.title ?? name}) : t("moreFromSpex")}
                                        </Link>
                                        {register && (
                                            <a href={`${register}/spex?open=${spex.id}`} target="_blank" rel="noopener noreferrer"
                                               className="text-muted-foreground hover:underline">
                                                {video.spex.length > 1 || spex.revival ? tv("inSpexregisterOf", {title: name}) : t("inSpexregister")}
                                            </a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
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
