import Link from "next/link";
import Image from "next/image";
import GalleryLightbox from "@/components/GalleryLightbox";
import AdSenseBanner from "@/components/AdSenseBanner";
import PageShell from "@/components/PageShell";
import WorldExplorer from "@/components/WorldExplorer";
import { copy, GOOGLE_PLAY_URL, YOUTUBE_URL, type Lang } from "@/lib/site";

function StoreIcon() {
  return (
    <svg viewBox="0 0 34 38" aria-hidden="true" className="h-9 w-8 shrink-0">
      <path fill="#00d2ff" d="M2 2.5 20.8 19 2 35.5c-.6-.7-1-1.7-1-2.9V5.4c0-1.2.4-2.2 1-2.9Z" />
      <path fill="#00f076" d="m4.6 1.1 22.3 12.7-6.1 5.2L2 2.5c.7-.9 1.6-1.5 2.6-1.4Z" />
      <path fill="#ffdc38" d="m26.9 13.8 5 2.8c1.5.9 1.5 2 0 2.8l-5.1 2.9-6-3.3 6.1-5.2Z" />
      <path fill="#ff416c" d="M26.8 22.3 4.6 34.9c-1 .2-1.9-.4-2.6-1.4L20.8 19l6 3.3Z" />
    </svg>
  );
}

