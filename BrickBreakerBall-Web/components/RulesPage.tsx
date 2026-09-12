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
            {ar ? "مرجع القواعد مأخوذ من ملفات اللعبة المرفوعة، ويشمل نظام المضارب والكور والتمائم والقراميد والعناصر الخاصة." : "This reference is built from the game project's supplied rules and covers paddles, balls, power-ups, bricks and special gameplay elements."}
          </p>
        </div>
        <RulesMarkdown lang={lang} />
      </main>
    </PageShell>
  );
}
