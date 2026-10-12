import PageShell from "@/components/PageShell";
import RulesMarkdown from "@/components/RulesMarkdown";
import type { Lang } from "@/lib/site";

export default function RulesPage({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  return (
    <PageShell lang={lang}>
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-white/8 bg-gradient-to-br from-[#1b222c] to-[#10151c] p-7 sm:p-10">
          <p className="text-xs font-black tracking-[.2em] text-orange-300">OFFICIAL GAME REFERENCE</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">{ar ? "قوانين Brick Breaker Ball" : "Brick Breaker Ball Rules"}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/55">
            {ar ? "مرجع كامل لنمطَي اللعب: الكلاسك والفولي. اختر النمط لتنتقل مباشرة إلى قوانينه وصوره التوضيحية." : "A complete reference for both game modes: Classic and Volley. Choose a mode to jump directly to its rules and illustrated guide."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="rules-mode-link" href="#classic-rules">{ar ? "قوانين الكلاسك" : "Classic rules"}</a>
            <a className="rules-mode-link rules-mode-link-volley" href="#volley-rules">{ar ? "قوانين الفولي" : "Volley rules"}</a>
          </div>
        </div>
        <section id="classic-rules" className="scroll-mt-28 rounded-[2rem] border border-white/8 bg-white/[.025] p-5 sm:p-9">
          <div className="rules-section-kicker">{ar ? "النمط الأول" : "MODE ONE"}</div>
          <RulesMarkdown lang={lang} mode="classic" />
        </section>
        <section id="volley-rules" className="mt-10 scroll-mt-28 rounded-[2rem] border border-cyan-300/15 bg-gradient-to-b from-cyan-400/[.045] to-white/[.02] p-5 sm:p-9">
          <div className="rules-section-kicker rules-section-kicker-volley">{ar ? "النمط الثاني" : "MODE TWO"}</div>
          <RulesMarkdown lang={lang} mode="volley" />
        </section>
      </main>
    </PageShell>
  );
}
