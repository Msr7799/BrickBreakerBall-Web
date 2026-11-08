import TermsPage from "@/components/TermsPage";
import { localizedMetadata } from "@/lib/seo";

export const metadata = localizedMetadata({
  title: "شروط وأحكام الاستخدام",
  description: "تعرّف على شروط استخدام لعبة Brick Breaker Ball ومشتريات Google Play والإعلانات وتقدّم اللعب والخصوصية.",
  locale: "ar",
  path: "/terms",
});
export default function Page() { return <TermsPage lang="ar" />; }
