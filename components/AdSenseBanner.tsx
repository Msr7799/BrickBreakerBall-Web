"use client";

import { useRef } from "react";
import Script from "next/script";
import type { Lang } from "@/lib/site";

const AD_CLIENT = "ca-pub-2259594031936212";
const AD_SLOT = "4152241185";

export default function AdSenseBanner({ lang }: { lang: Lang }) {
  const initialized = useRef(false);

  function showAd() {
    if (initialized.current) return;
    initialized.current = true;
    const adWindow = window as typeof window & { adsbygoogle?: object[] };
    (adWindow.adsbygoogle = adWindow.adsbygoogle || []).push({});
  }

  return (
    <section className="border-y border-white/8 px-5 py-10 sm:px-8" aria-label={lang === "ar" ? "إعلان" : "Advertisement"}>
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-center text-[10px] text-white/45">{lang === "ar" ? "إعلان" : "Advertisement"}</p>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <Script
        id="adsense-loader"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onReady={showAd}
      />
    </section>
  );
}
