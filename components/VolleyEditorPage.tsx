"use client";

import dynamic from "next/dynamic";
import PageShell from "@/components/PageShell";
import type { Lang } from "@/lib/site";

const VolleyLevelEditor = dynamic(
  () => import("@/components/VolleyLevelEditor"),
  { ssr: false, loading: () => null },
);

export default function VolleyEditorPage({ lang }: { lang: Lang }) {
  return (
    <PageShell lang={lang}>
      <main><VolleyLevelEditor lang={lang} /></main>
    </PageShell>
  );
}
