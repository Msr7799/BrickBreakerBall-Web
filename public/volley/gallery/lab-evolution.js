"use strict";
/**
 * Production Evolution Stage Lab tools.
 * No account access, wallets, remote writes, live gameplay mutations or cloud calls.
 * The reference baseline is intentionally distinct from experimental ball abilities.
 */
(function () {
  const levelBands = [
    [1, 19], [19, 31], [31, 40], [40, 50], [50, 58],
    [58, 65], [65, 72], [72, 79], [79, 85],
  ];
  const worldEnds = [18, 36, 54, 72, 90, 108, 126, 143, 160];
  const worldStarts = [1, 19, 37, 55, 73, 91, 109, 127, 144];
  const status = document.getElementById("lab-evolution-status");

  function note(value) {
    if (status) status.textContent = value;
  }
  function estimatedLevel(stage) {
    const i = Math.max(0, Math.min(8, Number(stage.world) - 1));
    const [lo, hi] = levelBands[i];
    const fraction = Math.max(0, Math.min(1,
      (stage.id - worldStarts[i]) / (worldEnds[i] - worldStarts[i])));
    return Math.round(lo + fraction * (hi - lo));
  }
  function applySuggestedLoadout() {
    if (!currentStage || playtest.active) return;
    const level = estimatedLevel(currentStage);
    document.getElementById("play-level").value = level;
    syncBallControls(true);
    note("World " + currentStage.world + " model: level " + level +
      ". PROPOSAL ONLY (P75 XP simulation); not real player data or a balance guarantee.");
  }
  function applyReferenceLoadout() {
    if (playtest.active) return;
    document.getElementById("experimental-abilities").checked = false;
    document.getElementById("play-pattern").value = "straight";
    document.getElementById("play-level").value = 1;
    syncBallControls(true);
    note("Reference baseline reset: level 1, straight launch, no ORBs; cosmetic ball art.");
  }
  function downloadableReport() {
    if (!currentStage) {
      note("Select a stage before exporting.");
      return;
    }
    const stage = currentStage;
    const running = Boolean(playtest.active && playtest.engine);
    const e = running ? playtest.engine : null;
    const difficulty = Number(document.getElementById("difficulty").value);
    const counts = {};
    for (const b of stage.bricks) counts[b.kind] = (counts[b.kind] || 0) + 1;
    const ball = selectedPlayBall();
    const report = {
      schema: "brickbreakerball.stage-lab.fixture.v1",
      generatedAt: new Date().toISOString(),
      source: "local-browser-sandbox",
      safety: "Read-only report; no Android/save/Google Play/Firebase write",
      parity: "NOT_ANDROID_PARITY_VERIFIED",
      data: {
        stageId: stage.id,
        worldId: stage.world,
        worldName: typeof worldNames !== "undefined" ? worldNames[stage.world] : null,
        boss: Boolean(stage.boss),
        bossGuards: stage.bossGuards ?? 0,
        authoredBrickCount: stage.bricks.length,
        authoredKinds: counts,
        brickIds: stage.bricks.map(b => b.id),
      },
      setup: {
        playerLevel: Number(document.getElementById("play-level").value),
        startingBalls: Number(document.getElementById("play-balls").value),
        baseHit: Number(document.getElementById("play-hit").value),
        ballId: ball.id,
        ballName: ball.name,
        ballRarity: ball.rarity,
        launchStyle: document.getElementById("play-pattern").value,
        difficultyIndex: difficulty,
        orbEquipment: [],
        visualEnhancement: document.getElementById("enhanced-bricks").checked,
        experimentalLegacyEffects: document.getElementById("experimental-abilities").checked,
        levelPreset: "P75-model-only-if-manually-applied",
      },
      sandboxResult: e ? {
        phase: e.phase,
        turns: e.turn,
        seed: e.seed,
        score: e.score,
        hits: e.hits,
        damage: e.damage,
        destroyed: e.destroyed,
        remainingTargets: e.targets,
        remainingGuards: e.remainingGuards,
        ballCount: e.ballCount,
      } : null,
      warnings: [
        "Browser physics and spell timing can differ from Kotlin/LibGDX.",
        "Experimental cosmetic effects and shotgun intentionally diverge from reference mode.",
        "The world-level model is hypothetical, not the actual player progression.",
        "This JSON is a local test fixture, not a save game or authenticated export.",
      ],
    };
    const blob = new Blob([JSON.stringify(report, null, 2) + "\n"], {
      type: "application/json",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = "stage-lab-" + String(stage.id).padStart(3, "0") +
      "-" + (e ? e.phase : "inspection") + ".json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    note("Exported stage " + stage.id + " local JSON fixture. No game save, coins, gems or purchases changed.");
  }

  document.getElementById("lab-world-preset")
    .addEventListener("click", applySuggestedLoadout);
  document.getElementById("lab-reference-preset")
    .addEventListener("click", applyReferenceLoadout);
  document.getElementById("lab-export-report")
    .addEventListener("click", downloadableReport);
  document.getElementById("enhanced-bricks")
    .addEventListener("change", () => {
      if (!playtest.active) render();
      note("Visual styling affects only existing SVG overlays. Brick hitboxes, sprites and stage JSON stay unchanged.");
    });
  document.getElementById("experimental-abilities")
    .addEventListener("change", () => {
      syncBallControls(false);
      note(document.getElementById("experimental-abilities").checked
        ? "Experimental legacy ball profile enabled for browser tests only. NOT Android parity."
        : "Reference rule mode restored. Ball visuals remain cosmetic.");
    });
  note("Reference campaign by default · nine boss cores and all 160 stage layouts are unchanged.");
})();
