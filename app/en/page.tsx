import HomePage from "@/components/HomePage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({
  title: "Classic & Volley Android Game",
  description: "Play Brick Breaker Ball: master paddle-and-ball Classic stages or launch tactical volleys across nine worlds and boss battles. Get it on Google Play.",
  locale: "en",
  path: "",
});
export default function Page() { return <HomePage lang="en" />; }
