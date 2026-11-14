"""Check the self-contained published gallery without launching a server."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public/volley"
manifest = json.loads((PUBLIC / "sync-manifest.json").read_text())
for relative, expected in manifest["files"].items():
    path = PUBLIC / relative
    assert path.is_file(), relative
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, relative
index = json.loads((PUBLIC / "stage-gallery-data.json").read_text())
assert index["assetBase"] == "/volley/assets/"
assert len(index["stages"]) == 160
assert index["totalActiveBricks"] == sum(s["brickCount"] for s in index["stages"])
assert index["runtimeSha256"] == manifest["runtimeSha256"]
boss_count = 0
for stage in index["stages"]:
    code = (PUBLIC / stage["file"]).read_text().replace("\r\n", "\n")
    encoded = code[len("window.VolleyGallery.registerStage("):-3]
    assert hashlib.sha256(encoded.encode()).hexdigest() == stage["sha256"]
    data = json.loads(encoded)
    assert len(data["bricks"]) == stage["brickCount"]
    if stage["id"] == 28:
        stone = next(b for b in data["bricks"] if b["id"] == 6)
        assert stone["kind"] == "BLOCKER" and not stone["gate"] and stone["hp"] == [None, None, None]
    guards = [b for b in data["bricks"] if b["shieldLock"]]
    bosses = [b for b in data["bricks"] if b["kind"] == "BOSS"]
    if stage["boss"]:
        boss_count += 1
        expected = 2 if stage["world"] <= 3 else 3 if stage["world"] <= 6 else 4
        assert len(bosses) == 1 and len(guards) == expected == data["bossGuards"]
        assert bosses[0]["y"] >= max(b["y"] + b["h"] for b in data["bricks"] if b["kind"] != "BOSS") + 79.99
    else:
        assert not guards and not bosses
assert boss_count == 9
balls = json.loads((PUBLIC / "gallery/balls-catalog.js").read_text().split(" = ", 1)[1].strip().removesuffix(";"))
assert len(balls["balls"]) == 165
starter = next(b for b in balls["balls"] if b["id"] == "41_pearl_white")
assert starter["rarity"] == "NORMAL" and starter["profile"]["baseHitDamage"] == 1 and starter["profile"]["startingBalls"] == 0
for ball in balls["balls"]:
    assert (PUBLIC / "assets" / ball["path"]).is_file()
for path in index["images"]:
    assert (PUBLIC / "assets" / path).is_file()
html = (PUBLIC / "stage-gallery.html").read_text(encoding="utf-8")
assert "ball-picker-trigger" in html and "camera-pan" in html
for path in re.findall(r'(?:src|href)="(gallery/[^"?]+\.(?:js|css))"', html):
    assert (PUBLIC / path).is_file(), path
assert "../../app/src/main/assets/" not in (PUBLIC / "gallery/catalog.js").read_text()
assert 'src="/volley/stage-gallery.html"' in (ROOT / "components/StageGalleryPage.tsx").read_text()
for lang in ("en", "ar"):
    page = (ROOT / f"app/{lang}/editor/page.tsx").read_text(encoding="utf-8")
    assert "StageGalleryPage" in page and "VolleyLevelEditor" not in page
for path in ("components/VolleyLevelEditor.tsx", "components/SpriteSheetCutter.tsx", "app/editor.css"):
    assert not (ROOT / path).exists(), path
print(f"WEB_GALLERY_OK: 160 complete stages, 165 image ball choices, {manifest['images']} referenced images, {len(manifest['files'])} file hashes and both replacement routes")
