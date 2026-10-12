import PrivacyPage from "@/components/PrivacyPage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "سياسة الخصوصية", description: "اطّلع على سياسة الخصوصية الخاصة بموقع ولعبة Brick Breaker Ball وكيفية التعامل مع المعلومات.", locale: "ar", path: "/privacy" });
export default function Page() { return <PrivacyPage lang="ar" />; }
