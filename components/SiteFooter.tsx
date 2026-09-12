import Link from "next/link";
import { copy, type Lang } from "@/lib/site";

export default function SiteFooter({ lang }: { lang: Lang }) {
  const c = copy[lang];
  return (
    <footer className="mt-24 border-t border-white/8 bg-black/15">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 text-sm text-white/50 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>{c.footer}</div>
        <div className="flex gap-5">
          <Link href={`/${lang}/rules`} className="hover:text-white">{c.nav.rules}</Link>
          <Link href={`/${lang}/privacy`} className="hover:text-white">{c.nav.privacy}</Link>
          <a href="https://github.com/msr7799" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
