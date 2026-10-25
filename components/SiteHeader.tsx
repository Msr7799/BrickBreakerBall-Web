"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { copy, GOOGLE_PLAY_URL, type Lang } from "@/lib/site";

export default function SiteHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const c = copy[lang];
  const other: Lang = lang === "en" ? "ar" : "en";
  const otherPath = pathname.replace(/^\/(en|ar)/, `/${other}`);
  const home = `/${lang}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 24);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, window.scrollY / total * 100) : 0);
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl ${scrolled ? "is-scrolled" : ""}`}>
      <div className="mx-auto flex h-[72px] max-w-[1480px] items-center gap-4 px-4 sm:px-8 xl:px-12">
        <Link href={home} className="flex min-w-0 items-center gap-3" aria-label="Brick Breaker Ball home">
          <Image src="/game/site/optimized/branding/app-icon-96.webp" alt="" width={44} height={44} sizes="44px" className="h-11 w-11 rounded-xl object-cover shadow-[0_0_25px_rgba(55,166,255,.2)]" />
          <div className="brand-copy min-w-0 leading-none"><div className="truncate text-sm font-black tracking-[.12em] text-white sm:text-base">BRICK BREAKER BALL</div><div className="mt-1.5 text-[8px] font-bold tracking-[.28em] text-[#ff8b42]">FORGE PULSE GAMES</div></div>
        </Link>

        <nav className="scrollbar-hide ms-auto hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          <Link className="nav-link" href={home}>{c.nav.home}</Link>
          <Link className="nav-link" href={`${home}#modes`}>{c.nav.modes}</Link>
          <Link className="nav-link" href={`${home}#bosses`}>{c.nav.bosses}</Link>
          <Link className="nav-link" href={`${home}/play`}>{c.nav.gameplay}</Link>
          <Link className="nav-link" href={`${home}#gallery`}>{c.nav.gallery}</Link>
          <Link className="nav-link" href={`${home}/rules`}>{c.nav.rules}</Link>
        </nav>

        <Link href={`${home}/editor`} className="admin-login-button" aria-label={lang === "ar" ? "دخول الإدارة" : "Admin sign in"}>
          <span aria-hidden="true">🔐</span><b>{lang === "ar" ? "دخول الإدارة" : "Admin"}</b>
        </Link>
        <Link href={otherPath} className="language-button" aria-label={lang === "en" ? "العربية" : "English"}>{lang === "en" ? "ع" : "EN"}</Link>
        <a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer" className="header-cta"><span className="hidden sm:inline">{c.nav.download}</span><span className="sm:hidden">↓</span></a>
        <button type="button" className="mobile-menu-button lg:hidden" aria-label={menuOpen ? (lang === "ar" ? "إغلاق القائمة" : "Close menu") : (lang === "ar" ? "فتح القائمة" : "Open menu")} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(v => !v)}><span /><span /><span /></button>
      </div>
      <nav id="mobile-menu" className={`mobile-menu lg:hidden ${menuOpen ? "open" : ""}`} aria-label="Mobile navigation">
        <Link onClick={() => setMenuOpen(false)} href={home}>{c.nav.home}</Link><Link onClick={() => setMenuOpen(false)} href={`${home}#modes`}>{c.nav.modes}</Link><Link onClick={() => setMenuOpen(false)} href={`${home}#bosses`}>{c.nav.bosses}</Link><Link onClick={() => setMenuOpen(false)} href={`${home}/play`}>{c.nav.gameplay}</Link><Link onClick={() => setMenuOpen(false)} href={`${home}#gallery`}>{c.nav.gallery}</Link><Link onClick={() => setMenuOpen(false)} href={`${home}/rules`}>{c.nav.rules}</Link><Link className="mobile-admin-login" onClick={() => setMenuOpen(false)} href={`${home}/editor`}>🔐 {lang === "ar" ? "دخول الإدارة" : "Admin sign in"}</Link>
      </nav>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
    </header>
  );
}
