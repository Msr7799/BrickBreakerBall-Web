import RulesPage from "@/components/RulesPage";
import "@/app/rules.css";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "قوانين الفولي", description: "اقرأ قوانين الفولي والتصويب والقراميد الخاصة ومعارك الزعماء ودليل الحملة المؤلفة من 90 مرحلة.", locale: "ar", path: "/rules" });
export default function Page() { return <RulesPage lang="ar" />; }
