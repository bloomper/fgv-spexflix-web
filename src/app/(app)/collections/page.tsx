import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {PosterImage} from "@/components/video/poster-image.client";
import {getCollections} from "@/lib/video/video.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

export default async function CollectionsPage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Collections");
        const collections = await getCollections();

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
                {collections.length === 0 ? <p className="text-muted-foreground">{t("none")}</p> : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {collections.map(collection => (
                            <li key={collection.id}>
                                <Link href={`/collections/${collection.id}`}
                                      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <div className="relative overflow-hidden rounded-lg shadow-sm">
                                        {collection.videos[0]
                                            ? <PosterImage videoId={collection.videos[0].id} title={collection.title} className="w-full transition-transform group-hover:scale-[1.02]"/>
                                            : <div className="aspect-video w-full bg-muted"/>}
                                        <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white">
                                            {t("videos", {count: collection.videos.length})}
                                        </span>
                                    </div>
                                    <div className="mt-2 font-medium leading-tight">{collection.title}</div>
                                    {collection.description && <p className="line-clamp-2 text-xs text-muted-foreground">{collection.description}</p>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    });
}