export default function HomePage({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const ar = lang === "ar";

  return (
    <PageShell lang={lang}>
      <main>
        <section className="hero-stage relative isolate min-h-[calc(100svh-72px)] overflow-hidden">
          <div className="hero-volley-art absolute inset-0 -z-30" aria-hidden="true">
            <Image src="/game/site/optimized/bosses/1.webp" alt="" width={941} height={1672} sizes="(max-width: 767px) 100vw, 33vw" quality={45} priority fetchPriority="high" />
            <Image src="/game/site/optimized/bosses/6.webp" alt="" width={941} height={1672} sizes="33vw" loading="lazy" />
            <Image src="/game/site/optimized/bosses/9.webp" alt="" width={941} height={1672} sizes="33vw" loading="lazy" />
          </div>
          <div className="hero-cinematic absolute inset-0 -z-20" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-[#06070a] to-transparent" />
          <div className="mx-auto flex min-h-[calc(100svh-72px)] max-w-[1480px] items-end px-5 pb-20 pt-32 sm:px-8 lg:items-center lg:pb-24 lg:pt-28 xl:px-12">
            <div className="hero-copy max-w-3xl">
              <p className="eyebrow ember-text">{c.heroKicker}</p>
              <h1 className="display-title mt-5 max-w-3xl text-5xl leading-[.9] text-white sm:text-7xl lg:text-[6.6rem]">{c.heroTitle}</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">{c.heroBody}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer" className="store-button group"><StoreIcon /><span><small>ANDROID</small>{c.googlePlay}</span></a>
                <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" className="secondary-button"><span className="play-dot">▶</span>{c.watchGameplay}</a>
              </div>
            </div>
          </div>
          <a href="#story" className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[10px] font-black tracking-[.25em] text-white/70 lg:flex"><span className="scroll-line" />{c.scroll}</a>
        </section>

        <section id="story" className="relative overflow-hidden px-5 py-24 sm:px-8 lg:py-32">
          <div className="ember-orb -left-40 top-0" />
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
            <div>
              <p className="eyebrow text-[#ff9d55]">{c.introKicker}</p>
              <h2 className="section-title mt-5 max-w-4xl">{c.introTitle}</h2>
              <p className="mt-7 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">{c.introBody}</p>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10">
              {c.stats.map(([value, label]) => <div key={label} className="stat-card bg-[#0c1018] p-6 sm:p-8"><div className="display-title text-4xl text-white sm:text-6xl">{value}</div><div className="mt-2 text-[10px] font-black uppercase tracking-[.18em] text-white/70 sm:text-xs">{label}</div></div>)}
            </div>
          </div>
        </section>

        <AdSenseBanner lang={lang} />

        <section id="modes" className="border-y border-white/8 bg-[#090c12] px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1480px]">
            <div className="mx-auto max-w-4xl text-center"><p className="eyebrow text-[#74cfff]">{c.modesKicker}</p><h2 className="section-title mt-5">{c.modesTitle}</h2></div>
            <div className="mt-14">
                <article className="mode-card mode-volley mx-auto grid max-w-5xl lg:grid-cols-2">
                  <div className="mode-shot"><Image src="/game/site/optimized/screens/volley-tormented-souls.webp" alt={ar ? "مرحلة فولي من عالم الأرواح المعذبة" : "Volley gameplay in Tormented Souls"} width={513} height={1018} sizes="(max-width: 1023px) 100vw, 500px" quality={55} loading="lazy" className="h-full w-full object-cover object-top" /><div className="mode-fade" /></div>
                  <div className="relative p-7 sm:p-10">
                    <p className="eyebrow mode-label">{c.volley.label}</p>
                    <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">{c.volley.title}</h3>
                    <p className="mt-5 text-[15px] leading-8 text-white/58">{c.volley.body}</p>
                    <ul className="mt-7 space-y-3">{c.volley.points.map(point => <li key={point} className="feature-line"><span>✦</span>{point}</li>)}</ul>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/${lang}/play#volley`} className="mode-play-button">{ar ? "جرّب مرحلة فولي" : "PLAY A VOLLEY STAGE"} <span>↗</span></Link>
                    </div>
                  </div>
                </article>
            </div>
          </div>
        </section>

        <section className="feature-bento-section px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl"><p className="eyebrow text-[#c785ff]">{ar ? "داخل اللعبة" : "BUILT INTO THE ADVENTURE"}</p><h2 className="section-title mt-5">{ar ? "أكثر من طريقة لكسر كل تحدٍ." : "More than one way to break every challenge."}</h2></div>
            <div className="feature-bento mt-14">
              {[
                ["◉", ar ? "تصويب دقيق" : "Precision Aiming", ar ? "اختر زاوية الإطلاق للوصول إلى القراميد المحمية." : "Choose a launch angle to reach guarded bricks.", "orange"],
                ["✦", ar ? "استراتيجية Volley" : "Volley Strategy", ar ? "صوّب مجموعة كرات كاملة وابحث عن أطول مسار ارتداد." : "Aim a complete ball volley and search for the longest ricochet route.", "violet"],
                ["九", ar ? "تسعة عوالم خيالية" : "Nine Fantasy Worlds", ar ? "حملة Volley من الغابة الغامضة حتى الكسوف الأخير." : "A Volley campaign from Mystery Forest to the Final Eclipse.", "green"],
                ["♛", ar ? "معارك زعماء" : "Epic Boss Battles", ar ? "نواة محمية ومواجهة أخيرة فعلية في نهاية كل عالم." : "Guarded cores and a real final encounter at the end of every world.", "red"],
                ["↗", ar ? "تحديات متصاعدة" : "Progressive Challenges", ar ? "قراميد خاصة ومخاطر وتشكيلات تتطور مع تقدم الحملة." : "Special bricks, hazards and formations that evolve through the campaign.", "blue"]
              ].map(([icon,title,body,tone], index) => <article key={title} className={`feature-bento-card tone-${tone} feature-card-${index + 1}`}><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{body}</p></article>)}
            </div>
          </div>
        </section>

        <section id="bosses" className="boss-section relative overflow-hidden py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_.62fr] lg:items-end">
              <div><p className="eyebrow text-[#9ae672]">{c.bossesKicker}</p><h2 className="section-title mt-5 max-w-4xl">{c.bossesTitle}</h2></div>
              <p className="max-w-2xl text-base leading-8 text-white/55 lg:pb-2">{c.bossesBody}</p>
            </div>
          </div>
          <WorldExplorer lang={lang} />
        </section>

        <GalleryLightbox lang={lang} />

        <section className="relative overflow-hidden px-5 py-24 sm:px-8 lg:py-32">
          <div className="final-glow absolute inset-0 -z-10" />
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
            <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/12 bg-black/30 p-2 shadow-[0_35px_100px_rgba(0,0,0,.65)]"><Image src="/game/site/optimized/bosses/9.webp" alt={ar ? "زعيم عالم الكسوف الأخير في لعبة الفولي" : "Final Eclipse Volley boss"} width={941} height={1672} sizes="360px" loading="lazy" className="h-auto w-full rounded-[1.5rem]" /></div>
            <div className="text-center lg:text-start">
              <p className="eyebrow text-[#74cfff]">{c.finalKicker}</p><h2 className="section-title mt-5">{c.finalTitle}</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/58 lg:mx-0">{c.finalBody}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start"><a href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer" className="store-button"><StoreIcon /><span><small>ANDROID</small>{c.googlePlay}</span></a><Link href={`/${lang}/rules`} className="secondary-button">{c.nav.rules}</Link></div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
