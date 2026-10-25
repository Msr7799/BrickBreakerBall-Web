"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { copy, type Lang } from "@/lib/site";

const items = [
  { file: "site/optimized/screens/volley-tormented-souls.webp", type: "volley", en: "Tormented Souls core", ar: "نواة الأرواح المعذبة" },
  { file: "site/optimized/screens/volley-infernal-gates.webp", type: "volley", en: "Infernal Gates boss", ar: "زعيم بوابات الجحيم" },
  { file: "site/optimized/bosses/1.webp", type: "worlds", en: "Mystery Forest boss", ar: "زعيم الغابة الغامضة" },
  { file: "site/optimized/bosses/2.webp", type: "worlds", en: "Venom Wilds boss", ar: "زعيم براري السموم" },
  { file: "site/optimized/bosses/3.webp", type: "worlds", en: "Aqua Vortex boss", ar: "زعيم دوامة المياه" },
  { file: "site/optimized/bosses/4.webp", type: "worlds", en: "Desert Spirits boss", ar: "زعيم أرواح الصحراء" },
  { file: "site/optimized/bosses/5.webp", type: "worlds", en: "Ice Grave boss", ar: "زعيم قبر الجليد" },
  { file: "site/optimized/bosses/6.webp", type: "worlds", en: "Tormented Souls boss", ar: "زعيم الأرواح المعذبة" },
  { file: "site/optimized/bosses/7.webp", type: "worlds", en: "Moon Light boss", ar: "زعيم ضوء القمر" },
  { file: "site/optimized/bosses/8.webp", type: "worlds", en: "Infernal Gates boss", ar: "زعيم بوابات الجحيم" },
  { file: "site/optimized/bosses/9.webp", type: "worlds", en: "Final Eclipse boss", ar: "زعيم الكسوف الأخير" },
] as const;
type Filter = "all" | "volley" | "worlds";

export default function GalleryLightbox({ lang }: { lang: Lang }) {
  const ar = lang === "ar"; const c = copy[lang];
  const [filter, setFilter] = useState<Filter>("all"); const [active, setActive] = useState<number | null>(null); const [zoom, setZoom] = useState(false); const touch = useRef(0);
  const visible = items.filter(item => filter === "all" || item.type === filter);
  const move = (delta: number) => setActive(current => current === null ? null : (current + delta + visible.length) % visible.length);
  useEffect(() => { if (active === null) return; const key = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); if (e.key === "ArrowRight") move(ar ? -1 : 1); if (e.key === "ArrowLeft") move(ar ? 1 : -1); }; document.body.style.overflow = "hidden"; window.addEventListener("keydown", key); return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", key); }; });
  useEffect(() => { setActive(null); setZoom(false); }, [filter]);

  return (
    <section id="gallery" className="border-y border-white/8 bg-[#080a0f] px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow text-[#ff9d55]">{c.galleryKicker}</p><h2 className="section-title mt-5">{c.galleryTitle}</h2></div><p className="max-w-2xl text-base leading-8 text-white/55 lg:justify-self-end">{c.galleryBody}</p></div>
        <div className="gallery-filters" role="tablist" aria-label={ar ? "تصفية الصور" : "Filter gallery"}>{(["all","volley","worlds"] as Filter[]).map(value => <button key={value} role="tab" aria-selected={filter === value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? (ar ? "الكل" : "ALL") : value === "volley" ? (ar ? "اللعب" : "GAMEPLAY") : (ar ? "العوالم" : "WORLDS")}</button>)}</div>
        <div className="gallery-grid mt-8">{visible.map((item, index) => <button key={item.file} onClick={() => setActive(index)} className={`gallery-item gallery-${index + 1}`} aria-label={`${ar ? item.ar : item.en} — ${ar ? "تكبير" : "open fullscreen"}`}><Image src={`/game/${item.file}`} alt={ar ? item.ar : item.en} width={item.type === "volley" ? (item.file.includes("tormented") ? 513 : 510) : 941} height={item.type === "volley" ? (item.file.includes("tormented") ? 1018 : 942) : 1672} sizes="(max-width: 767px) 100vw, 40vw" loading="lazy" /><span>{ar ? item.ar : item.en}<b>↗</b></span></button>)}</div>
      </div>
      {active !== null && visible[active] && <div className="lightbox" role="dialog" aria-modal="true" aria-label={ar ? visible[active].ar : visible[active].en} onMouseDown={e => { if (e.target === e.currentTarget) setActive(null); }} onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 45) move(dx > 0 ? -1 : 1); }}>
        <button className="modal-close" onClick={() => setActive(null)} aria-label={ar ? "إغلاق" : "Close"}>×</button><button className="lightbox-arrow prev" onClick={() => move(-1)} aria-label={ar ? "السابق" : "Previous"}>‹</button>
        <figure><button className={`lightbox-image ${zoom ? "zoomed" : ""}`} onClick={() => setZoom(v => !v)} aria-label={ar ? "تبديل التكبير" : "Toggle zoom"}><Image src={`/game/${visible[active].file}`} alt={ar ? visible[active].ar : visible[active].en} width={visible[active].type === "volley" ? (visible[active].file.includes("tormented") ? 513 : 510) : 941} height={visible[active].type === "volley" ? (visible[active].file.includes("tormented") ? 1018 : 942) : 1672} sizes="(max-width: 767px) 94vw, 82vw" /></button><figcaption><span>{ar ? visible[active].ar : visible[active].en}</span><button onClick={() => setZoom(v => !v)}>{zoom ? (ar ? "تصغير" : "ZOOM OUT") : (ar ? "تكبير" : "ZOOM IN")}</button></figcaption></figure>
        <button className="lightbox-arrow next" onClick={() => move(1)} aria-label={ar ? "التالي" : "Next"}>›</button>
      </div>}
    </section>
  );
}
