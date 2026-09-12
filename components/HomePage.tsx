import Link from "next/link";
import balls from "@/content/balls.json";
import PageShell from "@/components/PageShell";
import { copy, worlds, type Lang } from "@/lib/site";

const showcaseBalls = balls;
const paddleSheets = ["paddle-group1.png", "paddles-group2.png", "paddle-group3.png", "paddles-group4.png", "paddles-group5.png", "paddles-group6.png"];

export default function HomePage({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const ar = lang === "ar";

  return (
    <PageShell lang={lang}>
      <main>
        <section className="relative isolate min-h-[760px] overflow-hidden border-b border-white/8">
          <video className="absolute inset-0 -z-30 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata">
            <source src="/game/worlds/splash.mp4" type="video/mp4" />
          </video>
          <div className="hero-vignette absolute inset-0 -z-20" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_65%_30%,transparent_0,transparent_18%,rgba(7,11,17,.25)_56%,rgba(7,11,17,.78)_100%)]" />

          <div className="mx-auto flex min-h-[760px] max-w-7xl items-end px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex rounded-full border border-orange-300/20 bg-orange-500/10 px-4 py-2 text-xs font-extrabold tracking-[.2em] text-orange-100">
                {c.heroEyebrow}
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[.95] tracking-[-.045em] text-white sm:text-6xl lg:text-8xl">
                {c.heroTitle}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">{c.heroBody}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={`/${lang}/play`} className="rounded-2xl bg-gradient-to-b from-[#e46a0d] to-[#9f0712] px-7 py-4 text-sm font-black tracking-[.12em] text-white shadow-[0_16px_42px_rgba(159,7,18,.28)] transition hover:-translate-y-0.5 hover:brightness-110">
                  {c.playNow}
                </Link>
                <Link href={`/${lang}/rules`} className="rounded-2xl border border-white/12 bg-white/7 px-7 py-4 text-sm font-black tracking-[.12em] text-white backdrop-blur transition hover:bg-white/12">
                  {c.viewRules}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto -mt-9 grid max-w-7xl grid-cols-2 gap-3 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {c.stats.map(([value, label]) => (
            <div key={label} className="glass rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-white sm:text-4xl">{value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-white/45">{label}</div>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-black tracking-[.2em] text-orange-300">CAMPAIGN SYSTEM</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{c.featureTitle}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/58">{c.featureBody}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {c.features.map(([title, body], index) => (
                <article key={title} className="glass neon-border rounded-3xl p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9f0712]/90 to-[#ca3500]/80 text-sm font-black text-white">0{index + 1}</div>
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="worlds" className="border-y border-white/8 bg-black/12 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black tracking-[.2em] text-orange-300">WORLD MAP</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{c.worldsTitle}</h2>
              <p className="mt-5 text-base leading-8 text-white/55">{c.worldsBody}</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {worlds.map((world) => (
                <article key={world.id} className="group relative min-h-[280px] overflow-hidden rounded-3xl border border-white/8 bg-[#10151c]">
                  <img src={`/game/world-map/${world.id}.png`} alt={ar ? world.ar : world.en} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="text-xs font-black tracking-[.18em] text-orange-200">WORLD {String(world.id).padStart(2, "0")}</div>
                    <h3 className="mt-2 text-xl font-black text-white">{ar ? world.ar : world.en}</h3>
                    <p className="mt-2 text-sm text-white/55">{ar ? world.arSub : world.enSub}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-black tracking-[.2em] text-orange-300">COSMETICS</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{c.cosmeticsTitle}</h2>
              <p className="mt-5 text-base leading-8 text-white/55">{c.cosmeticsBody}</p>
              <Link href={`/${lang}/play`} className="mt-7 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">{c.playNow}</Link>
            </div>
            <div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
                {showcaseBalls.map((ball) => (
                  <div key={ball.file} title={`${ball.index}. ${ball.name}`} className={`glass flex aspect-square items-center justify-center rounded-xl p-1.5 ${ball.starter ? "ring-1 ring-orange-400/40" : ""}`}>
                    <img src={`/game/cosmetics/balls/${ball.file}`} alt={ball.name} className="h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,.32)]" />
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {paddleSheets.map((sheet, index) => (
                  <div key={sheet} className="glass overflow-hidden rounded-2xl p-2">
                    <img src={`/game/showcase/paddles/${sheet}`} alt={`Paddle sheet ${index + 1}`} className="aspect-square w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151c] p-7 sm:p-10 lg:p-14">
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#9f0712]/20 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
              <div>
                <p className="text-xs font-black tracking-[.2em] text-orange-300">WEB EDITION</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{c.webTitle}</h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/58">{c.webBody}</p>
                <Link href={`/${lang}/play`} className="mt-8 inline-flex rounded-2xl bg-gradient-to-b from-[#e46a0d] to-[#9f0712] px-7 py-4 text-sm font-black tracking-[.12em] text-white">{c.playNow}</Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["paddle_normal.png", "paddle_laser.png", "paddle_sticky.png"].map((p) => (
                  <div key={p} className="glass flex min-h-32 items-center justify-center rounded-2xl p-4">
                    <img src={`/game/assets/paddle/${p}`} alt="Paddle" className="max-h-24 w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-8 text-center sm:px-6">
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{c.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/55">{c.finalBody}</p>
          <Link href={`/${lang}/play`} className="mt-8 inline-flex rounded-2xl bg-white px-8 py-4 text-sm font-black tracking-[.12em] !text-black transition hover:scale-[1.02]">{c.playNow}</Link>
        </section>
      </main>
    </PageShell>
  );
}
