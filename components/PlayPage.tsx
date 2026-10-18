import PlayableVolleyDemo from "@/components/PlayableVolleyDemo";
import PageShell from "@/components/PageShell";
import type { Lang } from "@/lib/site";

export default function PlayPage({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  return (
    <PageShell lang={lang}>
      <main className="relative overflow-hidden px-4 py-16 sm:px-8 lg:py-24">
        <div className="final-glow absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow text-[#ff9d55]">{ar ? "تجربة تفاعلية مباشرة" : "LIVE INTERACTIVE TRIAL"}</p>
            <h1 className="section-title mt-5">{ar ? "جرّب تصويب الفولي قبل التحميل." : "Try Volley before you download."}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/58">{ar ? "تجربة تفاعلية خفيفة مبنية للموقع: اختر زاوية الإطلاق، ثم تابع ارتدادات الكرات وهي تكسر القراميد." : "A lightweight browser preview: choose a launch angle, then watch your volley ricochet through the bricks."}</p>
          </div>
          <div className="mt-12"><PlayableVolleyDemo lang={lang} /></div>
          <div className="mx-auto mt-8 max-w-3xl">
            <article className="demo-note volley"><span>01</span><div><h2>VOLLEY</h2><p>{ar ? "اختر زاوية الارتداد ثم أطلق دفعة من الكرات لتقليل تحمّل القراميد. هذه تجربة مصغّرة؛ لعبة أندرويد تضم الحملة الكاملة." : "Choose a ricochet angle and launch a volley to reduce brick HP. This is a small preview; the Android game contains the full campaign."}</p></div></article>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
