"use client";

import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { AppSwitcher } from "@/components/app-switcher.client";
import type { Application } from "@/utils/applications";
import { ModeToggle } from "@/components/mode-toggle.client";
import { LanguageToggle } from "@/components/language-toggle.client";
import { useIsClient } from "@/hooks/use-is-client.client";
import { HeaderSearch } from "@/components/header-search.client";
import { cn } from "@/utils/utils";

/**
 * The header: the application switcher, search and the toggles. It sees through at the top of the page and
 * turns opaque once the page scrolls.
 */
export function SiteHeader({ applications }: { applications: Application[] }) {
  const isClient = useIsClient();
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-site-header data-scrolled={scrolled || undefined}
            className={cn("sticky top-0 z-50 flex w-full items-center border-b transition-colors duration-300 print:hidden",
              scrolled ? "border-border bg-background shadow-sm" : "border-transparent bg-background/40 backdrop-blur-sm")}>
      <div className="flex min-h-(--header-height) w-full items-center gap-2 px-4 max-[359px]:gap-1 max-[359px]:px-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <MenuToggle />
          <AppSwitcher
            title={t("Meta.title")}
            applications={applications}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isClient ? (
            <>
              <HeaderSearch />
              <LanguageToggle />
              <ModeToggle />
            </>
          ) : (
            <div className="bg-muted h-8 w-8 animate-pulse rounded" />
          )}
        </div>
      </div>
    </header>
  );
}

function MenuToggle() {
  const { toggleSidebar, openMobile } = useSidebar();
  const t = useTranslations("Header");

  return (
    <Button
      className="h-8 w-8 md:hidden"
      variant="ghost"
      size="icon"
      aria-label={t("showMenu")}
      aria-expanded={openMobile}
      onClick={toggleSidebar}
    >
      <MenuIcon />
    </Button>
  );
}
