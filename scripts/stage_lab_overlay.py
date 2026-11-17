"""Reapply website-owned Stage Lab evolution after Android gallery regeneration.

Exact anchors deliberately fail on source drift; never silently discard fixes.
"""
from pathlib import Path
import re

WEB_LAB_ASSETS = {"gallery/lab-evolution.js", "gallery/lab-evolution.css",
                  "gallery/rpg-brick-lab.js", "gallery/rpg-brick-lab.css",
                  "gallery/grass-seams.js"}


def _swap(text, old, replacement, count=1):
    if replacement in text:
        return text
    actual = text.count(old)
    if actual != count:
        raise RuntimeError(f"Stage Lab source drift: expected {count} occurrences, saw {actual}. Review Android generator before publishing.")
    return text.replace(old, replacement)


def augment_generated_html(html):
    if 'id="lab-world-preset"' not in html:
        fragment = (Path(__file__).parent / "stage-lab-controls.html").read_text(encoding="utf-8").rstrip("\n")
        html = _swap(html, '          <div id="play-ball-stats" class="stats"></div>',
            '          <div id="play-ball-stats" class="stats"></div>\n' + fragment)
        html, n = re.subn(r'(<link rel="stylesheet" href="gallery/gallery\.css(?:\?[^"]*)?" />)',
            r'\1\n    <link rel="stylesheet" href="gallery/lab-evolution.css" />', html)
        if n != 1: raise RuntimeError("Gallery CSS anchor missing")
        html, n = re.subn(r'(<script defer src="gallery/app\.js(?:\?[^"]*)?"></script>)',
            r'\1\n    <script defer src="gallery/lab-evolution.js"></script>', html)
        if n != 1: raise RuntimeError("Gallery JS anchor missing")
    if 'id="rpg-brick-library"' not in html:
        fragment = (Path(__file__).parent / "rpg-brick-showcase.html").read_text(encoding="utf-8").rstrip("\n")
        html = _swap(html,
            '            <output id="lab-evolution-status" aria-live="polite"></output>\n          </section>',
            '            <output id="lab-evolution-status" aria-live="polite"></output>\n          </section>\n' + fragment)
        html, n = re.subn(r'(<link rel="stylesheet" href="gallery/lab-evolution\.css(?:\?[^"]*)?" />)',
            r'\1\n    <link rel="stylesheet" href="gallery/rpg-brick-lab.css" />', html)
        if n != 1: raise RuntimeError("RPG brick CSS anchor missing")
        html, n = re.subn(r'(<script defer src="gallery/lab-evolution\.js(?:\?[^"]*)?"></script>)',
            r'\1\n    <script defer src="gallery/rpg-brick-lab.js"></script>', html)
        if n != 1: raise RuntimeError("RPG brick JS anchor missing")
    # Load the seamless-grass helper before renderer.js on every regenerated gallery.
    if 'gallery/grass-seams.js' not in html:
        html, n = re.subn(r'(<script defer src="gallery/renderer\.js(?:\?[^"]*)?"></script>)',
            r'<script defer src="gallery/grass-seams.js"></script>\n    \1', html)
        if n != 1: raise RuntimeError("Grass seam loader anchor missing")
    # Visual-only concept overlays must never appear over original levels by default.
    html = html.replace('id="rpg-preview-enabled" type="checkbox" checked',
        'id="rpg-preview-enabled" type="checkbox"')
    html = html.replace('See the selected look inside the CURRENT stage, without replacing its saved geometry.',
        'Preview new looks only when selected. Default is the authentic stage with unchanged saved geometry.')
    return html


