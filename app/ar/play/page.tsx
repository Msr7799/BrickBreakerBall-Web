import PlayPage from "@/components/PlayPage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({ title: "شرح اللعب وأنماط اللعبة", description: "تعرّف على أسلوب اللعب الكلاسيكي بالمضرب ومراحل Volley القائمة على التصويب والارتداد في Brick Breaker Ball لأندرويد.", locale: "ar", path: "/play" });
export default function Page() { return <PlayPage lang="ar" />; }
