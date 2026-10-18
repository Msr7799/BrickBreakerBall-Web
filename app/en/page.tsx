import HomePage from "@/components/HomePage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({
  title: "Volley Android Game — 90 Stages",
  description: "Play Brick Breaker Ball: launch tactical volleys across 90 stages, nine worlds and boss battles. Get it on Google Play.",
  locale: "en",
  path: "",
});
export default function Page() { return <HomePage lang="en" />; }
