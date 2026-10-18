import PlayPage from "@/components/PlayPage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "جرّب أسلوب لعب الفولي", description: "جرّب تصويب الفولي وارتداد الكرات في معاينة تفاعلية قبل تحميل Brick Breaker Ball لأندرويد.", locale: "ar", path: "/play" });
export default function Page() { return <PlayPage lang="ar" />; }
