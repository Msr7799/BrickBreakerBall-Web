import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bricks-breaker-ball.vercel.app";
export const SITE_NAME = "Brick Breaker Ball";
export const DEFAULT_DESCRIPTION =
  "Discover Brick Breaker Ball for Android: aim volleys through 90 stages across nine worlds and face a boss at the end of each world.";

type Locale = "en" | "ar";

export function localizedMetadata({
  title,
  description,
  locale,
  path,
  image = "/game/site/optimized/bosses/9.webp",
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
      images: [{ url: image, alt: "Brick Breaker Ball Volley boss artwork" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
