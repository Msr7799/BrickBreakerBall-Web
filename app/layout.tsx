import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Volley Android Game`,
    template: `%s | ${SITE_NAME}`
  },
  applicationName: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  verification: {
    google: "tedQd55zrvYnRtg8uOcxm7sTuI3AZhKVSyQU-2Gq9pg",
  },
  category: "games",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/game/site/optimized/branding/app-icon-192.webp" },
  openGraph: {
    title: `${SITE_NAME} — Volley Android Game`,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    url: "/en",
    images: [{ url: "/game/site/optimized/bosses/9.webp", alt: "Brick Breaker Ball Volley boss artwork" }],
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_BH"],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: DEFAULT_DESCRIPTION, images: ["/game/site/optimized/bosses/9.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
