"use client";

import { useEffect, useState } from "react";

export default function SiteEffects() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); }), { threshold: .08, rootMargin: "0px 0px -45px" });
    document.querySelectorAll("main section").forEach(section => { section.classList.add("reveal-section"); reveal.observe(section); });
    const scroll = () => setShowTop(window.scrollY > 800); window.addEventListener("scroll", scroll, { passive: true }); scroll();
    return () => { reveal.disconnect(); window.removeEventListener("scroll", scroll); };
  }, []);
  return <button className={`back-to-top ${showTop ? "visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">↑</button>;
}
