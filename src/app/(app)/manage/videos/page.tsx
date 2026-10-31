import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {getVideos} from "@/lib/video/video.server";
import {formatDuration} from "@/utils/duration";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

export default async function ManageVideosPage() {
    return withPolicyPage(Policies.editor.requireEditor, async () => {
        const t = await getTranslations("Manage");
        const tv = await getTranslations("Video");
        const data = await getVideos({includeUnpublished: true});

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{t("videos")}</h1>
                    <Button nativeButton={false} render={<Link href="/manage/videos/new"/>}><Plus/>{t("newVideo")}</Button>
                </div>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("title")}</TableHead>
                                <TableHead>{t("year")}</TableHead>
                                <TableHead className="hidden sm:table-cell">{t("kind")}</TableHead>
                                <TableHead className="hidden sm:table-cell">{t("length")}</TableHead>
                                <TableHead>{t("status")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.videos.map(video => (
                                <TableRow key={video.id}>
                                    <TableCell><Link href={`/manage/videos/${video.id}`} className="font-medium hover:underline">{video.title}</Link></TableCell>
                                    <TableCell className="tabular-nums">{video.year}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{tv(`kind.${video.kind}`)}</TableCell>
                                    <TableCell className="hidden tabular-nums sm:table-cell">{video.durationMs ? formatDuration(video.durationMs / 1000) : ""}</TableCell>
                                    <TableCell className="space-x-1">
                                        {video.status !== "READY" && <Badge variant={video.status === "FAILED" ? "destructive" : "secondary"}>{tv(`status.${video.status}`)}</Badge>}
                                        {video.published ? <Badge variant="secondary">{t("published")}</Badge> : <Badge variant="outline">{t("unpublished")}</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    });
}
