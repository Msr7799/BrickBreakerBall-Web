import type { Metadata } from "next";
import StageGalleryPage from "@/components/StageGalleryPage";
export const metadata: Metadata = { title: "تجربة المراحل — 160 مرحلة", description: "استعرض وجرب المراحل الحالية مع صور الكور وقوتها الفعلية." };
export default function Page() { return <StageGalleryPage lang="ar" />; }
