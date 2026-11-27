import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bloomper/fgv-web-ui/ui/table";
import { getVideos } from "@/lib/video/video.server";
import { kindName } from "@/utils/format";
import { formatDuration } from "@/utils/duration";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function ManageVideosPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const tv = await getTranslations("Video");
    const locale = await getLocale();
    const data = await getVideos({ includeUnpublished: true });

    return (
      <Page variant="content">
        <PageHeader
          title={t("videos")}
          actions={
            <Button
              nativeButton={false}
              render={<Link href="/manage/videos/new" />}
            >
              <Plus />
              {t("newVideo")}
            </Button>
          }
        />
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
              {data?.videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="whitespace-normal">
                    <Link
                      href={`/manage/videos/${video.id}`}
                      className="hover:text-link font-medium"
                    >
                      {video.title}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">{video.year}</TableCell>
                  <TableCell className="hidden sm:table-cell">{kindName(video.kind, locale)}</TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">
                    {video.durationMs ? formatDuration(video.durationMs / 1000) : ""}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap gap-1">
                      {video.status !== "READY" && (
                        <Badge variant={video.status === "FAILED" ? "destructive" : "secondary"}>
                          {tv(`status.${video.status}`)}
                        </Badge>
                      )}
                      {video.published ? (
                        <Badge variant="secondary">{t("published")}</Badge>
                      ) : (
                        <Badge variant="outline">{t("unpublished")}</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Page>
    );
  });
}
