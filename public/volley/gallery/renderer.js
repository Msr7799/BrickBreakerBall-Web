"use strict";
function el(tag, attrs = {}, text) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}
function asset(path) {
  return gallery.assetBase + path;
}
function imageNode(path, attrs) {
  const n = el("image", { href: asset(path), ...attrs });
  n.addEventListener(
    "error",
    () => {
      $("image-errors").textContent =
        "Image could not be loaded: " +
        path +
        ". Keep this HTML inside docs/volley, or regenerate it.";
    },
    { once: true },
  );
  return n;
}
function badge(text, cls = "") {
  const n = document.createElement("span");
  n.className = "badge " + cls;
  n.textContent = text;
  return n;
}
function hpText(n) {
  if (n === null) return "?";
  n = Math.trunc(n);
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return String(n);
}
function shapePoints(b, dy) {
  const l = b.x,
    r = b.x + b.w,
    t = 1720 - b.y - b.h + dy,
    d = t + b.h;
  return {
    SQ: [
      [l, t],
      [r, t],
      [r, d],
      [l, d],
    ],
    NW: [
      [l, t],
      [r, t],
      [l, d],
    ],
    NE: [
      [l, t],
      [r, t],
      [r, d],
    ],
    SW: [
      [l, t],
      [l, d],
      [r, d],
    ],
    SE: [
      [r, t],
      [l, d],
      [r, d],
    ],
  }[b.shape]
    .map((p) => p.join(","))
    .join(" ");
}
/**
 * The authored sourceScene, not the broad material family, determines special art.
 * These source-effect overlays are original vector art and never change hitboxes.
 */
