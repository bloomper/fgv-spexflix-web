"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { NativeSelect, NativeSelectOption } from "@bloomper/fgv-web-ui/ui/native-select";
import { Switch } from "@bloomper/fgv-web-ui/ui/switch";
import { Textarea } from "@bloomper/fgv-web-ui/ui/textarea";
import type { SettingsInput } from "@/gql/graphql";
import { saveSettingsAction } from "../actions.server";

/**
 * The settings: start page texts and its featured video, the largest upload, whether originals are kept and whether
 * casting is offered.
 */
export function SettingsForm({
  initial,
  videos,
}: {
  initial: SettingsInput;
  /** The listed videos an admin can feature. */
  videos: { id: string; title: string; year?: number | null }[];
}) {
  const t = useTranslations("AdminSettings");
  const [values, setValues] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveSettingsAction(values);

          if (result.ok) {
            toast.success(t("saved"));
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="welcome-sv">{t("welcomeSv")}</Label>
        <Textarea
          id="welcome-sv"
          rows={3}
          value={values.welcomeSv ?? ""}
          onChange={(event) => setValues({ ...values, welcomeSv: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="welcome-en">{t("welcomeEn")}</Label>
        <Textarea
          id="welcome-en"
          rows={3}
          value={values.welcomeEn ?? ""}
          onChange={(event) => setValues({ ...values, welcomeEn: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="featured">{t("featured")}</Label>
        <NativeSelect
          id="featured"
          value={values.featuredVideoId ?? ""}
          aria-describedby="featured-text"
          onChange={(event) => setValues({ ...values, featuredVideoId: event.target.value || null })}
        >
          <NativeSelectOption value="">{t("featuredNewest")}</NativeSelectOption>
          {videos.map((video) => (
            <NativeSelectOption
              key={video.id}
              value={video.id}
            >
              {[video.title, video.year].filter(Boolean).join(", ")}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p
          id="featured-text"
          className="text-muted-foreground text-xs"
        >
          {t("featuredText")}
        </p>
      </div>
      <div className="w-48 space-y-1.5">
        <Label htmlFor="max-upload">{t("maxUpload")}</Label>
        <Input
          id="max-upload"
          type="number"
          min={1}
          max={500}
          value={values.maxUploadGb}
          onChange={(event) => setValues({ ...values, maxUploadGb: Number(event.target.value) })}
        />
      </div>
      <label className="flex items-center gap-3">
        <Switch
          checked={values.keepOriginals}
          onCheckedChange={(checked) => setValues({ ...values, keepOriginals: checked })}
        />
        <span>
          <span className="block">{t("keepOriginals")}</span>
          <span className="text-muted-foreground block text-xs">{t("keepOriginalsText")}</span>
        </span>
      </label>
      <label className="flex items-center gap-3">
        <Switch
          checked={values.castingEnabled ?? true}
          onCheckedChange={(checked) => setValues({ ...values, castingEnabled: checked })}
        />
        <span>
          <span className="block">{t("casting")}</span>
          <span className="text-muted-foreground block text-xs">{t("castingText")}</span>
        </span>
      </label>
      <Button
        type="submit"
        disabled={pending}
      >
        {t("save")}
      </Button>
    </form>
  );
}
