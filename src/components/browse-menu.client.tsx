"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { decadesOf } from "@/utils/decades";
import { type KindName, kindName } from "@/utils/format";

export type Browse = {
  videoKinds: (KindName & { id: string })[];
  categories: { id: string; name: string }[];
  years: number[];
};

/**
 * Browsing from the header: by kind, decade, spex category, and every spex.
 */
export function BrowseMenu({ browse }: { browse: Browse }) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const item = (href: string, label: string) => (
    <DropdownMenuItem key={href} render={<Link href={href} />}>{label}</DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="hidden gap-1 md:inline-flex" />}>
        {t("browse")}<ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[70vh] w-60">
        {browse.videoKinds.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("kinds")}</DropdownMenuLabel>
            {browse.videoKinds.map(kind => item(`/videos?kind=${kind.id}`, kindName(kind, locale)))}
          </DropdownMenuGroup>
        )}
        {browse.years.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t("decades")}</DropdownMenuLabel>
              {decadesOf(browse.years).map(decade => item(`/videos?decade=${decade}`, t("decade", { decade })))}
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("spex")}</DropdownMenuLabel>
          {browse.categories.map(category => item(`/videos?category=${category.id}`, category.name))}
          {item("/spex", t("allSpex"))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