def augment_generated_asset(relative, raw):
    if relative not in {"gallery/play-engine.js", "gallery/playtest.js", "gallery/renderer.js", "gallery/app.js"}:
        return raw
    code = raw.decode("utf-8").replace("\r\n", "\n")
    if relative == "gallery/play-engine.js":
        code = _swap(code, "      this.profile = null;", "      // Legacy ball abilities are a sandbox-only experiment, never reference parity.\n      this.profile = options.experimental && options.profile ? options.profile : null;", 1)
    if relative == "gallery/play-engine.js":
        code = _swap(code, "      this.shotgun = false;", "      // Reference campaign intentionally forces straight. Shotgun is opt-in here.\n      this.shotgun = Boolean(options.experimental && options.shotgun);", 1)
    if relative == "gallery/playtest.js":
        code = _swap(code, "  $(\"play-pattern\").disabled = true;\n  $(\"play-pattern\").value = \"straight\";\n", "  const experimental = $(\"experimental-abilities\").checked;\n  $(\"play-pattern\").disabled = !experimental;\n  if (!experimental) $(\"play-pattern\").value = \"straight\";\n", 1)
    if relative == "gallery/playtest.js":
        code = _swap(code, "    `Player level ${level} | ${count} balls | ${$(\"play-hit\").value} damage / hit | No Orbs | Cosmetic ball`;", "    `Level ${level} · ${count} balls · ${$(\"play-hit\").value} hit · No ORBs · ${experimental ? \"EXPERIMENTAL Shotgun / no Android parity\" : \"Reference combat / cosmetic ball\"}${experimental ? \" · \" + (ball.profile?.kind || \"normal\") : \"\"}`;", 1)
    if relative == "gallery/playtest.js":
        code = _swap(code, "      shotgun: $(\"play-pattern\").value === \"shotgun\",", "      shotgun: $(\"play-pattern\").value === \"shotgun\",\n      experimental: $(\"experimental-abilities\").checked,", 1)
    if relative == "gallery/playtest.js":
        code = _swap(code, "      \"play-radius\",\n    ])", "      \"play-radius\",\n      \"play-pattern\",\n      \"experimental-abilities\",\n      \"enhanced-bricks\",\n    ])", 2)
    if relative == "gallery/renderer.js":
        code = _swap(code, "    class: \"piece\" + (selected === b.id ? \" selected\" : \"\"),", "    class: \"piece\" + (selected === b.id ? \" selected\" : \"\") +\n      ($(\"enhanced-bricks\")?.checked ? \" lab-enhanced-piece\" : \"\"),", 1)
    if relative == "gallery/renderer.js" and 'class: "lab-brick-rim"' not in code:
        code = _swap(code, "  if ($(\"special-only\").checked && !regular.has(b.kind))", "  // Original, collision-accurate vector treatment over existing owned sprites.\n  // Never replace authored polygon geometry or borrow unlicensed RPG artwork.\n  if ($(\"enhanced-bricks\")?.checked) {\n    const accent = ({\n      BURN: \"#ffad57\", ICE: \"#9cddff\", ICE_FREEZE: \"#79ecff\",\n      GRASS: \"#98e98d\", SAND: \"#efcd8b\", BLACK: \"#b9bad9\",\n      TELEPORT: \"#d9a4ff\", VORTEX: \"#a1caff\", PROTECTOR: \"#85f4d2\",\n      DYNAMITE: \"#ffb56b\", ROTATING: \"#e2caff\", BOSS: \"#ffd18c\",\n      SPIKE_TRAP: \"#ff9b9b\", TORCH: \"#ffac70\", SLIDER: \"#8ccaf0\",\n    })[b.kind] || \"#a6c3da\";\n    group.append(el(\"polygon\", {\n      points: shapePoints(b, dy), fill: \"none\", stroke: accent,\n      \"stroke-width\": b.kind === \"BOSS\" ? 5 : 2.8,\n      \"stroke-linejoin\": \"round\", \"pointer-events\": \"none\",\n      class: \"lab-brick-rim\" + ([\"BURN\", \"TELEPORT\", \"VORTEX\", \"ICE_FREEZE\", \"BOSS\"].includes(b.kind) ? \" lab-brick-arcane\" : \"\"),\n    }));\n  }\n  if ($(\"special-only\").checked && !regular.has(b.kind))", 1)
    if relative == "gallery/renderer.js":
        code = _swap(code,
            '  if ($("special-only").checked && !regular.has(b.kind))',
            '  // Visual-only recovered RPG prototype; it never replaces source brick state or colliders.\n  if (window.RpgBrickLab) window.RpgBrickLab.decorateBrick(group, b, dy);\n  if ($("special-only").checked && !regular.has(b.kind))')
    if relative == "gallery/app.js":
        code = _swap(code, '    currentStage = st;',
            '    currentStage = st;\n    if (window.RpgBrickLab) {\n      window.RpgBrickLab.refresh(st);\n      window.RpgBrickLab.status();\n    }')
    if relative == "gallery/renderer.js":
        code = _swap(code, "    if (layer.crop) {", "    // Crop the brown soil BASE of touching grass squares, not the foliage or hitbox.\n    // End-of-stack squares still use the complete original sprite.\n    if (window.GrassSeams?.isEligibleImage(b, layer)) {\n      const meta = gallery.images[layer.path];\n      const frame = window.GrassSeams.visualFrame(b, layer, currentStage.bricks, meta);\n      const viewport = el(\"svg\", {\n        x, y, width: layer.width, height: frame.height,\n        viewBox: frame.viewBox, preserveAspectRatio: \"none\",\n        class: \"grass-square-sprite\",\n        \"data-full-height\": layer.height,\n        \"data-source-width\": meta.width,\n        \"data-source-height\": meta.height,\n        \"data-trimmed\": String(frame.trim),\n      });\n      viewport.append(imageNode(layer.path, {\n        x: 0, y: 0, width: meta.width, height: meta.height,\n      }));\n      group.append(viewport);\n    } else if (layer.crop) {")
    if relative == "gallery/playtest.js":
        code = _swap(code, "    for (const b of state.bricks) {\n      const entry = this.nodes.get(b.id);", "    // Reveal brown edges live when the supporting grass below is destroyed.\n    if (window.GrassSeams) window.GrassSeams.syncLive(this.nodes, state.bricks);\n    for (const b of state.bricks) {\n      const entry = this.nodes.get(b.id);")
    return code.encode("utf-8")
