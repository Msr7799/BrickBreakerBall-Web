import type { Metadata } from "next";
import RulesPage from "@/components/RulesPage";
export const metadata: Metadata = { title: "قوانين اللعبة" };
export default function Page() { return <RulesPage lang="ar" />; }
