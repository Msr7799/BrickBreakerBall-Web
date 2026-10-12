import type { Metadata } from "next";
import VolleyEditorPage from "@/components/VolleyEditorPage";
export const metadata: Metadata = { title: "Volley Level Editor", robots: { index: false, follow: false } };
export default function Page() { return <VolleyEditorPage lang="en" />; }
