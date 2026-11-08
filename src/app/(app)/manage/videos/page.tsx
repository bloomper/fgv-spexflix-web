import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVideos } from "@/lib/video/video.server";
import { kindName } from "@/utils/format";
import { formatDuration } from "@/utils/duration";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

export default async function ManageVideosPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const tv = await getTranslations("Video");
    const locale = await getLocale();
    const data = await getVideos({ includeUnpublished: true });

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{t("videos")}</h1>
          <Button nativeButton={false} render={<Link href="/manage/videos/new" />}><Plus />{t("newVideo")}</Button>
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
                  <TableCell className="whitespace-normal"><Link href={`/manage/videos/${video.id}`}
                                                                 className="font-medium hover:text-primary">{video.title}</Link></TableCell>
                  <TableCell className="tabular-nums">{video.year}</TableCell>
                  <TableCell className="hidden sm:table-cell">{kindName(video.kind, locale)}</TableCell>
                  <TableCell
                    className="hidden tabular-nums sm:table-cell">{video.durationMs ? formatDuration(video.durationMs / 1000) : ""}</TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap gap-1">
                      {video.status !== "READY" && <Badge
                        variant={video.status === "FAILED" ? "destructive" : "secondary"}>{tv(`status.${video.status}`)}</Badge>}
                      {video.published ? <Badge variant="secondary">{t("published")}</Badge> :
                        <Badge variant="outline">{t("unpublished")}</Badge>}
                    </div>
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
