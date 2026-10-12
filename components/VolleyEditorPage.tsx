import PageShell from "@/components/PageShell";
import VolleyLevelEditor from "@/components/VolleyLevelEditor";
import type { Lang } from "@/lib/site";

export default function VolleyEditorPage({ lang }: { lang: Lang }) {
  return <PageShell lang={lang}><main><VolleyLevelEditor lang={lang} /></main></PageShell>;
}
