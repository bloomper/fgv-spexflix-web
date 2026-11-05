"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCreditsAction } from "@/app/(app)/manage/actions.server";

type Row = { name: string; role: string };

/**
 * Who takes part in a video ("Medverkande"): names with what each does or plays, in the order shown on the video's
 * page. Rows without a name are left out when saving.
 */
export function CreditsEditor({ videoId, credits }: {
  videoId: string;
  credits: { name: string; role?: string | null }[];
}) {
  const t = useTranslations("Credits");
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => credits.map(credit => ({ name: credit.name, role: credit.role ?? "" })));
  const [pending, startTransition] = useTransition();
  const change = (index: number, field: keyof Row, value: string) =>
    setRows(current => current.map((row, i) => i === index ? { ...row, [field]: value } : row));
  const move = (from: number, to: number) => setRows(current => {
    const copy = [...current];
    const [moved] = copy.splice(from, 1);

    copy.splice(to, 0, moved);
    return copy;
  });

  const save = () => startTransition(async () => {
    const result = await setCreditsAction(videoId, rows.filter(row => row.name.trim())
      .map(row => ({ name: row.name, role: row.role || null })));

    if (result.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(result.message);
    }
  });

  return (
    <section className="space-y-3" aria-labelledby="credits-heading">
      <h2 id="credits-heading" className="text-lg font-semibold">{t("title")}</h2>
      <p className="text-sm text-muted-foreground">{t("editText")}</p>
      <ol className="space-y-2">
        {rows.map((row, index) => (
          <li key={index} className="flex flex-wrap items-end gap-2">
            <div className="min-w-48 flex-1 space-y-1">
              <Label htmlFor={`credit-name-${index}`} className="text-xs">{t("name")}</Label>
              <Input id={`credit-name-${index}`} value={row.name} maxLength={255}
                     onChange={event => change(index, "name", event.target.value)} />
            </div>
            <div className="min-w-40 flex-1 space-y-1">
              <Label htmlFor={`credit-role-${index}`} className="text-xs">{t("role")}</Label>
              <Input id={`credit-role-${index}`} value={row.role} maxLength={255} placeholder={t("rolePlaceholder")}
                     onChange={event => change(index, "role", event.target.value)} />
            </div>
            <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, index - 1)}
                    aria-label={t("moveUp", { name: row.name })}><ArrowUp /></Button>
            <Button variant="ghost" size="icon" disabled={index === rows.length - 1} onClick={() => move(index, index + 1)}
                    aria-label={t("moveDown", { name: row.name })}><ArrowDown /></Button>
            <Button variant="ghost" size="icon" aria-label={t("remove", { name: row.name })}
                    onClick={() => setRows(current => current.filter((_, i) => i !== index))}><X /></Button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setRows(current => [...current, { name: "", role: "" }])}>
          <Plus />{t("add")}
        </Button>
        <Button disabled={pending} onClick={save}>{t("save")}</Button>
      </div>
    </section>
  );
}
