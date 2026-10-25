import PlayPage from "@/components/PlayPage";
import "@/app/play.css";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "Try Volley Gameplay", description: "Try a browser preview of Brick Breaker Ball's Volley aiming and ricochet gameplay before downloading the Android game.", locale: "en", path: "/play" });
export default function Page() { return <PlayPage lang="en" />; }
