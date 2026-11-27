import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PosterImage } from "@/components/video/poster-image.client";
import { getCollections } from "@/lib/video/video.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function CollectionsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Collections");
    const collections = await getCollections();

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={t("text")}
        />
        {collections.length === 0 ? (
          <DataEmpty
            title={t("none")}
            description={null}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {collections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.id}`}
                  className="group focus-visible:ring-ring block rounded-lg outline-none focus-visible:ring-2"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-sm">
                    {collection.videos[0] ? (
                      <PosterImage
                        videoId={collection.videos[0].id}
                        title={collection.title}
                        className="w-full transition-transform group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="bg-muted aspect-video w-full" />
                    )}
                    <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white">
                      {t("videos", { count: collection.videos.length })}
                    </span>
                  </div>
                  <div className="mt-2 leading-tight font-medium">{collection.title}</div>
                  {collection.description && (
                    <p className="text-muted-foreground line-clamp-2 text-xs">{collection.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Page>
    );
  });
}