function sourceBrickEffectNode(b, dy) {
  const isSpike = b.kind === "SPIKE_TRAP";
  const isVortex = b.kind === "VORTEX";
  const isAlt = b.sourceScene?.includes("/Blocker/Alt_Blocker/");
  if (!isSpike && !isVortex && !isAlt) return null;
  const x=b.x, y=1720-b.y-b.h+dy, w=b.w, h=b.h;
  const fx=el("g",{class:"rpg-source-special", "pointer-events":"none"});
  if (isSpike) {
    const tines=el("g",{class:"rpg-spike-tines"});
    const base=el("rect",{x:x+w*.09,y:y+h*.76,width:w*.82,height:h*.14,rx:2,
      fill:"#372c3c",stroke:"#ff8676","stroke-width":2});
    tines.append(base);
    for(let i=0;i<5;i++){
      const a=x+w*(.1+i*.16),b=a+w*.12;
      tines.append(el("polygon",{points:`${a},${y+h*.79} ${(a+b)/2},${y+h*.19} ${b},${y+h*.79}`,
        fill:i%2?"#bfd6e2":"#f0dce0",stroke:"#8a3e54","stroke-width":1.8}));
    }
    fx.append(tines);
  }
  if (isVortex) {
    const ice=b.sourceScene?.includes("/Ice1_Vortex/"),
      black=b.sourceScene?.includes("/Black1_vortex/");
    const color=ice?"#80dfff":black?"#bf99ff":"#ffc77a";
    const rings=el("g",{class:"rpg-vortex-rings"});
    [0.34,0.23,0.12].forEach((scale,i)=>rings.append(el("circle",{
      cx:x+w/2,cy:y+h/2,r:Math.min(w,h)*scale,fill:"none",
      stroke:color,"stroke-width":i?2.5:3.5,
      "stroke-dasharray":i?"10 7":"16 6",opacity:i?.75:.95
    })));
    rings.append(el("circle",{cx:x+w/2,cy:y+h/2,r:Math.min(w,h)*.08,
      fill:color,opacity:.8}));
    fx.append(rings);
  }
  if (isAlt) {
    const wooden=b.sourceScene.includes("wooden"), color=wooden?"#ab7950":"#b1a1a0",
      rim=wooden?"#e2be7e":"#d0c1ae";
    const bars=el("g",{class:"rpg-alt-shutters","data-gate-open":"true"});
    const left=el("rect",{x:x+w*.08,y:y+h*.12,width:w*.4,height:h*.76,
      rx:2,fill:color,stroke:rim,"stroke-width":3,
      class:"rpg-alt-left",transform:`translate(${-w*.3} 0)`,opacity:.30});
    const right=el("rect",{x:x+w*.52,y:y+h*.12,width:w*.4,height:h*.76,
      rx:2,fill:color,stroke:rim,"stroke-width":3,
      class:"rpg-alt-right",transform:`translate(${w*.3} 0)`,opacity:.30});
    bars.append(left,right);fx.append(bars);
  }
  return fx;
}
function brickNode(b, dy) {
  const group = el("g", {
    class: "piece" + (selected === b.id ? " selected" : "") +
      ($("enhanced-bricks")?.checked ? " lab-enhanced-piece" : ""),
    "data-id": b.id,
  });
  const cx = b.x + b.w / 2,
    cy = 1720 - b.y - b.h / 2 + dy;
  if (b.kind === "BOSS" && currentStage.bossGuards > 0)
    group.append(el("ellipse", {cx, cy, rx: b.w * .56, ry: b.h * .56,
      class: "boss-shield", fill: "none", stroke: "#f4cc73", "stroke-width": 4,
      "stroke-dasharray": "12 7", "pointer-events": "none"}));
  for (const layer of b.layers) {
    const x = cx + layer.x - layer.width / 2,
      y = cy - layer.y - layer.height / 2;
    // Crop the brown soil BASE of touching grass squares, not the foliage or hitbox.
    // End-of-stack squares still use the complete original sprite.
    if (window.GrassSeams?.isEligibleImage(b, layer)) {
      const meta = gallery.images[layer.path];
      const frame = window.GrassSeams.visualFrame(b, layer, currentStage.bricks, meta);
      const viewport = el("svg", {
        x, y, width: layer.width, height: frame.height,
        viewBox: frame.viewBox, preserveAspectRatio: "none",
        class: "grass-square-sprite",
        "data-full-height": layer.height,
        "data-source-width": meta.width,
        "data-source-height": meta.height,
        "data-trimmed": String(frame.trim),
      });
      viewport.append(imageNode(layer.path, {
        x: 0, y: 0, width: meta.width, height: meta.height,
      }));
      group.append(viewport);
    } else if (layer.crop) {
      const c = layer.crop,
        outer = el("svg", {
          x,
          y,
          width: layer.width,
          height: layer.height,
          viewBox: `${c.x} ${c.y} ${c.width} ${c.height}`,
          preserveAspectRatio: "none",
        }),
        meta = gallery.images[layer.path];
      outer.append(
        imageNode(layer.path, {
          x: 0,
          y: 0,
          width: meta.width,
          height: meta.height,
        }),
      );
      group.append(outer);
    } else
      group.append(
        imageNode(layer.path, {
          x,
          y,
          width: layer.width,
          height: layer.height,
          preserveAspectRatio: "none",
        }),
      );
  }
  const sourceEffect = sourceBrickEffectNode(b, dy);
  if (sourceEffect) group.append(sourceEffect);
  // Original, collision-accurate vector treatment over existing owned sprites.
  // Never replace authored polygon geometry or borrow unlicensed RPG artwork.
  if ($("enhanced-bricks")?.checked) {
    const accent = ({
      BURN: "#ffad57", ICE: "#9cddff", ICE_FREEZE: "#79ecff",
      GRASS: "#98e98d", SAND: "#efcd8b", BLACK: "#b9bad9",
      TELEPORT: "#d9a4ff", VORTEX: "#a1caff", PROTECTOR: "#85f4d2",
      DYNAMITE: "#ffb56b", ROTATING: "#e2caff", BOSS: "#ffd18c",
      SPIKE_TRAP: "#ff9b9b", TORCH: "#ffac70", SLIDER: "#8ccaf0",
    })[b.kind] || "#a6c3da";
    group.append(el("polygon", {
      points: shapePoints(b, dy), fill: "none", stroke: accent,
      "stroke-width": b.kind === "BOSS" ? 5 : 2.8,
      "stroke-linejoin": "round", "pointer-events": "none",
      class: "lab-brick-rim" + (["BURN", "TELEPORT", "VORTEX", "ICE_FREEZE", "BOSS"].includes(b.kind) ? " lab-brick-arcane" : ""),
    }));
  }
  // Visual-only recovered RPG prototype; it never replaces source brick state or colliders.
  if (window.RpgBrickLab) window.RpgBrickLab.decorateBrick(group, b, dy);
  if ($("special-only").checked && !regular.has(b.kind))
    group.append(
      el("polygon", {
        points: shapePoints(b, dy),
        class: "special-outline",
      }),
    );
  if ($("hitboxes").checked || selected === b.id)
    group.append(
      el("polygon", { points: shapePoints(b, dy), class: "hitbox" }),
    );
  if ($("diagnostics").checked && (b.gate || b.overlap))
    group.append(
      el("rect", {
        x: b.x + 3,
        y: 1720 - b.y - b.h + dy + 3,
        width: Math.max(1, b.w - 6),
        height: Math.max(1, b.h - 6),
        fill: "none",
        stroke: b.gate ? "#ffd56f" : "#ff7999",
        "stroke-width": 3,
        "stroke-dasharray": "7 4",
      }),
    );
  if ($("hp").checked && b.hp[Number($("difficulty").value)] !== null) {
    // Keep numbers inside the solid triangle instead of its empty corner.
    const triangle = b.shape !== "SQ";
    const labelX = triangle
      ? b.x + b.w * (["NE", "SE"].includes(b.shape) ? 2 / 3 : 1 / 3)
      : cx;
    const labelY = triangle
      ? 1720 - b.y - b.h * (["NW", "NE"].includes(b.shape) ? 2 / 3 : 1 / 3) + dy
      : 1720 - b.y - b.h * (b.healthLabelYFraction ?? 0.67) + dy;
    group.append(
      el(
        "text",
        {
          x: labelX,
          y: labelY,
          class: "hp",
          "data-label-width": b.w * (triangle ? .43 : .80),
          "data-label-height": b.h * (triangle ? .25 : .34),
          "dominant-baseline": triangle ? "central" : "auto",
        },
        hpText(b.hp[Number($("difficulty").value)]),
      ),
    );
  }
  group.append(el("title", {}, `${b.kind} / #${b.id} / ${b.shape} / HP ${b.hp[Number($("difficulty").value)] ?? "indestructible"}`));
  group.addEventListener("click", () => {
    if (
      Date.now() < window.stageCamera.suppressClickUntil ||
      (typeof playtest !== "undefined" && playtest.active)
    )
      return;
    selected = b.id;
    inspect(b);
    render();
  });
  return group;
}
function cannonNode(st) {
  const group = el("g", { id: "cannon" });
  const crop = st.cannonCrop;
  const viewport = el("svg", {
    x: 395,
    y: 1286,
    width: 110,
    height: 230,
    viewBox: `${crop.x} ${crop.y} ${crop.width} ${crop.height}`,
    preserveAspectRatio: "xMidYMid meet",
  });
  const meta = gallery.images[st.cannon];
  viewport.append(
    imageNode(st.cannon, {
      x: 0,
      y: 0,
      width: meta.width,
      height: meta.height,
    }),
  );
  group.append(viewport);
  return group;
}
function ballSpriteNode(ball, x, y, radius) {
  const c = ball.crop;
  const node = el("svg", {
    x: x - radius,
    y: y - radius,
    width: radius * 2,
    height: radius * 2,
    viewBox: `${c.x} ${c.y} ${c.w} ${c.h}`,
    preserveAspectRatio: "xMidYMid meet",
    "pointer-events": "none",
  });
  node.append(
    imageNode(ball.path, {
      x: 0,
      y: 0,
      width: ball.sheetWidth,
      height: ball.sheetHeight,
    }),
  );
  return node;
}
function updateBossStatus(locks, alive) {
  const status = $("boss-status");
  status.hidden = !currentStage?.boss;
  if (status.hidden) return;
  const value = alive ? locks > 0 ? `Boss shielded / ${locks} locks remaining` : "All locks broken / Boss vulnerable" : "Boss defeated / Clear remaining targets";
  if (status.textContent !== value) status.textContent = value;
  status.dataset.state = alive && locks > 0 ? "shielded" : "exposed";
}
function render() {
  const st = currentStage;
  if (!st) return;
  $("camera-boss").hidden = !st.boss;
  const board = $("board"),
    dy = Number($("descent").value) * 80;
  board.replaceChildren();

  $("image-errors").textContent = "";
  const top = Math.min(0, ...st.bricks.map((b) => 1720 - b.y - b.h + dy)) - 35;
  board.append(
    el("rect", {
      x: 0,
      y: top,
      width: 900,
      height: 1720 - top,
      fill: "#101820",
    }),
  );
  board.append(
    imageNode(st.background, {
      x: 0,
      y: 0,
      width: 900,
      height: 1720,
      preserveAspectRatio: "xMidYMid slice",
      opacity: 0.7,
    }),
  );
  for (const b of st.bricks) board.append(brickNode(b, dy));
  for (const [y, color, label] of [
    [1420, "#49d8ff", "DANGER ? Y 300"],
    [1602, "#b5f8ff", "RETURN ? Y 118"],
  ]) {
    board.append(
      el("line", {
        x1: 0,
        x2: 900,
        y1: y,
        y2: y,
        stroke: color,
        "stroke-width": 3,
      }),
    );
    board.append(el("text", { x: 12, y: y - 10, class: "line-label" }, label));
  }
  board.append(cannonNode(st));
  const readyBall = el("g", { id: "ready-ball" });
  readyBall.append(ballSpriteNode(selectedPlayBall(), 0, 0, 15));
  readyBall.setAttribute("transform", "translate(450 1286)");
  board.append(readyBall);
  $("descent-label").textContent = `${$("descent").value} turns / ${dy} units`;
  window.stageCamera.configure(st, top, $("view").value === "all");
  if (typeof playtest !== "undefined" && playtest.active) playtest.attach();
}
