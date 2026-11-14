"use strict";
function inspect(b) {
  $("inspector-panel").open = true;
  const box = $("details");
  box.replaceChildren();
  box.append(badge(b.kind));
  const dl = document.createElement("dl");
  for (const [k, v] of Object.entries({
    "Brick ID": b.id,
    "Normal / Hard / Extreme HP": b.hp.map(hpText).join(" / "),
    Shape: b.shape,
    "Collision bounds": `${b.x.toFixed(1)}, ${b.y.toFixed(1)} / ${b.w} ? ${b.h}`,
    "Original gameplay scene": b.sourceScene || "World boss core",
    "Selected visual scene": b.visualScene || "World boss portrait",
    "Bomb group": b.bombGroup,
    "Burn charges": b.burnCharges ?? "?",
    "Protection per cast": b.protection ?? "?",
    "Slider offset (cells)": `${b.moveX}, ${b.moveY}`,
    "Passage gate": b.gate ? "Yes" : "No",
    "Coincident objective priority fix": b.overlap ? "Applies here" : "No",
  })) {
    const dt = document.createElement("dt"),
      dd = document.createElement("dd");
    dt.textContent = k;
    dd.textContent = String(v);
    dl.append(dt, dd);
  }
  box.append(dl);
  const p = document.createElement("p");
  p.textContent =
    descriptions[b.kind] ||
    "Ordinary brick; its original gameplay material and HP are preserved.";
  box.append(p);
}
