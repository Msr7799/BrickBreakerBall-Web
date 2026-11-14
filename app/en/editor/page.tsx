import type { Metadata } from "next";
import StageGalleryPage from "@/components/StageGalleryPage";
export const metadata: Metadata = { title: "Stage Lab — 160 Stages", description: "Explore and playtest all 160 current campaign stages with the game's real ball artwork and strength profiles." };
export default function Page() { return <StageGalleryPage lang="en" />; }
