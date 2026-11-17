"use strict";
/**
 * Match grass square sprite edges to their authored neighbours.
 * Visuals only: never alters stage placement, bricks, HP, physics or save data.
 * Uses the existing game's own grass image, trims only its brown base strip.
 */
(function (root) {
  const GRASS_SQUARE = "/Enemies/Grass/Enemy_Grass_256x320_2x2_block_SQ.png";
  const SOIL_START_RATIO = 0.80;
  const almost = (a, b) => Math.abs(Number(a) - Number(b)) < 0.05;
  const filledTop = new Set(["SQ", "NW", "NE"]);
  const isGrassSquare = (b) => b && b.kind === "GRASS" && b.shape === "SQ";

  function joinsBelow(brick, bricks) {
    if (!isGrassSquare(brick)) return false;
    return bricks.some((other) =>
      other.id !== brick.id &&
      other.kind === "GRASS" &&
      filledTop.has(other.shape) &&
      almost(other.x, brick.x) &&
      almost(other.w, brick.w) &&
      almost(other.y + other.h, brick.y));
  }
  function isEligibleImage(brick, layer) {
    return isGrassSquare(brick) && layer && typeof layer.path === "string" &&
      layer.path.endsWith(GRASS_SQUARE) && !layer.crop;
  }
  function visualFrame(brick, layer, bricks, image) {
    const trim = isEligibleImage(brick, layer) && joinsBelow(brick, bricks);
    const ratio = trim ? SOIL_START_RATIO : 1;
    return {
      trim,
      height: layer.height * ratio,
      viewBox: "0 0 " + image.width + " " + (image.height * ratio),
      imageWidth: image.width,
      imageHeight: image.height,
    };
  }

  // During Play stage, destroyed bricks no longer count as connected neighbours:
  // reveal the true bottom soil sprite when a lower grass brick is destroyed.
  function syncLive(nodeMap, bricks) {
    const alive = bricks.filter((b) => b.health > 0);
    for (const b of alive) {
      if (!isGrassSquare(b)) continue;
      const entry = nodeMap.get(b.id);
      if (!entry || !entry.node || typeof entry.node.querySelector !== "function") continue;
      const image = entry.node.querySelector(".grass-square-sprite");
      if (!image) continue;
      const trim = joinsBelow(b, alive);
      const was = image.getAttribute("data-trimmed") === "true";
      if (trim === was) continue;
      const width = Number(image.getAttribute("data-source-width"));
      const height = Number(image.getAttribute("data-source-height"));
      const fullHeight = Number(image.getAttribute("data-full-height"));
      image.setAttribute("viewBox", "0 0 " + width + " " + (height * (trim ? SOIL_START_RATIO : 1)));
      image.setAttribute("height", fullHeight * (trim ? SOIL_START_RATIO : 1));
      image.setAttribute("data-trimmed", String(trim));
    }
  }

  const api = {GRASS_SQUARE, SOIL_START_RATIO, isGrassSquare, joinsBelow,
    isEligibleImage, visualFrame, syncLive};
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GrassSeams = api;
})(globalThis);
