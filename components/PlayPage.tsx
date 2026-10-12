import PlayableDemo from "@/components/PlayableDemo";
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
            <h1 className="section-title mt-5">{ar ? "جرّب المرحلتين قبل التحميل." : "Play both modes before you download."}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/58">{ar ? "مرحلتان خفيفتان مبنيتان للموقع وتشرحان الفرق الحقيقي بين تحكم Classic وتصويب Volley. اختر النمط وابدأ فورًا من المتصفح." : "Two lightweight website stages that demonstrate the real difference between Classic paddle control and Volley aiming. Pick a mode and start instantly."}</p>
          </div>
          <div className="mt-12"><PlayableDemo lang={lang} /></div>
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
            <article className="demo-note classic"><span>01</span><div><h2>CLASSIC</h2><p>{ar ? "حرّك المضرب، حافظ على الكرة داخل الساحة واكسر جميع القراميد قبل نفاد الفرص." : "Move the paddle, keep the ball alive and clear every brick before your lives run out."}</p></div></article>
            <article className="demo-note volley"><span>02</span><div><h2>VOLLEY</h2><p>{ar ? "اختر زاوية الارتداد ثم أطلق 14 كرة لتقليل أرقام القراميد وتدمير النواة." : "Choose a ricochet angle, then launch 14 balls to reduce every brick counter and destroy the core."}</p></div></article>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
