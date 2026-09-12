"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy, type Lang } from "@/lib/site";

export default function SiteHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const c = copy[lang];
  const other: Lang = lang === "en" ? "ar" : "en";
  const otherPath = pathname.replace(/^\/(en|ar)/, `/${other}`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#070b11]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`/${lang}`} className="flex min-w-0 items-center gap-3">
          <img src="/game/branding/app-icon.png" alt="Brick Breaker Ball" className="h-10 w-10 rounded-xl object-cover shadow-lg" />
          <div className="min-w-0">
            <div className="truncate text-sm font-black tracking-[.14em] text-white sm:text-base">BRICK BREAKER BALL</div>
            <div className="text-[10px] uppercase tracking-[.28em] text-white/45">Web Edition</div>
          </div>
        </Link>

        <nav className="scrollbar-thin ms-auto flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
          <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/6 hover:text-white" href={`/${lang}`}>{c.nav.home}</Link>
          <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-orange-200 transition hover:bg-orange-500/10" href={`/${lang}/play`}>{c.nav.play}</Link>
          <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/6 hover:text-white" href={`/${lang}#worlds`}>{c.nav.worlds}</Link>
          <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/6 hover:text-white" href={`/${lang}/rules`}>{c.nav.rules}</Link>
          <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/6 hover:text-white" href={`/${lang}/privacy`}>{c.nav.privacy}</Link>
        </nav>

        <Link href={otherPath} className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/10">
          {lang === "en" ? "العربية" : "EN"}
        </Link>
      </div>
    </header>
  );
}
