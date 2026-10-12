import PrivacyPage from "@/components/PrivacyPage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "Privacy Policy", description: "Read the Brick Breaker Ball privacy policy and learn how information is handled when you use the game and website.", locale: "en", path: "/privacy" });
export default function Page() { return <PrivacyPage lang="en" />; }
