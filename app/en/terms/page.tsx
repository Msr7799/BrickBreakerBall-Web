import TermsPage from "@/components/TermsPage";
import { localizedMetadata } from "@/lib/seo";

export const metadata = localizedMetadata({
  title: "Terms of Service",
  description: "Review the terms for Brick Breaker Ball, including digital purchases, advertising, gameplay progress, privacy and acceptable use.",
  locale: "en",
  path: "/terms",
});
export default function Page() { return <TermsPage lang="en" />; }
