"""Publish the Android project's generated gallery and only its referenced art.

Run after regenerating docs/volley/stage-gallery.html in the Android project.
Does not start a server or build the Android app.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def sync(source):
    gallery = source / "docs/volley"
    assets = source / "app/src/main/assets"
    output = ROOT / "public/volley"
    index = json.loads((gallery / "stage-gallery-data.json").read_text())
    assert len(index["stages"]) == 160
    kotlin = source / "app/src/main/java/com/example/brick_breaker_ball"
    runtime = hashlib.sha256(''.join((kotlin / p).read_text(encoding="utf-8") for p in
        ["campaign/VolleySourceStageData.kt", "campaign/VolleySourceHealth.kt",
         "cosmetics/BallAbilities.kt", "cosmetics/BallCollectionCatalog.kt"]).encode()).hexdigest()
    assert index.get("runtimeSha256") == runtime, "Stale gallery: regenerate it with scripts/generate_volley_stage_gallery.py in the Android project"
    balls_text = (gallery / "gallery/balls-catalog.js").read_text()
    balls = json.loads(balls_text.split(" = ", 1)[1].strip().removesuffix(";"))
    files = {"stage-gallery.html", "stage-gallery-data.json"}
    html = (gallery / "stage-gallery.html").read_text(encoding="utf-8")
    files.update(re.findall(r'(?:src|href)="(gallery/[^"?]+\.(?:js|css))"', html))
    files.update(row["file"] for row in index["stages"])
    referenced_art = set(index["images"]) | {ball["path"] for ball in balls["balls"]}
    hashes = {}

    def write(relative, data):
        target = output / relative
        assert target.resolve().is_relative_to(output.resolve())
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        hashes[relative] = hashlib.sha256(data).hexdigest()

    for relative in sorted(files):
        raw = (gallery / relative).read_bytes()
        if relative in ("gallery/catalog.js", "stage-gallery-data.json"):
            raw = raw.replace(index["assetBase"].encode(), b"/volley/assets/")
        write(relative, raw)
    for relative in sorted(referenced_art):
        assert (assets / relative).resolve().is_relative_to(assets.resolve())
        write("assets/" + relative, (assets / relative).read_bytes())
    # Only remove stale files owned by the previous sync manifest, inside this directory.
    previous = output / "sync-manifest.json"
    if previous.exists():
        for relative in json.loads(previous.read_text())["files"]:
            target = (output / relative).resolve()
            assert target.is_relative_to(output.resolve())
            if relative not in hashes and target.is_file():
                target.unlink()
    summary = dict(schema=1, stages=160, balls=len(balls["balls"]), images=len(referenced_art),
                   sourceSha256=index["sourceSha256"], runtimeSha256=index["runtimeSha256"], files=hashes)
    write("sync-manifest.json", (json.dumps(summary, indent=2) + "\n").encode())
    print(f"STAGE_GALLERY_SYNC_OK: {summary['stages']} stages, {summary['balls']} balls, {summary['images']} referenced images, {len(hashes)} files")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("C:/Users/msalr/AndroidStudioProjects/BrickBreakerBall"))
    sync(parser.parse_args().source)
