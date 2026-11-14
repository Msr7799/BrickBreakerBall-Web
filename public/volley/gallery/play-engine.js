"use strict";
// Local playtest state. Never writes campaign, wallet, account or save data.
(function (root) {
  const P =
    typeof module === "object" && module.exports
      ? require("./physics.js")
      : root.VolleyPhysics;
  const COUNTERS = new Set([
    "DYNAMITE",
    "SUICIDE",
    "BONUS_BALLS",
    "BONUS_DAMAGE",
    "OSB",
  ]);
  const STEP = 1 / 120,
    SPEED = 1278.4,
    RETURN = 118,
    PIVOT = 154,
    BARREL = 280;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const center = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
  class Sandbox {
    constructor(stage, options = {}) {
      this.stage = stage;
      this.options = options;
      this.bossRules = stage.bossRules || {
        firstWorldHitBudget: 180,
        extraHitBudgetPerWorld: 30,
        minimumDamageHits: 12,
      };
      this.profile = options.profile || null;
      this.difficulty = options.difficulty || 0;
      this.ballCount = clamp(
        Math.trunc(
          options.balls || stage.balls + (this.profile?.startingBalls || 0),
        ),
        1,
        160,
      );
      this.baseHit =
        this.profile?.baseHitDamage ||
        clamp(Math.trunc(options.hit || 1), 1, 1000000);
      this.shotgun = Boolean(options.shotgun && this.profile?.shotgunAvailable);
      this.abilityHits = 0;
      this.volleyBreaks = 0;
      this.score = 0;
      this.combo = 0;
      this.earnedBalls = 0;
      this.breakerId = null;
      this.radius = options.radius === 27 ? 27 : 15;
      this.launcherX = 450;
      this.phase = "ready";
      this.turn = 1;
      this.hits = 0;
      this.damage = 0;
      this.destroyed = 0;
      this.elapsed = 0;
      this.accumulator = 0;
      this.balls = [];
      this.pending = 0;
      this.cooldown = 0;
      this.direction = { x: 0, y: 1 };
      this.firstReturn = null;
      this.bonus = 0;
      this.nextId = 1;
      this.seed = stage.id;
      this.particles = [];
      this.message = "Drag on the board and release to fire.";
      this.bricks = stage.bricks.map((b) => ({
        ...b,
        hp: [...b.hp],
        health: b.hp[this.difficulty] ?? Infinity,
        initialHealth: b.hp[this.difficulty] ?? Infinity,
        baseX: b.x,
        baseY: b.y,
        angle: 0,
        protected: 0,
        frozen: false,
        burnLeft: b.burnCharges ?? 1,
        spikeCooldown: 0,
        moveDirection: b.startsMoved === false ? 0 : 1,
        angleStart: 0,
        angleDelta: 0,
        torchIdle: 0,
        torchOffset: 0,
        torchProgress: 1,
      }));
      this.initialFreeze();
    }
    random() {
      this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
      return this.seed / 4294967296;
    }
    get targets() {
      return this.bricks.filter((b) => this.objective(b) && b.health > 0)
        .length;
    }
    objective(b) {
      return Number.isFinite(b.initialHealth) && b.kind !== "BONUS_BALLS";
    }
    get remainingGuards() {
      return this.bricks.filter((b) => b.shieldLock && b.health > 0).length;
    }
    visible(b) {
      return b.health > 0 && b.y < 1720 && b.y + b.h > RETURN;
    }
    origin(direction = this.direction) {
      return {
        x: clamp(
          this.launcherX + direction.x * BARREL,
          this.radius,
          900 - this.radius,
        ),
        y: PIVOT + direction.y * BARREL,
      };
    }
    aim(x, y) {
      if (this.phase !== "ready") return;
      let dx = x - this.launcherX,
        dy = Math.max(1, y - PIVOT),
        len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      if (dy < 0.3) {
        dy = 0.3;
        len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
      }
      this.direction = { x: dx, y: dy };
    }
    fire() {
      if (this.phase !== "ready") return false;
      this.pending = this.ballCount;
      this.cooldown = 0;
      this.firstReturn = null;
      this.abilityHits = 0;
      this.volleyBreaks = 0;
      this.combo = 0;
      this.launched = 0;
      this.breakerId =
        this.profile?.openingBreakerEveryVolleys &&
        this.turn % this.profile.openingBreakerEveryVolleys === 0
          ? this.nextId
          : null;
      this.phase = "firing";
      this.message = "Volley in flight";
      return true;
    }
    recall() {
      if (this.phase !== "firing") return;
      this.balls = [];
      this.pending = 0;
      this.finishVolley();
    }
    advance(seconds) {
      this.accumulator += Math.max(0, seconds);
      while (this.accumulator >= STEP) {
        this.tick(STEP);
        this.accumulator -= STEP;
      }
    }
    tick(dt) {
      this.particles = this.particles.filter((p) => (p.life -= dt) > 0);
      if (this.phase === "won" || this.phase === "lost") return;
      this.elapsed += dt;
      for (const b of this.bricks) {
        b.spikeCooldown = Math.max(0, b.spikeCooldown - dt);
        this.torch(b, dt);
      }
      if (this.phase === "descending") {
        const before = this.descentTime / 0.4;
        this.descentTime = Math.min(0.4, this.descentTime + dt);
        const after = this.descentTime / 0.4,
          ease = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
        for (const b of this.bricks) {
          if (b.health <= 0) continue;
          b.y -= 80 * (after - before);
          if (b.kind === "SLIDER") {
            const d = 80 * (ease(after) - ease(before)) * b.slideStep;
            b.x += (b.moveX || 0) * d;
            if (!b.moveX) b.y -= (b.moveY || 0) * d;
          }
          if (b.kind === "ROTATING")
            b.angle = b.angleStart + b.angleDelta * (1 - (1 - after) ** 3);
        }
        if (this.descentTime >= 0.4) {
          this.turn++;
          this.launcherX = clamp(this.firstReturn ?? this.launcherX, 27, 873);
          this.phase = this.bricks.some(
            (b) =>
              b.health > 0 &&
              b.y <= 300 &&
              (this.objective(b) ||
                ["BLOCKER", "SLIDER", "TORCH", "ROTATING", "VORTEX"].includes(
                  b.kind,
                )),
          )
            ? "lost"
            : "ready";
          this.message =
            this.phase === "lost"
              ? "Danger line reached. Restart to try another angle."
              : "Drag to aim the next volley.";
        }
        return;
      }
      if (this.phase !== "firing") return;
      this.cooldown -= dt;
      while (this.pending > 0 && this.cooldown <= 0) {
        const direction = this.shotgun
          ? P.rotate(
              this.direction,
              (((this.launched % 5) - 2) * 6 * Math.PI) / 180,
            )
          : this.direction;
        const origin = this.origin(direction);
        this.balls.push({
          ...origin,
          vx: direction.x * SPEED,
          vy: direction.y * SPEED,
          radius: this.radius,
          id: this.nextId++,
          alive: true,
          last: -1,
          portal: 0,
          fire: false,
        });
        this.pending--;
        this.launched++;
        this.cooldown += 0.1;
      }
      for (const ball of this.balls) {
        if (ball.alive) {
          ball.portal = Math.max(0, ball.portal - dt);
          this.move(ball, dt);
        }
      }
      this.balls = this.balls.filter((b) => b.alive);
      if (this.phase === "firing" && !this.pending && !this.balls.length)
        this.finishVolley();
    }
    move(ball, dt) {
      let remaining = dt;
      const ignored = new Set();
      for (
        let n = 0;
        n < 6 && remaining > 0.000001 && ball.alive && this.phase === "firing";
        n++
      ) {
        const d = { x: ball.vx * remaining, y: ball.vy * remaining };
        let hit = null;
        const consider = (h) => {
          if (!h || h.t < 0 || h.t > 1) return;
          const a = h.brick,
            b = hit?.brick;
          const priority =
            a &&
            b &&
            Number.isFinite(a.health) &&
            !Number.isFinite(b.health) &&
            b.kind === "BLOCKER" &&
            a.shape === b.shape &&
            a.x === b.x &&
            a.y === b.y &&
            a.w === b.w &&
            a.h === b.h;
          if (!hit || h.t < hit.t || (h.t === hit.t && priority)) hit = h;
        };
        if (d.x < 0)
          consider({ t: (ball.radius - ball.x) / d.x, nx: 1, ny: 0 });
        if (d.x > 0)
          consider({ t: (900 - ball.radius - ball.x) / d.x, nx: -1, ny: 0 });
        if (d.y > 0)
          consider({ t: (1720 - ball.radius - ball.y) / d.y, nx: 0, ny: -1 });
        if (d.y < 0) consider({ t: (RETURN - ball.y) / d.y, returned: true });
        const minX = Math.min(ball.x, ball.x + d.x) - ball.radius,
          maxX = Math.max(ball.x, ball.x + d.x) + ball.radius;
        const minY = Math.min(ball.y, ball.y + d.y) - ball.radius,
          maxY = Math.max(ball.y, ball.y + d.y) + ball.radius;
        for (const b of this.bricks) {
          if (b.health <= 0 || ignored.has(b.id)) continue;
          const pad = b.angle ? Math.max(b.w, b.h) : 0;
          if (
            b.x - pad > maxX ||
            b.x + b.w + pad < minX ||
            b.y - pad > maxY ||
            b.y + b.h + pad < minY
          )
            continue;
          const h = P.brick(ball, d, ball.radius, b);
          if (h) consider({ ...h, brick: b });
        }
        if (!hit) {
          ball.x += d.x;
          ball.y += d.y;
          return;
        }
        ball.x += d.x * hit.t;
        ball.y += d.y * hit.t;
        remaining *= 1 - hit.t;
        if (hit.returned) {
          ball.alive = false;
          this.firstReturn ??= ball.x;
          return;
        }
        const b = hit.brick;
        if (b?.kind === "VORTEX") {
          if (this.elapsed % 6 < 2) {
            ball.alive = false;
            return;
          }
          ignored.add(b.id);
          continue;
        }
        if (b?.kind === "SPIKE_TRAP" && b.spikeCooldown <= 0) {
          b.spikeCooldown = 10;
          ball.alive = false;
          return;
        }
        if (b?.kind === "TELEPORT") {
          ignored.add(b.id);
          if (ball.portal > 0) continue;
          const paired = this.bricks.find(
            (p) =>
              p.kind === "TELEPORT" &&
              p !== b &&
              (!b.group || p.group === b.group),
          );
          if (paired) {
            Object.assign(ball, center(paired));
            ignored.add(paired.id);
          } else {
            ball.x = b.x < 450 ? 846 : 54;
            ball.y = clamp(b.y - 92, 336, 1630);
          }
          const v = P.rotate(
            { x: ball.vx, y: ball.vy },
            ((ball.x > center(b).x ? -31 : 31) * Math.PI) / 180,
          );
          ball.vx = v.x;
          ball.vy = v.y;
          ball.portal = 0.18;
          continue;
        }
        if (b?.kind === "TORCH") ball.fire = true;
        const dot = ball.vx * hit.nx + ball.vy * hit.ny;
        ball.vx -= 2 * dot * hit.nx;
        ball.vy -= 2 * dot * hit.ny;
        const speed = Math.hypot(ball.vx, ball.vy);
        if (Math.abs(ball.vy) < SPEED * 0.12) {
          ball.vy = ball.vy < 0 ? -SPEED * 0.12 : SPEED * 0.12;
          const f = speed / Math.hypot(ball.vx, ball.vy);
          ball.vx *= f;
          ball.vy *= f;
        }
        ball.x += hit.nx * 0.65;
        ball.y += hit.ny * 0.65;
        if (b) {
          if (ball.last !== b.id && Number.isFinite(b.health))
            this.hit(b, ball);
          ball.last = b.id;
          if (b.kind === "BURN" && b.burnLeft > 0) {
            b.burnLeft--;
            ball.alive = false;
            return;
          }
        } else ball.last = -1;
      }
    }
    hitPower() {
      return (
        this.baseHit +
        (this.profile
          ? this.profile.kind === "MOMENTUM_CORE" ? Math.floor(this.ballCount / this.profile.ballsPerDamage) : 0
          : 0)
      );
    }
    applyDamage(b, amount, { fire = false, opening = false } = {}) {
      if (b.health <= 0 || !Number.isFinite(b.health)) return;
      if (b.kind === "BOSS" && this.remainingGuards > 0) {
        this.message = `Boss shielded: ${this.remainingGuards} locks remaining.`;
        return;
      }
      if (fire) {
        b.frozen = false;
        b.protected = 0;
      }
      if (!opening && b.frozen) return;
      if (!opening && b.protected > 0) {
        b.protected--;
        return;
      }
      if (!opening && COUNTERS.has(b.kind)) amount = 1;
      if (b.kind === "BOSS")
        amount = Math.min(
          amount,
          Math.max(
            1,
            Math.floor(b.initialHealth / this.bossRules.minimumDamageHits),
          ),
        );
      const damage = Math.min(b.health, amount);
      b.health -= damage;
      this.damage += damage;
      this.combo += opening ? Math.min(30, damage) : damage;
      this.score +=
        (opening ? Math.min(30, damage) : damage) *
        (10 + Math.min(this.combo, 25));
      this.particles.push({ ...center(b), life: 0.16 });
      if (b.health <= 0) this.destroy(b, new Set());
    }
    hit(b, ball) {
      this.hits++;
      this.abilityHits++;
      const profile = this.profile;
      const triggered = Boolean(
        profile?.triggerEveryHits &&
        this.abilityHits % profile.triggerEveryHits === 0,
      );
      const opening = ball.id === this.breakerId && b.kind !== "BOSS";
      const bossBudget =
        this.bossRules.firstWorldHitBudget +
        ((this.stage.world || 1) - 1) * this.bossRules.extraHitBudgetPerWorld;
      const scale =
        b.kind === "BOSS"
          ? Math.max(1, Math.ceil(b.initialHealth / bossBudget))
          : !b.sourceBaseHealth || COUNTERS.has(b.kind)
            ? 1
            : this.stage.campaignAttack || 1 + Math.floor((this.stage.id - 1) / 12);
      let base = this.hitPower() + this.bonus + (this.radius === 27 ? 1 : 0);
      if (triggered && ["ARMOR_BREAKER", "VOID_PHASE"].includes(profile.kind))
        base += profile.bonusDamage;
      this.applyDamage(b, opening ? b.health : base * scale, {
        fire: ball.fire,
        opening,
      });
      if (opening) {
        this.breakerId = null;
        this.message = "Breaker shot!";
      }
      if (triggered && profile.kind === "INFERNO_BURST") {
        const thawed = b.frozen || b.protected > 0;
        b.frozen = false;
        b.protected = 0;
        if (thawed && b.health > 0) this.applyDamage(b, 1, { fire: true });
        const c = center(b);
        for (const target of this.bricks) {
          const t = center(target);
          if (
            target !== b &&
            this.visible(target) &&
            Number.isFinite(target.health) &&
            Math.abs(c.x - t.x) <= b.w * 1.55 &&
            Math.abs(c.y - t.y) <= b.h * 1.65
          )
            this.applyDamage(target, 1, { fire: true });
        }
      }
      if (triggered && profile.kind === "ARC_CHAIN") {
        const c = center(b);
        const target = this.bricks
          .filter(
            (t) => t !== b && this.visible(t) && Number.isFinite(t.health),
          )
          .sort(
            (a, z) =>
              (center(a).x - c.x) ** 2 +
              (center(a).y - c.y) ** 2 -
              ((center(z).x - c.x) ** 2 + (center(z).y - c.y) ** 2),
          )[0];
        if (target) this.applyDamage(target, profile.chainTargets);
      }
      this.checkWin();
    }
    destroy(b, visited) {
      if (visited.has(b.id)) return;
      visited.add(b.id);
      b.health = 0;
      this.destroyed++;
      this.volleyBreaks++;
      let bonus = 90 + Math.min(b.initialHealth, 80) * 4;
      if (this.profile?.kind === "IMPACT_CORE")
        bonus += Math.round((bonus * this.profile.scoreBonusPercent) / 100);
      if (this.profile)
        bonus += Math.round((bonus * this.profile.masteryScorePercent) / 100);
      this.score += bonus;
      if (
        this.profile?.fortuneEveryBreaks &&
        this.volleyBreaks % this.profile.fortuneEveryBreaks === 0
      )
        this.score += this.profile.fortuneBonusScore;
      if (b.shieldLock)
        this.message = this.remainingGuards === 0
          ? "All locks broken - boss vulnerable!"
          : `${this.remainingGuards} boss locks remaining.`;
      if (b.kind === "BONUS_BALLS") this.earnedBalls += b.bonusValue || 5;
      if (b.kind === "BONUS_DAMAGE")
        this.bonus += Math.max(
          1,
          Math.round(((1 + this.bonus) * (b.bonusValue || 1)) / 100),
        );
      if (b.kind === "DYNAMITE")
        for (const p of this.bricks) {
          if (p.health > 0 && p.bombDestroyable && p.bombGroup === b.group) {
            this.destroy(p, visited);
          }
        }
      if (b.kind === "SUICIDE") {
        const c = center(b),
          beam = (43.9023 * 1.25) / 2,
          reach = 1625;
        for (const p of this.bricks) {
          const q = center(p),
            dx = Math.abs(c.x - q.x),
            dy = Math.abs(c.y - q.y);
          if (
            p.health > 0 &&
            Number.isFinite(p.health) &&
            p.kind !== "BOSS" &&
            ((dx <= beam + p.w / 2 && dy <= reach + p.h / 2) ||
              (dy <= beam + p.h / 2 && dx <= reach + p.w / 2))
          )
            this.destroy(p, visited);
        }
      }
    }
    checkWin() {
      if (this.targets === 0) {
        this.phase = "won";
        this.pending = 0;
        this.balls = [];
        this.message = "Stage cleared! Restart or select another stage.";
      }
    }
    touches(caster, target) {
      const c = center(caster),
        x = clamp(c.x, target.x, target.x + target.w),
        y = clamp(c.y, target.y, target.y + target.h);
      return (x - c.x) ** 2 + (y - c.y) ** 2 <= 62.2896 ** 2;
    }
    initialFreeze() {
      for (const c of this.bricks)
        if (c.kind === "ICE_FREEZE" && this.visible(c))
          for (const b of this.bricks)
            if (b.kind === "ICE" && this.touches(c, b)) b.frozen = true;
    }
    finishVolley() {
      this.pending = 0;
      this.ballCount = clamp(this.ballCount + this.earnedBalls, 1, 160);
      this.earnedBalls = 0;
      for (const b of this.bricks) {
        if (b.health <= 0) continue;
        if (b.kind === "SLIDER") {
          b.slideStep = b.moveDirection;
          b.moveDirection = b.moveDirection === 0 ? 1 : -b.moveDirection;
        }
        if (!this.visible(b)) continue;
        if (b.kind === "PROTECTOR" || b.kind === "ICE_FREEZE")
          for (const t of this.bricks) {
            if (t.health <= 0 || !this.touches(b, t)) continue;
            if (b.kind === "PROTECTOR" && t.kind === "BLACK")
              t.protected += b.protection ?? 2;
            if (b.kind === "ICE_FREEZE" && t.kind === "ICE") t.frozen = true;
          }
        if (b.kind === "ROTATING") {
          const current = ((b.angle % 360) + 360) % 360;
          const options = Array.from({ length: 12 }, (_, i) => i * 30).filter(
            (a) =>
              Math.abs(a - current) > 0.01 &&
              Math.abs(Math.abs(a - current) - 180) > 0.01,
          );
          const target = options[Math.floor(this.random() * options.length)];
          b.angleStart = b.angle;
          b.angleDelta = ((target - b.angle + 540) % 360) - 180;
        }
      }
      this.phase = "descending";
      this.descentTime = 0;
      this.message = "Formation descending";
    }
    torch(b, dt) {
      if (b.kind !== "TORCH" || b.health <= 0 || (!b.moveX && !b.moveY)) return;
      if (b.torchProgress < 1) {
        const old = b.torchOffset;
        b.torchProgress = Math.min(1, b.torchProgress + dt);
        const t = b.torchProgress,
          e = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
        b.torchOffset = b.torchFrom + (b.torchTarget - b.torchFrom) * e;
        if (b.moveX) b.x += (b.torchOffset - old) * 80;
        else b.y -= (b.torchOffset - old) * 80;
      } else if (this.phase === "ready") {
        b.torchIdle += dt;
        if (b.torchIdle >= 3) {
          const distance = b.moveX || b.moveY,
            targets = [];
          for (let i = Math.min(0, distance); i <= Math.max(0, distance); i++)
            if (i !== b.torchOffset) targets.push(i);
          b.torchFrom = b.torchOffset;
          b.torchTarget = targets[Math.floor(this.random() * targets.length)];
          b.torchProgress = 0;
          b.torchIdle = 0;
        }
      }
    }
  }
  if (typeof module === "object" && module.exports) module.exports = Sandbox;
  else root.VolleySandbox = Sandbox;
})(globalThis);
