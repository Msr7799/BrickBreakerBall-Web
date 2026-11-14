"use strict";
// View coordinates only: never move bricks or change the simulation's ceiling.
class VolleyCamera {
  constructor() {
    this.reset();
  }
  reset(top = 0, entire = false, viewportHeight = 1720) {
    this.top = Math.min(0, top);
    this.baseHeight = entire ? 1720 - this.top : viewportHeight;
    this.zoom = 1;
    this.x = 450;
    this.y = entire ? (1720 + this.top) / 2 : this.baseHeight / 2;
    this.clamp();
  }
  get width() {
    return 900 / this.zoom;
  }
  get height() {
    return this.baseHeight / this.zoom;
  }
  clamp() {
    this.x = Math.max(this.width / 2, Math.min(900 - this.width / 2, this.x));
    if (this.width >= 900) this.x = 450;
    this.y = Math.max(
      this.top + this.height / 2,
      Math.min(1720 - this.height / 2, this.y),
    );
    if (this.height > 1720 - this.top) this.y = (1720 + this.top) / 2;
  }
  setZoom(value) {
    this.zoom = Math.max(0.5, Math.min(4, value));
    this.clamp();
  }
  pan(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.clamp();
  }
  get box() {
    return [
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
    ];
  }
}
if (typeof module !== "undefined" && module.exports)
  module.exports = VolleyCamera;
