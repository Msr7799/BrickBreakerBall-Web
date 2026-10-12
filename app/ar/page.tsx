import HomePage from "@/components/HomePage";
import { localizedMetadata } from "@/lib/seo";
export const metadata = localizedMetadata({
  title: "لعبة Brick Breaker Ball بنمطي Classic وVolley",
  description: "اكتشف لعبة Brick Breaker Ball لأندرويد: مراحل كلاسيكية، ونمط Volley التكتيكي، وتسعة عوالم مليئة بالزعماء. حمّلها من Google Play.",
  locale: "ar",
  path: "",
});
export default function Page() { return <HomePage lang="ar" />; }
