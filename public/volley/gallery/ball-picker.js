"use strict";
// Keep the existing select as the canonical value; render an accessible image list.
const ballPicker = {
  open: false,
  active: 0,
  visible: [],
  update() {
    $("ball-picker-name").textContent = selectedPlayBall().name;
    for (const row of this.visible) {
      const selected = row.ball.id === $("play-ball").value;
      row.node.setAttribute("aria-selected", String(selected));
    }
  },
  render(query = "") {
    const list = $("ball-picker-options");
    list.replaceChildren();
    this.visible = [];
    const needle = query.trim().toLowerCase();
    for (const rarity of ["NORMAL", "RARE", "LEGENDARY", "EPIC"]) {
      const matches = playBalls.filter(
        (ball) =>
          ball.rarity === rarity &&
          `${ball.name} ${rarity}`.toLowerCase().includes(needle),
      );
      if (!matches.length) continue;
      const heading = document.createElement("div");
      heading.className = "ball-picker-group";
      heading.setAttribute("role", "presentation");
      heading.textContent = rarity;
      list.append(heading);
      for (const ball of matches) {
        const index = this.visible.length;
        const row = document.createElement("button");
        row.type = "button";
        row.className = "ball-option";
        row.id = "ball-option-" + ball.id;
        row.tabIndex = -1;
        row.setAttribute("role", "option");
        const icon = el("svg", {
          viewBox: "0 0 52 52",
          width: 42,
          height: 42,
          "aria-hidden": "true",
        });
        icon.append(ballSpriteNode(ball, 26, 26, 23));
        const copy = document.createElement("span"),
          name = document.createElement("strong"),
          power = document.createElement("small");
        name.textContent = ball.name;
        power.textContent = `+${ball.profile.startingBalls} balls · ${ball.profile.baseHitDamage} hit`;
        copy.append(name, power);
        row.append(icon, copy);
        row.addEventListener("click", () => this.choose(index));
        list.append(row);
        this.visible.push({ ball, node: row });
      }
    }
    $("ball-picker-empty").hidden = this.visible.length !== 0;
    this.active = Math.max(
      0,
      this.visible.findIndex((row) => row.ball.id === $("play-ball").value),
    );
    this.update();
    this.highlight(false);
  },
  highlight(scroll = true) {
    this.visible.forEach((row, index) => {
      row.node.setAttribute("data-active", String(index === this.active));
    });
    const row = this.visible[this.active];
    $("ball-picker-search").setAttribute(
      "aria-activedescendant",
      row?.node.id || "",
    );
    if (scroll) row?.node.scrollIntoView?.({ block: "nearest" });
  },
  show() {
    this.open = true;
    $("ball-picker-popup").hidden = false;
    $("ball-picker-trigger").setAttribute("aria-expanded", "true");
    $("ball-picker-search").value = "";
    this.render();
    $("ball-picker-search").focus({ preventScroll: true });
    this.highlight();
  },
  close(focus = true) {
    this.open = false;
    $("ball-picker-popup").hidden = true;
    $("ball-picker-trigger").setAttribute("aria-expanded", "false");
    if (focus) $("ball-picker-trigger").focus({ preventScroll: true });
  },
  choose(index) {
    const row = this.visible[index];
    if (!row) return;
    const changed = $("play-ball").value !== row.ball.id;
    $("play-ball").value = row.ball.id;
    this.close();
    if (changed)
      $("play-ball").dispatchEvent(new Event("change", { bubbles: true }));
    this.update();
  },
};
$("ball-picker-trigger").addEventListener("click", () =>
  ballPicker.open ? ballPicker.close() : ballPicker.show(),
);
$("ball-picker-trigger").addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    ballPicker.show();
  }
});
$("ball-picker-search").addEventListener("input", () =>
  ballPicker.render($("ball-picker-search").value),
);
$("ball-picker-search").addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const last = ballPicker.visible.length - 1;
    ballPicker.active =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? Math.max(0, last)
          : Math.max(
              0,
              Math.min(
                last,
                ballPicker.active + (event.key === "ArrowDown" ? 1 : -1),
              ),
            );
    ballPicker.highlight();
  } else if (event.key === "Enter") {
    event.preventDefault();
    ballPicker.choose(ballPicker.active);
  } else if (event.key === "Escape") {
    event.preventDefault();
    ballPicker.close();
  } else if (event.key === "Tab") ballPicker.close(false);
});
$("play-ball").addEventListener("change", () => ballPicker.update());
document.addEventListener("pointerdown", (event) => {
  if (ballPicker.open && !$("ball-picker").contains(event.target))
    ballPicker.close(false);
});
ballPicker.update();
