import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Brick Breaker Ball",
    template: "%s | Brick Breaker Ball"
  },
  description: "Break through 90 stages across 13 worlds in Brick Breaker Ball. Play the web edition, explore the rules, cosmetics and game systems.",
  icons: { icon: "/game/branding/app-icon.png" },
  openGraph: {
    title: "Brick Breaker Ball",
    description: "90 stages. 13 worlds. 60 collectible balls. Play in your browser.",
    images: ["/game/branding/app-icon.png"],
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
