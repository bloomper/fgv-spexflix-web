import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getQueue } from "@/lib/admin/admin.server";
import { formatInstant } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

export default async function QueuePage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Queue");
    const jobs = await getQueue();

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
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
              {jobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Link href={`/manage/videos/${job.videoId}`}
                          className="font-medium hover:text-primary">{job.videoTitle}</Link>
                    {job.error && <div className="text-xs text-destructive">{job.error}</div>}
                  </TableCell>
                  <TableCell><Badge
                    variant={job.status === "FAILED" ? "destructive" : "secondary"}>{t(`statuses.${job.status}`)}</Badge></TableCell>
                  <TableCell className="tabular-nums">{job.progress} %</TableCell>
                  <TableCell
                    className="hidden whitespace-nowrap tabular-nums md:table-cell">{formatInstant(job.createdAt)}</TableCell>
                  <TableCell
                    className="hidden whitespace-nowrap tabular-nums md:table-cell">{formatInstant(job.finishedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  });
}
