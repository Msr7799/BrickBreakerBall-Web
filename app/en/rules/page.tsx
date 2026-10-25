import RulesPage from "@/components/RulesPage";
import "@/app/rules.css";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "Volley Game Rules", description: "Read Brick Breaker Ball's Volley controls, objectives, special bricks, boss battles and 90-stage campaign guide.", locale: "en", path: "/rules" });
export default function Page() { return <RulesPage lang="en" />; }
