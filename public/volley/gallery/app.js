"use strict";
function fillList() {
  const list = $("stage-list");
  list.replaceChildren();
  for (const st of stages) {
    if ($("world").value !== "all" && Number($("world").value) !== st.world)
      continue;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "stage-button";
    b.dataset.id = st.id;
    b.setAttribute("aria-current", String(st.id === current));
    const sw = document.createElement("i");
    sw.className = "swatch " + st.theme;
    const title = document.createElement("strong");
    title.textContent = "Stage " + st.id;
    const sub = document.createElement("small");
    sub.textContent = `W${st.world} / ${st.local}${st.boss ? " ? BOSS" : ""}`;
    b.append(sw, title, sub);
    b.addEventListener("click", () => show(st.id));
    list.append(b);
  }
}

let navigationRequest = 0;
async function show(id) {
  playtest.stop();
  $("play-stage").disabled = true;
  $("quick-play").disabled = true;
  const request = ++navigationRequest;
  current = Math.max(1, Math.min(stages.length, Math.trunc(Number(id)) || 1));
  selected = null;
  currentStage = null;
  const entry = stages[current - 1];
  if ($("world").value !== "all" && Number($("world").value) !== entry.world) {
    $("world").value = String(entry.world);
    fillList();
  }
  $("prev").disabled = current === 1;
  $("next").disabled = current === stages.length;
  $("jump").value = current;
  $("descent").value = 0;
  $("descent-label").textContent = "0 turns / 0 units";
  $("title").textContent = `Stage ${current} - ${worldNames[entry.world]}`;
  $("stats").textContent =
    `World ${entry.world} / ${entry.local} - ${entry.brickCount} active pieces`;
  $("count").textContent = current + " / " + stages.length;
  $("board").replaceChildren();
  $("frame").setAttribute("aria-busy", "true");
  $("image-errors").textContent = "";
  $("badges").replaceChildren();
  $("boss-status").hidden = true;
  $("kind-list").replaceChildren();
  $("details").textContent = "Loading stage...";
  $("retry").hidden = true;
  $("load-status").dataset.state = "loading";
  $("load-status").textContent = `Loading stage ${current}...`;
  for (const button of $("stage-list").children) {
    button.setAttribute(
      "aria-current",
      String(Number(button.dataset.id) === current),
    );
  }
  $("provenance").textContent =
    `Generated: ${gallery.generatedAt} - Runtime: ${gallery.runtimeSha256 || gallery.sourceSha256}`;
  history.replaceState(null, "", "#stage-" + current);
  try {
    const st = await loadStage(current);
    // A slow earlier request must never replace a more recent selection.
    if (request !== navigationRequest) return;
    currentStage = st;
    syncBallControls();
    $("play-stage").disabled = false;
    $("quick-play").disabled = false;
    $("play-status").textContent =
      "Drag to aim and release to fire in Play stage.";
    $("stats").textContent =
      `World ${st.world} / ${st.local} - ${st.bricks.length} active pieces - ${st.balls} starting balls - ${st.descent} descent`;
    $("badges").replaceChildren(
      badge(st.theme.toUpperCase() + " BRICKS"),
      badge(st.boss ? "WORLD BOSS" : "CAMPAIGN"),
    );
    if (st.megaFlag) $("badges").append(badge("Mega clearance review", "warn"));
    updateBossStatus(st.bossGuards, st.boss);
    if (st.bricks.some((b) => b.overlap))
      $("badges").append(badge("Overlap priority fix", "ok"));
    $("review-status").textContent =
      "Geometry and assets are reconstructed from the current loader. Green checks in a source audit do not prove this stage can be won. Gold outlines: passage gates. Pink outlines: overlap priority cases.";
    $("details").textContent = "Select a piece in the stage.";
    $("kind-list").replaceChildren();
    for (const [kind, count] of Object.entries(st.kinds)) {
      const b = document.createElement("button");
      b.textContent = kind + " ?" + count;
      b.addEventListener("click", () => {
        const piece = st.bricks.find((b) => b.kind === kind);
        selected = piece.id;
        inspect(piece);
        render();
        window.stageCamera.focusPiece(piece);
      });
      $("kind-list").append(b);
    }
    render();
    $("load-status").dataset.state = "ready";
    $("load-status").textContent =
      `Stage ${st.id} ready - ${st.bricks.length} pieces`;
  } catch (error) {
    if (request !== navigationRequest) return;
    $("load-status").dataset.state = "error";
    $("load-status").textContent =
      error.message + " Keep the gallery folder beside this HTML, then retry.";
    $("details").textContent =
      "Stage unavailable. Your other stages can still be selected.";
    $("retry").hidden = false;
  } finally {
    if (request === navigationRequest)
      $("frame").setAttribute("aria-busy", "false");
  }
}

for (let world = 1; world <= 9; world++) {
  $("world").add(new Option(world + " - " + worldNames[world], String(world)));
}
$("world").addEventListener("change", () => {
  fillList();
  if ($("world").value !== "all") {
    show(stages.find((stage) => stage.world === Number($("world").value)).id);
  }
});
$("prev").addEventListener("click", () => show(current - 1));
$("next").addEventListener("click", () => show(current + 1));
$("jump-go").addEventListener("click", () => show($("jump").value));
$("retry").addEventListener("click", () => show(current));
$("jump").addEventListener("keydown", (event) => {
  if (event.key === "Enter") show(event.target.value);
});
for (const id of [
  "descent",
  "difficulty",
  "view",
  "hp",
  "hitboxes",
  "diagnostics",
  "special-only",
]) {
  $(id).addEventListener("input", render);
}
document.addEventListener("keydown", (event) => {
  if (["INPUT", "SELECT", "BUTTON"].includes(document.activeElement?.tagName))
    return;
  if (event.key === "ArrowRight") show(current + 1);
  if (event.key === "ArrowLeft") show(current - 1);
});
fillList();
const initialStageReady = show(
  Number(location.hash.match(/stage-(\d+)/)?.[1]) || 1,
);
