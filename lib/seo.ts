import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bricks-breaker-ball.vercel.app";
export const SITE_NAME = "Brick Breaker Ball";
export const DEFAULT_DESCRIPTION =
  "Discover Brick Breaker Ball, a fantasy Android arcade adventure featuring Classic and Volley modes, 185 stages, nine Volley worlds, and epic boss battles.";

type Locale = "en" | "ar";

export function localizedMetadata({
  title,
  description,
  locale,
  path,
  image = "/game/site/marketing/landscape-promo.png",
}: {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  image?: string;
}): Metadata {
  const canonical = `/${locale}${path}`;
  const alternatePath = (lang: Locale) => `/${lang}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: alternatePath("en"),
        ar: alternatePath("ar"),
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      locale: locale === "ar" ? "ar_BH" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_BH"],
      images: [{ url: image, width: 1536, height: 1024, alt: "Brick Breaker Ball game artwork" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
