import SiteHeader from "@/components/SiteHeader";
import type { Lang } from "@/lib/site";
import stageLabManifest from "@/public/volley/sync-manifest.json";

export default function StageGalleryPage({ lang }: { lang: Lang }) {
  return (
    <div className="stage-lab-page" lang={lang}>
      <SiteHeader lang={lang} />
      <main className="stage-lab-workspace">
        <iframe
          className="stage-lab-frame"
          src={`/volley/stage-gallery.html?v=${stageLabManifest.viewerRevision}`}
          title="Brick Breaker Ball — 160-stage campaign playtest"
          allow="fullscreen"
        />
      </main>
    </div>
  );
}
