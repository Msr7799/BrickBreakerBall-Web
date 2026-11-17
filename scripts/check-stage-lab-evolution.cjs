"use strict";
// Production Evolution regression: deterministic local-only checks; no Android save or cloud access.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Sandbox = require("../public/volley/gallery/play-engine.js");
const root = path.resolve(__dirname, "../public/volley");
const index = JSON.parse(fs.readFileSync(path.join(root, "stage-gallery-data.json"), "utf8"));
const prefix = "window.VolleyGallery.registerStage(";
let checked = 0, bosses = 0, total = 0;
assert.equal(index.stages.length, 160);
for (const entry of index.stages) {
  const data = fs.readFileSync(path.join(root, entry.file), "utf8")
    .replace(/\r\n/g, "\n");
  assert.ok(data.startsWith(prefix) && data.endsWith(");\n"), entry.file);
  const stage = JSON.parse(data.slice(prefix.length, -3));
  assert.equal(stage.id, entry.id);
  assert.equal(stage.bricks.length, entry.brickCount);
  const original = JSON.stringify(stage.bricks);
  const legacy = {kind: "ARC_CHAIN", triggerEveryHits: 4, bonusDamage: 3};
  const reference = new Sandbox(stage, {
    playerLevel: 1, balls: 10, hit: 1, profile: legacy, shotgun: true,
    experimental: false,
  });
  assert.equal(reference.profile, null, "Reference campaign ignores cosmetic ability profile");
  assert.equal(reference.shotgun, false, "Reference campaign forces straight");
  assert.equal(reference.ballCount, 10);
  assert.equal(reference.baseHit, 1);
  assert.equal(reference.bricks.length, stage.bricks.length);
  const experimental = new Sandbox(stage, {
    playerLevel: 85, balls: 18, hit: 1, profile: legacy,
    shotgun: true, experimental: true,
  });
  assert.equal(experimental.profile.kind, "ARC_CHAIN");
  assert.equal(experimental.shotgun, true);
  assert.equal(experimental.bricks.length, entry.brickCount);
  assert.equal(JSON.stringify(stage.bricks), original, "Read-only sandbox constructor must not mutate authored bricks");
  assert.equal(reference.remainingGuards,
    stage.boss ? (stage.world <= 3 ? 2 : stage.world <= 6 ? 3 : 4) : 0);
  if (stage.boss) bosses++;
  total += stage.bricks.length;
  checked++;
}
assert.equal(checked, 160);
assert.equal(bosses, 9);
assert.equal(total, index.totalActiveBricks);
const html = fs.readFileSync(path.join(root, "stage-gallery.html"), "utf8");
for (const control of ["enhanced-bricks", "experimental-abilities",
  "lab-world-preset", "lab-reference-preset", "lab-export-report"])
  assert.ok(html.includes('id="' + control + '"'), control);
console.log("STAGE_LAB_EVOLUTION_OK:", checked, "stages,", bosses,
  "existing bosses,", total, "authored pieces; reference and experimental branches isolated");
