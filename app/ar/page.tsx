import HomePage from "@/components/HomePage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({
  title: "Brick Breaker Ball — لعبة الفولي على أندرويد",
  description: "اكتشف Brick Breaker Ball لأندرويد: 90 مرحلة فولي عبر تسعة عوالم ومعركة زعيم في نهاية كل عالم. حمّلها من Google Play.",
  locale: "ar",
  path: "",
});
export default function Page() { return <HomePage lang="ar" />; }
