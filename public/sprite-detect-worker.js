/* SpriteForge Studio v1.1: pixel-accurate local segmentation.
 * The detector NEVER merges regions just because their bounding boxes overlap.
 * Small anti-aliased gutters remain valid separators when mergeDistance = 0.
 */
self.onmessage = function (event) {
  const { sheetId, buffer, width, height, settings } = event.data;
  try {
    const { alphaThreshold, minArea, mergeDistance, backgroundRemoval, tolerance, bgColor } = settings;
    const autoSplitTouching = settings.autoSplitTouching !== false;
    const rgb = [1, 3, 5].map(i => parseInt(bgColor.substring(i, i + 2), 16));
    const src = new Uint8ClampedArray(buffer);
    const n = width * height;
    const labels = new Uint32Array(n);
    const mask = new Uint8Array(n);
    const tol2 = tolerance * tolerance * 3;
    for (let i = 0, q = 0; i < n; i++, q += 4) {
      if (src[q + 3] < alphaThreshold) continue;
      if (backgroundRemoval) {
        const dr = src[q] - rgb[0], dg = src[q + 1] - rgb[1], db = src[q + 2] - rgb[2];
        if (dr * dr + dg * dg + db * db <= tol2) continue;
      }
      mask[i] = 1;
    }

    // Four-way connected components: diagonally adjacent sprites do not become one.
    const queue = new Int32Array(n);
    let nextLabel = 0;
    const parts = [];
    for (let start = 0; start < n; start++) {
      if (!mask[start] || labels[start]) continue;
      const id = ++nextLabel;
      let head = 0, tail = 1, x0 = width, y0 = height, x1 = -1, y1 = -1;
      queue[0] = start;
      labels[start] = id;
      while (head < tail) {
        const pos = queue[head++], x = pos % width, y = (pos / width) | 0;
        if (x < x0) x0 = x; if (y < y0) y0 = y;
        if (x > x1) x1 = x; if (y > y1) y1 = y;
        if (x > 0 && mask[pos - 1] && !labels[pos - 1]) { labels[pos - 1] = id; queue[tail++] = pos - 1; }
        if (x + 1 < width && mask[pos + 1] && !labels[pos + 1]) { labels[pos + 1] = id; queue[tail++] = pos + 1; }
        if (y > 0 && mask[pos - width] && !labels[pos - width]) { labels[pos - width] = id; queue[tail++] = pos - width; }
        if (y + 1 < height && mask[pos + width] && !labels[pos + width]) { labels[pos + width] = id; queue[tail++] = pos + width; }
      }
      if (tail >= minArea) parts.push({ id, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, pixelArea: tail, members: [id] });
      if (parts.length > 10000) throw new Error('عدد المناطق كبير جداً. ارفع Min sprite area أو Alpha threshold.');
    }

    // Conservative seam splitting only for a visually clear, almost empty gutter
    // running through a solid-looking component. It avoids splitting thin diagonal
    // or irregularly shaped sprites, which must remain intact.
    function splitAtSeam(part, depth) {
      if (!autoSplitTouching || depth >= 5 || part.pixelArea < Math.max(120, minArea * 2)) return [part];
      if (part.pixelArea / (part.w * part.h) < 0.40) return [part];
      let best = null;
      for (const axis of ['x', 'y']) {
        const len = axis === 'x' ? part.w : part.h;
        const cross = axis === 'x' ? part.h : part.w;
        const minHalf = Math.max(14, Math.min(32, Math.ceil(len * 0.18)));
        if (len < minHalf * 2 + 3 || cross < 18) continue;
        const counts = new Int32Array(len);
        for (let y = part.y; y < part.y + part.h; y++) {
          for (let x = part.x; x < part.x + part.w; x++) {
            if (labels[y * width + x] === part.id) counts[axis === 'x' ? x - part.x : y - part.y]++;
          }
        }
        const total = new Int32Array(len + 1);
        for (let i = 0; i < len; i++) total[i + 1] = total[i] + counts[i];
        for (let cut = minHalf; cut <= len - minHalf; cut++) {
          const near = (counts[cut - 1] + counts[cut]) / 2;
          const left = Math.max(...counts.slice(Math.max(0, cut - 7), Math.max(1, cut - 2)));
          const right = Math.max(...counts.slice(Math.min(len, cut + 2), Math.min(len, cut + 7)));
          const sideMass = Math.min(total[cut], total[len] - total[cut]);
          if (sideMass < Math.max(minArea, part.pixelArea * .17)) continue;
          if (left < cross * 0.38 || right < cross * 0.38) continue;
          if (near > Math.max(1.1, cross * 0.065)) continue;
          const score = near / Math.max(1, Math.min(left, right));
          if (!best || score < best.score) best = { axis, cut, score };
        }
      }
      if (!best || best.score > .17) return [part];
      const rightId = ++nextLabel;
      let a = { id: part.id, x: width, y: height, w: 0, h: 0, pixelArea: 0, members: [part.id] };
      let b = { id: rightId, x: width, y: height, w: 0, h: 0, pixelArea: 0, members: [rightId] };
      let ax = -1, ay = -1, bx = -1, by = -1;
      for (let y = part.y; y < part.y + part.h; y++) for (let x = part.x; x < part.x + part.w; x++) {
        const pos = y * width + x;
        if (labels[pos] !== part.id) continue;
        const intoB = best.axis === 'x' ? x >= part.x + best.cut : y >= part.y + best.cut;
        const item = intoB ? b : a;
        if (intoB) { labels[pos] = rightId; bx = Math.max(bx, x); by = Math.max(by, y); }
        else { ax = Math.max(ax, x); ay = Math.max(ay, y); }
        item.x = Math.min(item.x, x); item.y = Math.min(item.y, y); item.pixelArea++;
      }
      if (!a.pixelArea || !b.pixelArea) return [part];
      a.w = ax - a.x + 1; a.h = ay - a.y + 1;
      b.w = bx - b.x + 1; b.h = by - b.y + 1;
      return [...splitAtSeam(a, depth + 1), ...splitAtSeam(b, depth + 1)];
    }
    const separated = parts.flatMap(p => splitAtSeam(p, 0));

    // An optional positive merge distance checks real foreground pixels, NOT boxes.
    // A zero distance always means zero merges, even if bounding rectangles overlap.
    const distance = Math.max(0, Math.min(35, Math.floor(mergeDistance || 0)));
    const parents = new Int32Array(separated.length);
    for (let i = 0; i < separated.length; i++) parents[i] = i;
    const root = i => { while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i]; } return i; };
    const offsets = [];
    if (distance > 0) {
      const maxDelta = distance + 1;
      for (let dy = -maxDelta; dy <= maxDelta; dy++) for (let dx = -maxDelta; dx <= maxDelta; dx++) {
        if (dx * dx + dy * dy <= maxDelta * maxDelta) offsets.push([dx, dy]);
      }
      offsets.sort((a, b) => (a[0] ** 2 + a[1] ** 2) - (b[0] ** 2 + b[1] ** 2));
    }
    function pixelsAreClose(a, b) {
      const gapX = Math.max(0, a.x - (b.x + b.w - 1), b.x - (a.x + a.w - 1));
      const gapY = Math.max(0, a.y - (b.y + b.h - 1), b.y - (a.y + a.h - 1));
      if (gapX * gapX + gapY * gapY > (distance + 1) ** 2) return false;
      const from = a.pixelArea <= b.pixelArea ? a : b;
      const to = from === a ? b : a;
      const y0 = Math.max(from.y, to.y - distance - 1), y1 = Math.min(from.y + from.h, to.y + to.h + distance + 1);
      const x0 = Math.max(from.x, to.x - distance - 1), x1 = Math.min(from.x + from.w, to.x + to.w + distance + 1);
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        if (labels[y * width + x] !== from.id) continue;
        for (const [dx, dy] of offsets) {
          const tx = x + dx, ty = y + dy;
          if (tx >= to.x && tx < to.x + to.w && ty >= to.y && ty < to.y + to.h && labels[ty * width + tx] === to.id) return true;
        }
      }
      return false;
    }
    if (distance > 0) {
      for (let i = 0; i < separated.length; i++) for (let j = i + 1; j < separated.length; j++) {
        if (root(i) !== root(j) && pixelsAreClose(separated[i], separated[j])) parents[root(i)] = root(j);
      }
    }
    const groups = new Map();
    for (let i = 0; i < separated.length; i++) {
      const key = root(i), a = separated[i];
      const g = groups.get(key);
      if (!g) groups.set(key, { ...a, members: [a.id] });
      else {
        const x = Math.min(g.x, a.x), y = Math.min(g.y, a.y);
        const right = Math.max(g.x + g.w, a.x + a.w), bottom = Math.max(g.y + g.h, a.y + a.h);
        g.x = x; g.y = y; g.w = right - x; g.h = bottom - y;
        g.pixelArea += a.pixelArea; g.members.push(a.id);
      }
    }
    const regions = [...groups.values()].sort((a, b) => a.y - b.y || a.x - b.x).slice(0, 1000).map((r, index) => ({ ...r, index }));
    self.postMessage({ type: 'result', sheetId, regions, labels }, [labels.buffer]);
  } catch (err) {
    self.postMessage({ type: 'error', sheetId, message: String(err.message || err) });
  }
};

