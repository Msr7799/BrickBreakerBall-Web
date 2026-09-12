import type { Metadata } from "next";
import PlayPage from "@/components/PlayPage";
export const metadata: Metadata = { title: "Play Online" };
export default function Page() { return <PlayPage lang="en" />; }
