"""Reapply website-owned Stage Lab evolution after Android gallery regeneration.

Exact anchors deliberately fail on source drift; never silently discard fixes.
"""
from pathlib import Path
import re

WEB_LAB_ASSETS = {"gallery/lab-evolution.js", "gallery/lab-evolution.css",
                  "gallery/rpg-brick-lab.js", "gallery/rpg-brick-lab.css",
                  "gallery/grass-seams.js", "gallery/rpg-effects.js",
                  "gallery/rpg-effects.css"}


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
    if 'gallery/rpg-effects.css' not in html:
        html, n = re.subn(r'(<link rel="stylesheet" href="gallery/rpg-brick-lab\.css(?:\?[^"]*)?" />)',
            r'\1\n    <link rel="stylesheet" href="gallery/rpg-effects.css" />', html)
        if n != 1: raise RuntimeError("Missing RPG effect CSS anchor")
    if 'gallery/rpg-effects.js' not in html:
        html, n = re.subn(r'(<script defer src="gallery/play-engine\.js(?:\?[^"]*)?"></script>)',
            r'<script defer src="gallery/rpg-effects.js"></script>\n    \1', html)
        if n != 1: raise RuntimeError("Missing RPG effect JS anchor")
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
    if relative == "gallery/play-engine.js":
        code = _swap(code, "    applyDamage(b, amount, { fire = false, opening = false } = {}) {\n      if (b.health <= 0 || !Number.isFinite(b.health)) return;", "    applyDamage(b, amount, { fire = false, opening = false } = {}) {\n      if (b.health <= 0 || !Number.isFinite(b.health)) return;\n      // Recovered wooden/rust Alt_Blocker: open on turn 1, closed on turn 2,\n      // and toggle with every row descent. Source scene, not generic BLOCKER.\n      if (b.sourceScene?.includes(\"/Blocker/Alt_Blocker/\") && this.turn % 2 === 0) {\n        this.message = \"Alternating gate CLOSED — wait for the next descent.\";\n        return;\n      }")
    if relative == "gallery/play-engine.js":
        code = _swap(code, "  const P =\n    typeof module === \"object\" && module.exports\n      ? require(\"./physics.js\")\n      : root.VolleyPhysics;", "  const P =\n    typeof module === \"object\" && module.exports\n      ? require(\"./physics.js\")\n      : root.VolleyPhysics;\n  const H =\n    typeof module === \"object\" && module.exports\n      ? require(\"./rpg-effects.js\")\n      : root.RpgSourceEffects;")
    if relative == "gallery/play-engine.js":
        code = _swap(code, "      for (const ball of this.balls) {\n        if (ball.alive) {\n          ball.portal = Math.max(0, ball.portal - dt);\n          this.move(ball, dt);\n        }\n      }", "      for (const ball of this.balls) {\n        if (!ball.alive) continue;\n        if (ball.vortexRemaining > 0) {\n          ball.vortexRemaining = Math.max(0,ball.vortexRemaining-dt);\n          if (ball.vortexRemaining <= 0) ball.alive = false;\n          continue; // Godot 0.4s shrink/fade tween, then kill_ball()\n        }\n        ball.portal = Math.max(0, ball.portal - dt);\n        this.move(ball, dt);\n      }")
    if relative == "gallery/play-engine.js":
        code = _swap(code, "        if (b?.kind === \"VORTEX\") {\n          if (this.elapsed % 6 < 2) {\n            ball.alive = false;\n            return;\n          }\n          ignored.add(b.id);\n          continue;\n        }\n        if (b?.kind === \"SPIKE_TRAP\" && b.spikeCooldown <= 0) {\n          b.spikeCooldown = 10;\n          ball.alive = false;\n          return;\n        }", "        if (b?.kind === \"VORTEX\") {\n          if (H.vortexActive(b.sourceScene,this.elapsed)) {\n            Object.assign(ball,center(b));\n            ball.vx=0;ball.vy=0;\n            ball.vortexRemaining=H.VORTEX_ABSORB;\n            return;\n          }\n          ignored.add(b.id);\n          continue;\n        }\n        if (b?.kind === \"SPIKE_TRAP\" && H.spikeArmed(b.spikeCooldown,this.elapsed)) {\n          b.spikeCooldown = H.SPIKE_REARM;\n          ball.alive = false;\n          this.particles.push({...center(b),life:.16});\n          return;\n        }")
    if relative == "gallery/renderer.js":
        code = _swap(code, "function brickNode(b, dy) {", "/**\n * The authored sourceScene, not the broad material family, determines special art.\n * These source-effect overlays are original vector art and never change hitboxes.\n */\nfunction sourceBrickEffectNode(b, dy) {\n  const isSpike = b.kind === \"SPIKE_TRAP\";\n  const isVortex = b.kind === \"VORTEX\";\n  const isAlt = b.sourceScene?.includes(\"/Blocker/Alt_Blocker/\");\n  if (!isSpike && !isVortex && !isAlt) return null;\n  const x=b.x, y=1720-b.y-b.h+dy, w=b.w, h=b.h;\n  const fx=el(\"g\",{class:\"rpg-source-special\", \"pointer-events\":\"none\"});\n  if (isSpike) {\n    const tines=el(\"g\",{class:\"rpg-spike-tines\"});\n    const base=el(\"rect\",{x:x+w*.09,y:y+h*.76,width:w*.82,height:h*.14,rx:2,\n      fill:\"#372c3c\",stroke:\"#ff8676\",\"stroke-width\":2});\n    tines.append(base);\n    for(let i=0;i<5;i++){\n      const a=x+w*(.1+i*.16),b=a+w*.12;\n      tines.append(el(\"polygon\",{points:`${a},${y+h*.79} ${(a+b)/2},${y+h*.19} ${b},${y+h*.79}`,\n        fill:i%2?\"#bfd6e2\":\"#f0dce0\",stroke:\"#8a3e54\",\"stroke-width\":1.8}));\n    }\n    fx.append(tines);\n  }\n  if (isVortex) {\n    const ice=b.sourceScene?.includes(\"/Ice1_Vortex/\"),\n      black=b.sourceScene?.includes(\"/Black1_vortex/\");\n    const color=ice?\"#80dfff\":black?\"#bf99ff\":\"#ffc77a\";\n    const rings=el(\"g\",{class:\"rpg-vortex-rings\"});\n    [0.34,0.23,0.12].forEach((scale,i)=>rings.append(el(\"circle\",{\n      cx:x+w/2,cy:y+h/2,r:Math.min(w,h)*scale,fill:\"none\",\n      stroke:color,\"stroke-width\":i?2.5:3.5,\n      \"stroke-dasharray\":i?\"10 7\":\"16 6\",opacity:i?.75:.95\n    })));\n    rings.append(el(\"circle\",{cx:x+w/2,cy:y+h/2,r:Math.min(w,h)*.08,\n      fill:color,opacity:.8}));\n    fx.append(rings);\n  }\n  if (isAlt) {\n    const wooden=b.sourceScene.includes(\"wooden\"), color=wooden?\"#ab7950\":\"#b1a1a0\",\n      rim=wooden?\"#e2be7e\":\"#d0c1ae\";\n    const bars=el(\"g\",{class:\"rpg-alt-shutters\",\"data-gate-open\":\"true\"});\n    const left=el(\"rect\",{x:x+w*.08,y:y+h*.12,width:w*.4,height:h*.76,\n      rx:2,fill:color,stroke:rim,\"stroke-width\":3,\n      class:\"rpg-alt-left\",transform:`translate(${-w*.3} 0)`,opacity:.30});\n    const right=el(\"rect\",{x:x+w*.52,y:y+h*.12,width:w*.4,height:h*.76,\n      rx:2,fill:color,stroke:rim,\"stroke-width\":3,\n      class:\"rpg-alt-right\",transform:`translate(${w*.3} 0)`,opacity:.30});\n    bars.append(left,right);fx.append(bars);\n  }\n  return fx;\n}\nfunction brickNode(b, dy) {")
    if relative == "gallery/renderer.js":
        code = _swap(code, "  // Original, collision-accurate vector treatment", "  const sourceEffect = sourceBrickEffectNode(b, dy);\n  if (sourceEffect) group.append(sourceEffect);\n  // Original, collision-accurate vector treatment")
    if relative == "gallery/playtest.js":
        code = _swap(code, "      const shield = entry.node.querySelector(\".boss-shield\");", "      // Exact recovered source timings, derived from the actual sourceScene.\n      const spikes = entry.node.querySelector(\".rpg-spike-tines\");\n      if (spikes) {\n        const strength = window.RpgSourceEffects.spikeVisualStrength(b.spikeCooldown, state.elapsed);\n        spikes.style.opacity = String(strength);\n        spikes.setAttribute(\"transform\", `translate(0 ${(1 - strength) * b.h * .35})`);\n      }\n      const vortex = entry.node.querySelector(\".rpg-vortex-rings\");\n      if (vortex) {\n        const active = window.RpgSourceEffects.vortexActive(b.sourceScene, state.elapsed);\n        vortex.style.opacity = active ? \"1\" : \".12\";\n        vortex.setAttribute(\"data-active\", String(active));\n      }\n      const gate = entry.node.querySelector(\".rpg-alt-shutters\");\n      if (gate) {\n        const open = state.turn % 2 === 1;\n        const panels = [gate.querySelector(\".rpg-alt-left\"),gate.querySelector(\".rpg-alt-right\")];\n        panels.forEach((panel,index)=>{\n          if (!panel) return;\n          panel.style.transform = `translateX(${open ? (index ? 1 : -1) * b.w * .30 : 0}px)`;\n          panel.style.opacity = open ? \".30\" : \".94\";\n        });\n        gate.setAttribute(\"data-gate-open\",String(open));\n      }\n      const shield = entry.node.querySelector(\".boss-shield\");")
    if relative == "gallery/playtest.js":
        code = _swap(code, "      node.setAttribute(\"transform\", `translate(${b.x} ${1720 - b.y})`);", "      const drained = b.vortexRemaining > 0;\n      const scale = drained ? Math.max(.1,b.vortexRemaining / window.RpgSourceEffects.VORTEX_ABSORB) : 1;\n      node.setAttribute(\"transform\", `translate(${b.x} ${1720 - b.y}) scale(${scale})`);\n      node.style.opacity = drained ? String(.2 + .8 * scale) : \"1\";")
    return code.encode("utf-8")
