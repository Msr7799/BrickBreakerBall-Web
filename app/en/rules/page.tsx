import type { Metadata } from "next";
import RulesPage from "@/components/RulesPage";
export const metadata: Metadata = { title: "Game Rules" };
export default function Page() { return <RulesPage lang="en" />; }
