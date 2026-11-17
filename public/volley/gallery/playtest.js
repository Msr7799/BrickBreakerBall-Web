"use strict";
// SVG presentation and input only. The independent engine owns simulation state.
const playBalls = window.VolleyGallery.ballCatalog.balls;
function selectedPlayBall() {
  return (
    playBalls.find((b) => b.id === $("play-ball").value) ||
    playBalls.find((b) => b.id === window.VolleyGallery.ballCatalog.default)
  );
}
function syncBallControls(resetBalls = true) {
  const ball = selectedPlayBall();
  const level = Math.max(1, Math.trunc(Number($("play-level").value) || 1));
  if (resetBalls) $("play-balls").value = 10 + Math.min(Math.floor(level / 10), 10);
  $("play-hit").value = Math.floor(1 * (1 + Math.floor(level / 10) * 10 / 100));
  const experimental = $("experimental-abilities").checked;
  $("play-pattern").disabled = !experimental;
  if (!experimental) $("play-pattern").value = "straight";
  const count = Number($("play-balls").value);
  $("play-ball-preview").replaceChildren(ballSpriteNode(ball, 30, 30, 25));
  $("play-ball-stats").textContent =
    `Level ${level} · ${count} balls · ${$("play-hit").value} hit · No ORBs · ${experimental ? "EXPERIMENTAL Shotgun / no Android parity" : "Reference combat / cosmetic ball"}${experimental ? " · " + (ball.profile?.kind || "normal") : ""}`;
}
const playtest = {
  active: false,
  paused: false,
  raf: 0,
  pointer: null,
  start() {
    if (!currentStage) return;
    if (!this.active)
      this.preview = { view: $("view").value, descent: $("descent").value };
    window.stageCamera.setMode("aim");
    window.stageCamera.key = null;
    this.active = true;
    this.paused = false;
    this.pointer = null;
    this.chosen = selectedPlayBall();
    this.engine = new VolleySandbox(currentStage, {
      difficulty: Number($("difficulty").value),
      playerLevel: Number($("play-level").value),
      balls: Number($("play-balls").value),
      hit: Number($("play-hit").value),
      radius: Number($("play-radius").value),
      profile: this.chosen.profile,
      shotgun: $("play-pattern").value === "shotgun",
      experimental: $("experimental-abilities").checked,
    });
    $("view").value = "wave";
    $("descent").value = 0;
    $("frame").setAttribute("class", "frame playing");
    for (const id of [
      "view",
      "descent",
      "difficulty",
      "play-balls",
      "play-hit",
      "play-level",
      "play-radius",
      "play-pattern",
      "experimental-abilities",
      "enhanced-bricks",
    ])
      $(id).disabled = true;
    for (const id of [
      "play-fire",
      "play-pause",
      "play-recall",
      "play-restart",
      "play-exit",
    ])
      $(id).hidden = false;
    $("play-stage").hidden = true;
    $("quick-play").textContent = "Exit test";
    $("play-pause").textContent = "Pause";
    render();
    $("board").focus({ preventScroll: true });
    this.previousTime = null;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame((time) => this.frame(time));
  },
  stop() {
    if (!this.active) return;
    window.stageCamera.setMode("pan");
    this.active = false;
    this.pointer = null;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    for (const id of [
      "view",
      "descent",
      "difficulty",
      "play-balls",
      "play-hit",
      "play-level",
      "play-radius",
      "play-pattern",
      "experimental-abilities",
      "enhanced-bricks",
    ])
      $(id).disabled = false;
    for (const id of [
      "play-fire",
      "play-pause",
      "play-recall",
      "play-restart",
      "play-exit",
    ])
      $(id).hidden = true;
    $("play-stage").hidden = false;
    $("quick-play").textContent = "Play stage";
    $("frame").setAttribute("class", "frame");
    $("view").value = this.preview.view;
    $("descent").value = this.preview.descent;
    $("play-status").textContent =
      "Test ended. Source stage data is unchanged.";
    $("play-stats").textContent = "";
    render();
  },
  attach() {
    this.nodes = new Map();
    this.ballNodes = new Map();
    for (const node of $("board").querySelectorAll(".piece")) {
      this.nodes.set(Number(node.getAttribute("data-id")), {
        node,
        hp: node.querySelector(".hp"),
      });
    }
    this.aimLayer = el("g", { "pointer-events": "none" });
    this.ballLayer = el("g", { "pointer-events": "none" });
    this.fxLayer = el("g", { "pointer-events": "none" });
    $("board").append(this.aimLayer, this.ballLayer, this.fxLayer);
    this.paint();
  },
  frame(time) {
    if (!this.active) return;
    const delta =
      this.previousTime === null
        ? 0
        : Math.min(0.05, (time - this.previousTime) / 1000);
    this.previousTime = time;
    if (!this.paused)
      this.engine.advance(delta * Number($("play-speed").value || 1));
    this.paint();
    this.raf = requestAnimationFrame((next) => this.frame(next));
  },
  paint() {
    const state = this.engine;
    const descent =
      (state.turn - 1) * 80 +
      (state.phase === "descending" ? (state.descentTime / 0.4) * 80 : 0);
    $("descent-label").textContent =
      `${state.turn - 1} completed turns / ${Math.round(descent)} units`;
    // Reveal brown edges live when the supporting grass below is destroyed.
    if (window.GrassSeams) window.GrassSeams.syncLive(this.nodes, state.bricks);
    for (const b of state.bricks) {
      const entry = this.nodes.get(b.id);
      if (!entry) continue;
      entry.node.style.display = b.health > 0 ? "" : "none";
      const transform = `translate(${b.x - b.baseX} ${b.baseY - b.y}) rotate(${-b.angle} ${b.baseX + b.w / 2} ${1720 - b.baseY - b.h / 2})`;
      if (entry.transform !== transform) {
        entry.node.setAttribute("transform", transform);
        entry.transform = transform;
      }
      if (entry.hp && entry.health !== b.health) {
        entry.hp.textContent = hpText(b.health);
        entry.health = b.health;
        window.stageCamera.fitLabel(entry.hp);
      }
      // Exact recovered source timings, derived from the actual sourceScene.
      const spikes = entry.node.querySelector(".rpg-spike-tines");
      if (spikes) {
        const strength = window.RpgSourceEffects.spikeVisualStrength(b.spikeCooldown, state.elapsed);
        spikes.style.opacity = String(strength);
        spikes.setAttribute("transform", `translate(0 ${(1 - strength) * b.h * .35})`);
      }
      const vortex = entry.node.querySelector(".rpg-vortex-rings");
      if (vortex) {
        const active = window.RpgSourceEffects.vortexActive(b.sourceScene, state.elapsed);
        vortex.style.opacity = active ? "1" : ".12";
        vortex.setAttribute("data-active", String(active));
      }
      const gate = entry.node.querySelector(".rpg-alt-shutters");
      if (gate) {
        const open = state.turn % 2 === 1;
        const panels = [gate.querySelector(".rpg-alt-left"),gate.querySelector(".rpg-alt-right")];
        panels.forEach((panel,index)=>{
          if (!panel) return;
          panel.style.transform = `translateX(${open ? (index ? 1 : -1) * b.w * .30 : 0}px)`;
          panel.style.opacity = open ? ".30" : ".94";
        });
        gate.setAttribute("data-gate-open",String(open));
      }
      const shield = entry.node.querySelector(".boss-shield");
      if (shield) shield.style.display = state.remainingGuards > 0 ? "" : "none";
      entry.node.style.filter = b.frozen
        ? "drop-shadow(0 0 7px #8beaff)"
        : b.protected > 0
          ? "drop-shadow(0 0 7px #f6ce64)"
          : "";
    }
    const live = new Set();
    for (const b of state.balls) {
      live.add(b.id);
      let node = this.ballNodes.get(b.id);
      if (!node) {
        node = el("g");
        node.append(
          ballSpriteNode(this.chosen, 0, 0, b.radius),
          el("circle", {
            r: b.radius + 2,
            class: "ball-fire-ring",
            fill: "none",
          }),
        );
        this.ballNodes.set(b.id, node);
        this.ballLayer.append(node);
      }
      const drained = b.vortexRemaining > 0;
      const scale = drained ? Math.max(.1,b.vortexRemaining / window.RpgSourceEffects.VORTEX_ABSORB) : 1;
      node.setAttribute("transform", `translate(${b.x} ${1720 - b.y}) scale(${scale})`);
      node.style.opacity = drained ? String(.2 + .8 * scale) : "1";
      node.setAttribute("data-fire", String(b.fire));
    }
    for (const [id, node] of this.ballNodes)
      if (!live.has(id)) {
        node.remove();
        this.ballNodes.delete(id);
      }
    const origin = state.origin();
    $("cannon").setAttribute(
      "transform",
      `translate(${state.launcherX - 450} 0) rotate(${90 - (Math.atan2(state.direction.y, state.direction.x) * 180) / Math.PI} 450 1566)`,
    );
    $("ready-ball").style.display = state.phase === "ready" ? "" : "none";
    $("ready-ball").setAttribute(
      "transform",
      `translate(${origin.x} ${1720 - origin.y})`,
    );
    this.aimLayer.replaceChildren();
    if (state.phase === "ready") {
      this.aimLayer.append(
        el("line", {
          x1: origin.x,
          y1: 1720 - origin.y,
          x2: origin.x + state.direction.x * 420,
          y2: 1720 - origin.y - state.direction.y * 420,
          stroke: "#91edff",
          "stroke-width": 3,
          "stroke-dasharray": "9 9",
        }),
      );
    }
    this.fxLayer.replaceChildren();
    for (const p of state.particles)
      this.fxLayer.append(
        el("circle", {
          cx: p.x,
          cy: 1720 - p.y,
          r: 6 + (1 - p.life / 0.16) * 28,
          fill: "none",
          stroke: "#ffe3a5",
          "stroke-width": 3,
          opacity: p.life / 0.16,
        }),
      );
    const status = this.paused ? "Paused" : state.message;
    updateBossStatus(state.remainingGuards, state.bricks.some((b) => b.kind === "BOSS" && b.health > 0));
    if ($("play-status").textContent !== status)
      $("play-status").textContent = status;
    const stats = `Turn ${state.turn} · Balls ${state.ballCount} | Hit ${state.hitPower()} · In flight ${state.balls.length} · Queued ${state.pending} · Hits ${state.hits} · Damage ${state.damage} | Score ${state.score} · Targets ${state.targets}`;
    if ($("play-stats").textContent !== stats)
      $("play-stats").textContent = stats;
    $("play-fire").disabled = this.paused || state.phase !== "ready";
    $("play-recall").disabled = this.paused || state.phase !== "firing";
  },
  point(event) {
    const point = $("board").createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const p = point.matrixTransform($("board").getScreenCTM().inverse());
    return { x: p.x, y: 1720 - p.y };
  },
  pause() {
    if (!this.active) return;
    this.paused = !this.paused;
    this.pointer = null;
    $("play-pause").textContent = this.paused ? "Resume" : "Pause";
    this.paint();
  },
};

