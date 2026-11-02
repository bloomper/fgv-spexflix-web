"use client";

import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {type KindOption, VideoForm} from "@/components/video/video-form.client";
import {createVideoAction} from "@/app/(app)/manage/actions.server";
import {track} from "@/utils/umami";

export function NewVideo({kinds}: { kinds: KindOption[] }) {
    const t = useTranslations("Manage");
    const router = useRouter();

    return (
        <VideoForm kinds={kinds} submitLabel={t("create")} onSubmit={async input => {
            const result = await createVideoAction(input);

            if (result.ok && result.data) {
                track("video-create", {defaultKind: !input.kindId || input.kindId === kinds[0]?.id});
                router.push(`/manage/videos/${result.data}`);
                return true;
            }
            toast.error(result.ok ? t("failed") : result.message);
            return false;
        }}/>
    );
}