if (typeof document !== "undefined") {
  const stageCamera = new VolleyCamera();
  window.stageCamera = stageCamera;
  stageCamera.mode = "pan";
  stageCamera.key = null;
  stageCamera.drag = null;
  stageCamera.suppressClickUntil = 0;
  stageCamera.showArena = false;
  stageCamera.preferredHeight = () => {
    if (stageCamera.showArena || (typeof playtest !== "undefined" && playtest.active)) return 1720;
    const frame = $("frame").getBoundingClientRect();
    return Math.max(600, Math.min(1100, 900 * frame.height / Math.max(1, frame.width)));
  };
  stageCamera.scale = () => {
    const rect = $("board").getBoundingClientRect?.() || {
      width: 900,
      height: 1720,
    };
    return Math.max(
      0.01,
      Math.min(
        rect.width / stageCamera.width,
        rect.height / stageCamera.height,
      ),
    );
  };
  stageCamera.fitLabel = (hp) => {
    const scale = stageCamera.scale();
    const width = Number(hp.getAttribute("data-label-width")) || 60;
    const height = Number(hp.getAttribute("data-label-height")) || 24;
    let font = Math.min(15 / scale, height, width / Math.max(1, hp.textContent.length * .67));
    hp.style.fontSize = font + "px";
    const measured = hp.getComputedTextLength?.();
    if (measured > width) { font *= width / measured; hp.style.fontSize = font + "px"; }
    hp.style.strokeWidth = Math.min(font * .12, 1.7 / scale) + "px";
  };
  stageCamera.apply = () => {
    $("board").setAttribute("viewBox", stageCamera.box.join(" "));
    const percent = Math.round(stageCamera.zoom * 100);
    $("zoom").value = percent;
    $("zoom-label").textContent = percent + "%";
    $("camera-zoom").textContent = percent + "%";
    $("zoom-out").disabled = percent <= 50;
    $("zoom-in").disabled = percent >= 400;
    for (const hp of $("board").querySelectorAll(".hp")) {
      stageCamera.fitLabel(hp);
    }
  };
  stageCamera.fit = () => {
    stageCamera.reset(stageCamera.top, $("view").value === "all", stageCamera.preferredHeight());
    if (currentStage) stageCamera.key = stageCamera.keyFor(currentStage, $("view").value === "all");
    stageCamera.apply();
  };
  stageCamera.focusPiece = (piece) => {
    stageCamera.x = piece.x + piece.w / 2;
    stageCamera.y = 1720 - piece.y - piece.h / 2;
    stageCamera.clamp(); stageCamera.apply();
  };
  stageCamera.keyFor = (stage, entire) => {
    const playing = typeof playtest !== "undefined" && playtest.active;
    return stage.id + ":" + entire + ":" + playing + ":" + stageCamera.showArena;
  };
  stageCamera.configure = (stage, top, entire) => {
    const key = stageCamera.keyFor(stage, entire);
    if (key !== stageCamera.key) {
      stageCamera.reset(top, entire, stageCamera.preferredHeight());
      stageCamera.key = key;
    } else {
      stageCamera.top = top;
      stageCamera.clamp();
    }
    stageCamera.apply();
  };
  stageCamera.changeZoom = (value) => {
    stageCamera.setZoom(value);
    stageCamera.apply();
  };
  stageCamera.setMode = (mode) => {
    stageCamera.mode = mode;
    stageCamera.drag = null;
    for (const name of ["pan", "aim"])
      $("camera-" + name).setAttribute("aria-pressed", String(name === mode));
    $("board").style.cursor = mode === "pan" ? "grab" : "crosshair";
    $("camera-help").textContent =
      mode === "pan"
        ? "Drag or swipe to explore. Scroll to see higher rows."
        : "Drag to aim; release to fire. Use Pan to explore.";
  };
  $("zoom-in").addEventListener("click", () =>
    stageCamera.changeZoom(stageCamera.zoom + 0.25),
  );
  $("zoom-out").addEventListener("click", () =>
    stageCamera.changeZoom(stageCamera.zoom - 0.25),
  );
  $("camera-fit").addEventListener("click", () => {
    stageCamera.showArena = false; stageCamera.key = null; stageCamera.fit();
  });
  $("camera-arena").addEventListener("click", () => {
    stageCamera.showArena = true; stageCamera.key = null; stageCamera.fit();
  });
  $("camera-boss").addEventListener("click", () => {
    const bricks = typeof playtest !== "undefined" && playtest.active ? playtest.engine.bricks : currentStage?.bricks;
    const boss = bricks?.find((b) => b.kind === "BOSS");
    if (boss) stageCamera.focusPiece(boss);
  });
  $("camera-pan").addEventListener("click", () => stageCamera.setMode("pan"));
  $("camera-aim").addEventListener("click", () => stageCamera.setMode("aim"));
  $("zoom").addEventListener("input", () =>
    stageCamera.changeZoom(Number($("zoom").value) / 100),
  );
  $("board").addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey)
        stageCamera.changeZoom(
          stageCamera.zoom * Math.exp(-event.deltaY * 0.002),
        );
      else {
        const scale = stageCamera.scale();
        stageCamera.pan(event.deltaX / scale, event.deltaY / scale);
        stageCamera.apply();
      }
    },
    { passive: false },
  );
  $("board").addEventListener("pointerdown", (event) => {
    if (stageCamera.mode !== "pan" || event.button !== 0 || stageCamera.drag)
      return;
    event.preventDefault();
    stageCamera.drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      distance: 0,
    };
  });
  $("board").addEventListener("pointermove", (event) => {
    const drag = stageCamera.drag;
    if (!drag || drag.id !== event.pointerId) return;
    event.preventDefault();
    const dx = drag.x - event.clientX,
      dy = drag.y - event.clientY,
      scale = stageCamera.scale();
    drag.distance += Math.abs(dx) + Math.abs(dy);
    // Capture only a real drag; a stationary tap must still select its brick.
    if (drag.distance > 5 && !drag.captured) {
      $("board").setPointerCapture(event.pointerId);
      drag.captured = true;
    }
    stageCamera.pan(dx / scale, dy / scale);
    drag.x = event.clientX;
    drag.y = event.clientY;
    stageCamera.apply();
  });
  const finish = (event) => {
    if (stageCamera.drag?.id !== event.pointerId) return;
    if (stageCamera.drag.distance > 5)
      stageCamera.suppressClickUntil = Date.now() + 300;
    stageCamera.drag = null;
  };
  $("board").addEventListener("pointerup", finish);
  $("board").addEventListener("pointercancel", finish);
  if (typeof ResizeObserver !== "undefined")
    new ResizeObserver(() => {
      if ($("view").value !== "all") { stageCamera.baseHeight = stageCamera.preferredHeight(); stageCamera.clamp(); }
      stageCamera.apply();
    }).observe($("frame"));
  stageCamera.setMode("pan");
}
