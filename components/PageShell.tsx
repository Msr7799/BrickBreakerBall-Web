import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteEffects from "@/components/SiteEffects";
import type { Lang } from "@/lib/site";

export default function PageShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <SiteHeader lang={lang} />
      {children}
      <SiteFooter lang={lang} />
      <SiteEffects />
    </div>
  );
}
