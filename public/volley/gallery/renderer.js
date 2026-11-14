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
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\.?0+$/, "") + "K";
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
function brickNode(b, dy) {
  const group = el("g", {
    class: "piece" + (selected === b.id ? " selected" : ""),
    "data-id": b.id,
  });
  const cx = b.x + b.w / 2,
    cy = 1720 - b.y - b.h / 2 + dy;
  for (const layer of b.layers) {
    const x = cx + layer.x - layer.width / 2,
      y = cy - layer.y - layer.height / 2;
    if (layer.crop) {
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
          "dominant-baseline": triangle ? "central" : "auto",
        },
        hpText(b.hp[Number($("difficulty").value)]),
      ),
    );
  }
  group.append(el("title", {}, `${b.kind} ? #${b.id} ? ${b.shape}`));
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
function render() {
  const st = currentStage;
  if (!st) return;
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
