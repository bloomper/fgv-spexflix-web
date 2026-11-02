import {getTranslations} from "next-intl/server";
import {getVideos} from "@/lib/video/video.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {CollectionEditor} from "../collection-editor.client";

export default async function NewCollectionPage() {
    return withPolicyPage(Policies.editor.requireEditor, async () => {
        const t = await getTranslations("Collections");
        const data = await getVideos({includeUnpublished: true});

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("new")}</h1>
                <CollectionEditor videos={data?.videos ?? []}/>
            </div>
        );
    });
}
