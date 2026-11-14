"use strict";
// Continuous collision port of SweptCollision.kt and VolleySession's triangle sweep.
// World coordinates use Y up, just like Kotlin. No rendering or DOM dependencies.
(function (root) {
  const EPS = 0.00001;
  function aabb(o, d, r, b) {
    let nx = -Infinity,
      fx = Infinity,
      ny = -Infinity,
      fy = Infinity;
    if (Math.abs(d.x) < EPS) {
      if (o.x < b.x - r || o.x > b.x + b.w + r) return null;
    } else {
      nx = (b.x - r - o.x) / d.x;
      fx = (b.x + b.w + r - o.x) / d.x;
      if (nx > fx) [nx, fx] = [fx, nx];
    }
    if (Math.abs(d.y) < EPS) {
      if (o.y < b.y - r || o.y > b.y + b.h + r) return null;
    } else {
      ny = (b.y - r - o.y) / d.y;
      fy = (b.y + b.h + r - o.y) / d.y;
      if (ny > fy) [ny, fy] = [fy, ny];
    }
    const t = Math.max(nx, ny),
      far = Math.min(fx, fy);
    if (t > far || far < 0 || t < 0 || t > 1) return null;
    return nx > ny
      ? { t, nx: d.x > 0 ? -1 : 1, ny: 0 }
      : { t, nx: 0, ny: d.y > 0 ? -1 : 1 };
  }
  function circle(o, d, x, y, r) {
    const ox = o.x - x,
      oy = o.y - y,
      a = d.x * d.x + d.y * d.y,
      c = ox * ox + oy * oy - r * r;
    if (c <= 0) {
      const len = Math.max(EPS, Math.hypot(ox, oy));
      return { t: 0, nx: ox / len, ny: oy / len };
    }
    if (a <= EPS) return null;
    const b = 2 * (ox * d.x + oy * d.y),
      disc = b * b - 4 * a * c;
    if (disc < 0) return null;
    const t = (-b - Math.sqrt(disc)) / (2 * a);
    if (t < 0 || t > 1) return null;
    const hx = o.x + d.x * t - x,
      hy = o.y + d.y * t - y,
      len = Math.max(EPS, Math.hypot(hx, hy));
    return { t, nx: hx / len, ny: hy / len };
  }
  function segment(o, d, r, a, b) {
    const sx = b[0] - a[0],
      sy = b[1] - a[1],
      len2 = sx * sx + sy * sy;
    if (len2 <= EPS) return circle(o, d, ...a, r);
    const len = Math.sqrt(len2),
      nx = -sy / len,
      ny = sx / len;
    const distance = (o.x - a[0]) * nx + (o.y - a[1]) * ny,
      velocity = d.x * nx + d.y * ny;
    let best = null;
    const consider = (h) => {
      if (h && (!best || h.t < best.t)) best = h;
    };
    if (Math.abs(velocity) > EPS) {
      for (const side of [-r, r]) {
        const t = (side - distance) / velocity;
        if (t < 0 || t > 1) continue;
        const projection =
          ((o.x + d.x * t - a[0]) * sx + (o.y + d.y * t - a[1]) * sy) / len2;
        if (projection >= 0 && projection <= 1)
          consider({
            t,
            nx: nx * (side < 0 ? -1 : 1),
            ny: ny * (side < 0 ? -1 : 1),
          });
      }
    } else if (Math.abs(distance) <= r) {
      const projection = ((o.x - a[0]) * sx + (o.y - a[1]) * sy) / len2;
      if (projection >= 0 && projection <= 1)
        consider({
          t: 0,
          nx: nx * (distance < 0 ? -1 : 1),
          ny: ny * (distance < 0 ? -1 : 1),
        });
    }
    consider(circle(o, d, ...a, r));
    consider(circle(o, d, ...b, r));
    return best;
  }
  function rotate(v, angle) {
    const c = Math.cos(angle),
      s = Math.sin(angle);
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
  }
  function brick(o, d, r, b) {
    if (b.angle) {
      const angle = (b.angle * Math.PI) / 180,
        cx = b.x + b.w / 2,
        cy = b.y + b.h / 2;
      const p = rotate({ x: o.x - cx, y: o.y - cy }, -angle),
        v = rotate(d, -angle);
      const hit = brick({ x: p.x + cx, y: p.y + cy }, v, r, { ...b, angle: 0 });
      if (!hit) return null;
      const n = rotate({ x: hit.nx, y: hit.ny }, angle);
      return { ...hit, nx: n.x, ny: n.y };
    }
    if (b.shape === "SQ") return aabb(o, d, r, b);
    const l = b.x,
      t = b.y + b.h,
      rr = b.x + b.w,
      bb = b.y;
    const points = {
      NW: [
        [l, t],
        [rr, t],
        [l, bb],
      ],
      NE: [
        [l, t],
        [rr, t],
        [rr, bb],
      ],
      SW: [
        [l, t],
        [l, bb],
        [rr, bb],
      ],
      SE: [
        [rr, t],
        [l, bb],
        [rr, bb],
      ],
    }[b.shape];
    let best = null;
    for (let i = 0; i < 3; i++) {
      const h = segment(o, d, r, points[i], points[(i + 1) % 3]);
      if (h && (!best || h.t < best.t)) best = h;
    }
    return best;
  }
  const api = { aabb, circle, segment, brick, rotate };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VolleyPhysics = api;
})(globalThis);
