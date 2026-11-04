"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SettingsInput } from "@/gql/graphql";
import { saveSettingsAction } from "../actions.server";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const t = useTranslations("AdminSettings");
  const [values, setValues] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <form className="max-w-2xl space-y-4" onSubmit={event => {
      event.preventDefault();
      startTransition(async () => {
        const result = await saveSettingsAction(values);

        if (result.ok) {
          toast.success(t("saved"));
        } else {
          toast.error(result.message);
        }
      });
    }}>
      <div className="space-y-1.5">
        <Label htmlFor="welcome-sv">{t("welcomeSv")}</Label>
        <Textarea id="welcome-sv" rows={3} value={values.welcomeSv ?? ""}
                  onChange={event => setValues({ ...values, welcomeSv: event.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="welcome-en">{t("welcomeEn")}</Label>
        <Textarea id="welcome-en" rows={3} value={values.welcomeEn ?? ""}
                  onChange={event => setValues({ ...values, welcomeEn: event.target.value })} />
      </div>
      <div className="w-48 space-y-1.5">
        <Label htmlFor="max-upload">{t("maxUpload")}</Label>
        <Input id="max-upload" type="number" min={1} max={500} value={values.maxUploadGb}
               onChange={event => setValues({ ...values, maxUploadGb: Number(event.target.value) })} />
      </div>
      <label className="flex items-center gap-3">
        <Switch checked={values.keepOriginals}
                onCheckedChange={checked => setValues({ ...values, keepOriginals: checked })} />
        <span>
                    <span className="block">{t("keepOriginals")}</span>
                    <span className="block text-xs text-muted-foreground">{t("keepOriginalsText")}</span>
                </span>
      </label>
      <Button type="submit" disabled={pending}>{t("save")}</Button>
    </form>
  );
}
