import PageShell from "@/components/PageShell";
import GameCanvas from "@/components/GameCanvas";
import type { Lang } from "@/lib/site";

export default function PlayPage({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  return (
    <PageShell lang={lang}>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black tracking-[.2em] text-orange-300">{ar ? "العب الآن • اختر تجهيزاتك" : "PLAY NOW • CHOOSE YOUR LOADOUT"}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">{ar ? "ابدأ اللعب واختر تجهيزاتك" : "Play now, your way"}</h1>
          <p className="mt-4 text-base leading-8 text-white/55">
            {ar
              ? "اختر العالم والبادل والكرة التي تناسبك، ثم ابدأ المرحلة مباشرة. اختياراتك وتقدمك محفوظة محليًا في المتصفح."
              : "Choose your world, paddle and ball, then jump straight into the stage. Your loadout and campaign progress are saved locally in the browser."}
          </p>
        </div>
        <GameCanvas lang={lang} />
      </main>
    </PageShell>
  );
}
