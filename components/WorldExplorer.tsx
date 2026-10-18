"use client";

import { useEffect, useState } from "react";
import { volleyWorlds, type Lang } from "@/lib/site";

export default function WorldExplorer({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  const [selected, setSelected] = useState<(typeof volleyWorlds)[number] | null>(null);
  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); };
  }, [selected]);

  return (
    <>
      <div className="boss-grid mx-auto mt-14 grid max-w-7xl gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {volleyWorlds.map(world => (
          <button key={world.id} onClick={() => setSelected(world)} className="boss-card group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[1.6rem] border border-white/10 text-start" aria-label={`${ar ? world.ar : world.en} — ${ar ? "فتح التفاصيل" : "open details"}`}>
            <img src={`/game/volley-Bosses/${world.id}.png`} alt={ar ? world.ar : world.en} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6"><p className="text-[10px] font-black tracking-[.2em] text-[#b8f595]">{ar ? "معركة زعيم" : "BOSS BATTLE"} · 0{world.id}</p><h3 className="mt-2 text-2xl font-black text-white">{ar ? world.ar : world.en}</h3><p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-white/45">{world.stages} {ar ? "مراحل" : "STAGES"}</p><span className="world-open">{ar ? "استكشف العالم" : "EXPLORE WORLD"} ↗</span></div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="world-modal" role="dialog" aria-modal="true" aria-label={ar ? selected.ar : selected.en} onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="world-modal-card">
            <button className="modal-close" onClick={() => setSelected(null)} aria-label={ar ? "إغلاق" : "Close"}>×</button>
            <div className="world-modal-image"><img src={`/game/volley-Bosses/${selected.id}.png`} alt={ar ? selected.ar : selected.en} /></div>
            <div className="world-modal-copy"><p className="eyebrow text-[#9ae672]">VOLLEY WORLD 0{selected.id}</p><h2>{ar ? selected.ar : selected.en}</h2><p>{ar ? selected.arSub : selected.enSub}</p><div className="world-facts"><span><b>{selected.stages}</b>{ar ? "مراحل" : "stages"}</span><span><b>1</b>{ar ? "معركة زعيم نهائية" : "final boss battle"}</span></div><a href={`/${lang}/play#volley`} className="header-cta inline-flex">{ar ? "جرّب VOLLEY" : "PLAY VOLLEY TRIAL"}</a></div>
          </div>
        </div>
      )}
    </>
  );
}
