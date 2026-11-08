import type { Metadata } from "next";
import TermsPage from "@/components/TermsPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Brick Breaker Ball Terms of Service: gameplay, in-app purchases, advertising, privacy and consumer rights.",
  alternates: {
    canonical: "/en/terms",
    languages: { en: "/en/terms", ar: "/ar/terms", "x-default": "/terms" },
  },
};
export default function Page() { return <TermsPage lang="en" />; }
