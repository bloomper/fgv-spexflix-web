import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bloomper/fgv-web-ui/ui/table";
import { getQueue } from "@/lib/admin/admin.server";
import { formatInstant } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function QueuePage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Queue");
    const jobs = await getQueue();

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={t("text")}
        />
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("video")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("progress")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("queuedAt")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("finishedAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Link
                      href={`/manage/videos/${job.videoId}`}
                      className="hover:text-link font-medium"
                    >
                      {job.videoTitle}
                    </Link>
                    {job.error && <div className="text-destructive text-xs">{job.error}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.status === "FAILED" ? "destructive" : "secondary"}>
                      {t(`statuses.${job.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{job.progress} %</TableCell>
                  <TableCell className="hidden whitespace-nowrap tabular-nums md:table-cell">
                    {formatInstant(job.createdAt)}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap tabular-nums md:table-cell">
                    {formatInstant(job.finishedAt)}
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
