import type { Metadata } from "next";
import VolleyEditorPage from "@/components/VolleyEditorPage";
import "@/app/editor.css";
export const metadata: Metadata = { title: "محرر مراحل الفولي" };
export default function Page() { return <VolleyEditorPage lang="ar" />; }
