import Link from "next/link";
import Image from "next/image";
import { copy, GITHUB_URL, GOOGLE_PLAY_URL, YOUTUBE_URL, type Lang } from "@/lib/site";

export default function SiteFooter({ lang }: { lang: Lang }) {
  const c = copy[lang];
  return (
    <footer className="border-t border-white/8 bg-[#050609]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto_auto] md:items-start">
        <div className="max-w-md">
          <div className="flex items-center gap-3"><Image src="/game/site/optimized/branding/app-icon-96.webp" alt="" width={48} height={48} sizes="48px" loading="lazy" className="h-12 w-12 rounded-xl object-cover" /><div><div className="font-black tracking-[.1em] text-white">BRICK BREAKER BALL</div><div className="mt-1 text-[9px] font-bold tracking-[.25em] text-[#ff8b42]">FORGE PULSE GAMES</div></div></div>
          <p className="mt-5 text-sm leading-7 text-white/70">{c.footerLine}</p>
        </div>
        <div>
          <div className="footer-heading">{c.nav.home}</div>
          <div className="mt-4 grid gap-3 text-sm text-white/50"><Link href={`/${lang}#modes`}>{c.nav.modes}</Link><Link href={`/${lang}#bosses`}>{c.nav.bosses}</Link><Link href={`/${lang}/play`}>{c.nav.gameplay}</Link><Link href={`/${lang}#gallery`}>{c.nav.gallery}</Link><a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer">Google Play</a><a href={YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube</a></div>
        </div>
        <div>
          <div className="footer-heading">{c.legal}</div>
          <div className="mt-4 grid gap-3 text-sm text-white/50"><Link href={`/${lang}/rules`}>{c.nav.rules}</Link><Link href={`/${lang}/privacy`}>{c.nav.privacy}</Link><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a></div>
        </div>
      </div>
      <div className="border-t border-white/6 px-5 py-5 text-center text-[10px] font-bold tracking-[.14em] text-white/70">© 2026 FORGE PULSE GAMES · BRICK BREAKER BALL</div>
    </footer>
  );
}
