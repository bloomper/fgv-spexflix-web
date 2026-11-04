"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatInstant } from "@/utils/format";
import { deleteVideoAction, emptyTrashAction, trashVideoAction } from "@/app/(app)/manage/actions.server";
import { useDialogs } from "@/components/dialogs.client";

type Item = { id: string; title: string; year?: number | null; trashedAt?: string | null };

/**
 * Trashed videos: editors restore, admins delete for good, which deletes the files.
 */
export function TrashList({ videos, admin }: { videos: Item[]; admin: boolean }) {
  const t = useTranslations("Trash");
  const { confirm } = useDialogs();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (work: () => Promise<{ ok: boolean; message?: string }>) => startTransition(async () => {
    const result = await work();

    if (result.ok) {
      router.refresh();
    } else {
      toast.error(result.message);
    }
  });

  if (videos.length === 0) {
    return <p className="text-muted-foreground">{t("empty")}</p>;
  }
  return (
    <div className="space-y-4">
      {admin && (
        <Button variant="destructive" disabled={pending} onClick={async () => await confirm({
          title: t("confirmEmpty"),
          confirmLabel: t("emptyTrash"),
          destructive: true,
        }) && run(emptyTrashAction)}>
          {t("emptyTrash")}
        </Button>
      )}
      <ul className="divide-y rounded-lg border">
        {videos.map(video => (
          <li key={video.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="font-medium">{video.title}</div>
              <div className="text-xs text-muted-foreground">
                {[video.year, video.trashedAt ? t("trashedAt", { date: formatInstant(video.trashedAt) ?? "" }) : null].filter(Boolean).join(" · ")}
              </div>
            </div>
            <Button variant="outline" size="sm" disabled={pending}
                    onClick={() => run(() => trashVideoAction(video.id, false))}>{t("restore")}</Button>
            {admin && (
              <Button variant="destructive" size="sm" disabled={pending}
                      onClick={async () => await confirm({
                          title: t("confirmDelete", { title: video.title }),
                          confirmLabel: t("delete"),
                          destructive: true,
                        })
                        && run(() => deleteVideoAction(video.id))}>
                {t("delete")}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