for (const rarity of ["NORMAL", "RARE", "LEGENDARY", "EPIC"]) {
  const group = document.createElement("optgroup");
  group.label = rarity;
  for (const ball of playBalls.filter((b) => b.rarity === rarity))
    group.append(
      new Option(
        `${ball.name} ? cosmetic`,
        ball.id,
      ),
    );
  $("play-ball").append(group);
}
$("play-ball").value = window.VolleyGallery.ballCatalog.default;
$("play-pattern").value = "straight";
syncBallControls();
$("play-ball").addEventListener("change", () => {
  syncBallControls();
  if (playtest.active) playtest.start();
  else render();
});
$("play-pattern").addEventListener("change", () => {
  if (playtest.active) playtest.start();
});
$("play-balls").addEventListener("input", () => syncBallControls(false));

$("play-stage").addEventListener("click", () => playtest.start());
$("quick-play").addEventListener("click", () =>
  playtest.active ? playtest.stop() : playtest.start(),
);
$("play-restart").addEventListener("click", () => playtest.start());
$("play-exit").addEventListener("click", () => playtest.stop());
$("play-pause").addEventListener("click", () => playtest.pause());
$("play-fire").addEventListener("click", () => {
  if (playtest.active && !playtest.paused) playtest.engine.fire();
});
$("play-recall").addEventListener("click", () => {
  if (playtest.active && !playtest.paused) playtest.engine.recall();
});
$("board").addEventListener("pointerdown", (event) => {
  if (
    window.stageCamera.mode !== "aim" ||
    !playtest.active ||
    playtest.paused ||
    playtest.engine.phase !== "ready" ||
    event.button !== 0
  )
    return;
  event.preventDefault();
  const p = playtest.point(event);
  playtest.engine.aim(p.x, p.y);
  playtest.pointer = event.pointerId;
  $("board").setPointerCapture(event.pointerId);
  playtest.paint();
});
$("board").addEventListener("pointermove", (event) => {
  if (
    window.stageCamera.mode !== "aim" ||
    playtest.pointer !== event.pointerId ||
    !playtest.active ||
    playtest.paused
  )
    return;
  event.preventDefault();
  const p = playtest.point(event);
  playtest.engine.aim(p.x, p.y);
  playtest.paint();
});
$("board").addEventListener("pointerup", (event) => {
  if (window.stageCamera.mode !== "aim") {
    playtest.pointer = null;
    return;
  }
  if (playtest.pointer !== event.pointerId) return;
  playtest.pointer = null;
  if (playtest.active && !playtest.paused) {
    const p = playtest.point(event);
    playtest.engine.aim(p.x, p.y);
    playtest.engine.fire();
  }
});
$("board").addEventListener("pointercancel", () => {
  playtest.pointer = null;
});
document.addEventListener("keydown", (event) => {
  if (
    !playtest.active ||
    ["INPUT", "SELECT", "BUTTON"].includes(document.activeElement?.tagName)
  )
    return;
  if (event.code === "Space") {
    event.preventDefault();
    if (!playtest.paused) playtest.engine.fire();
  }
  if (event.key.toLowerCase() === "r") playtest.start();
  if (event.key === "Escape") playtest.stop();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && playtest.active && !playtest.paused) playtest.pause();
});

$("play-level").addEventListener("input", () => syncBallControls());
