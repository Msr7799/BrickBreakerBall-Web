import type { Metadata } from "next";
import VolleyEditorPage from "@/components/VolleyEditorPage";
export const metadata: Metadata = { title: "Volley Level Editor" };
export default function Page() { return <VolleyEditorPage lang="en" />; }
