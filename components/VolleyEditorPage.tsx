import AdminAuthGate from "@/components/AdminAuthGate";
import PageShell from "@/components/PageShell";
import type { Lang } from "@/lib/site";

export default function VolleyEditorPage({ lang }: { lang: Lang }) {
  return (
    <PageShell lang={lang}>
      <AdminAuthGate lang={lang} />
    </PageShell>
  );
}
