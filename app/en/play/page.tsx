import PlayPage from "@/components/PlayPage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "Gameplay and Game Modes", description: "See how Classic paddle gameplay and Volley ricochet stages work in Brick Breaker Ball for Android.", locale: "en", path: "/play" });
export default function Page() { return <PlayPage lang="en" />; }
