import RulesPage from "@/components/RulesPage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "Game Rules: Classic and Volley", description: "Read the rules, controls, objectives, and special mechanics for both Classic and Volley modes in Brick Breaker Ball.", locale: "en", path: "/rules" });
export default function Page() { return <RulesPage lang="en" />; }
