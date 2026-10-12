"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";

type Mode = "classic" | "volley";
type Brick = { x: number; y: number; w: number; h: number; hp: number; max: number; color: string };
type Ball = { x: number; y: number; vx: number; vy: number; active: boolean; delay: number };

const W = 720;
const H = 960;
const palette = ["#ff4b2b", "#ff9b28", "#43bfff", "#a55cff", "#5ee687"];

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke();
}

function makeClassicBricks(): Brick[] {
  const rows = ["11111111", "12222221", "11333311", "10122101", "11100111"];
  return rows.flatMap((row, y) => [...row].flatMap((cell, x) => cell === "0" ? [] : [{ x: 48 + x * 79, y: 126 + y * 55, w: 69, h: 39, hp: Number(cell), max: Number(cell), color: palette[(x + y) % palette.length] }]));
}

function makeVolleyBricks(): Brick[] {
  const rows = ["2333332", "3221223", "2413142", "0234320", "0022200"];
  return rows.flatMap((row, y) => [...row].flatMap((cell, x) => cell === "0" ? [] : [{ x: 56 + x * 88, y: 132 + y * 68, w: 76, h: 54, hp: Number(cell), max: Number(cell), color: palette[(x * 2 + y) % palette.length] }]));
}

function hitBrick(ball: Ball, brick: Brick, radius: number) {
  return brick.hp > 0 && ball.x + radius > brick.x && ball.x - radius < brick.x + brick.w && ball.y + radius > brick.y && ball.y - radius < brick.y + brick.h;
}

export default function PlayableDemo({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const modeRef = useRef<Mode>("classic");
  const pointerRef = useRef({ x: W / 2, y: H / 2 });
  const keysRef = useRef(new Set<string>());
  const classicRef = useRef({ paddleX: W / 2 - 78, ball: { x: W / 2, y: 790, vx: 250, vy: -360, active: false, delay: 0 } as Ball, bricks: makeClassicBricks(), lives: 3 });
  const volleyRef = useRef({ shooterX: W / 2, balls: [] as Ball[], bricks: makeVolleyBricks(), aiming: true, launched: 0, total: 14, turn: 1, landingX: W / 2 });
  const [mode, setMode] = useState<Mode>("classic");
  const [message, setMessage] = useState(ar ? "حرّك المضرب واضغط للبدء" : "Move the paddle and tap to launch");
  const [revision, setRevision] = useState(0);

  const reset = useCallback((nextMode = modeRef.current) => {
    classicRef.current = { paddleX: W / 2 - 78, ball: { x: W / 2, y: 790, vx: 250, vy: -360, active: false, delay: 0 }, bricks: makeClassicBricks(), lives: 3 };
    volleyRef.current = { shooterX: W / 2, balls: [], bricks: makeVolleyBricks(), aiming: true, launched: 0, total: 14, turn: 1, landingX: W / 2 };
    setMessage(nextMode === "classic" ? (ar ? "حرّك المضرب واضغط للبدء" : "Move the paddle and tap to launch") : (ar ? "حرّك خط التصويب واضغط لإطلاق 14 كرة" : "Aim, then tap to launch 14 balls"));
    setRevision(v => v + 1);
  }, [ar]);

  const chooseMode = useCallback((next: Mode) => {
    modeRef.current = next; setMode(next); reset(next);
  }, [reset]);

  useEffect(() => {
    if (window.location.hash === "#volley") chooseMode("volley");
  }, [chooseMode]);

  const drawBackdrop = useCallback((ctx: CanvasRenderingContext2D, current: Mode) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, current === "classic" ? "#071e38" : "#19102b");
    gradient.addColorStop(.55, current === "classic" ? "#102943" : "#291335");
    gradient.addColorStop(1, "#05070c");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .18; ctx.strokeStyle = current === "classic" ? "#4fd7ff" : "#c761ff"; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(W / 2, H + 80, 120 + i * 72, Math.PI, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(3,8,16,.82)"; ctx.fillRect(0, 0, W, 86);
    ctx.strokeStyle = current === "classic" ? "#2fc8ff" : "#b54cff"; ctx.beginPath(); ctx.moveTo(0, 86); ctx.lineTo(W, 86); ctx.stroke();
  }, []);

  const drawBricks = useCallback((ctx: CanvasRenderingContext2D, bricks: Brick[], volley: boolean) => {
    bricks.forEach(brick => {
      if (brick.hp <= 0) return;
      const glow = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.h);
      glow.addColorStop(0, brick.color); glow.addColorStop(1, "#111827");
      ctx.fillStyle = glow; ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.5; ctx.shadowColor = brick.color; ctx.shadowBlur = 12; rounded(ctx, brick.x, brick.y, brick.w, brick.h, 8); ctx.shadowBlur = 0;
      if (volley || brick.max > 1) { ctx.fillStyle = "white"; ctx.font = "900 20px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(brick.hp), brick.x + brick.w / 2, brick.y + brick.h / 2); }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(.025, (now - last) / 1000); last = now;
      const currentMode = modeRef.current;
      drawBackdrop(ctx, currentMode);

      if (currentMode === "classic") {
        const game = classicRef.current; const ball = game.ball;
        const direction = (keysRef.current.has("ArrowLeft") || keysRef.current.has("a") ? -1 : 0) + (keysRef.current.has("ArrowRight") || keysRef.current.has("d") ? 1 : 0);
        if (direction) game.paddleX = Math.max(18, Math.min(W - 174, game.paddleX + direction * 480 * dt));
        if (!ball.active) ball.x = game.paddleX + 78;
        if (ball.active) {
          const px = ball.x, py = ball.y; ball.x += ball.vx * dt; ball.y += ball.vy * dt;
          if (ball.x < 15 || ball.x > W - 15) { ball.x = Math.max(15, Math.min(W - 15, ball.x)); ball.vx *= -1; }
          if (ball.y < 100) { ball.y = 100; ball.vy = Math.abs(ball.vy); }
          if (ball.vy > 0 && ball.y > 820 && ball.y < 858 && ball.x > game.paddleX - 15 && ball.x < game.paddleX + 171) { const offset = (ball.x - (game.paddleX + 78)) / 78; ball.vx = offset * 430; ball.vy = -Math.max(330, Math.abs(ball.vy)); ball.y = 818; }
          for (const brick of game.bricks) if (hitBrick(ball, brick, 10)) { brick.hp--; const fromSide = px <= brick.x || px >= brick.x + brick.w; if (fromSide) ball.vx *= -1; else ball.vy *= -1; break; }
          if (ball.y > H + 20) { game.lives--; ball.active = false; ball.y = 790; ball.vx = 250; ball.vy = -360; setMessage(game.lives > 0 ? (ar ? `بقيت ${game.lives} فرص — اضغط للمتابعة` : `${game.lives} lives left — tap to continue`) : (ar ? "انتهت المحاولة — أعد المرحلة" : "Run over — restart the stage")); }
          if (!game.bricks.some(b => b.hp > 0)) { ball.active = false; setMessage(ar ? "أحسنت! أنهيت مرحلة Classic" : "Stage clear! Classic mastered"); }
        }
        ctx.fillStyle = "white"; ctx.font = "900 21px Arial"; ctx.textAlign = "start"; ctx.fillText(ar ? "تجربة CLASSIC" : "CLASSIC TRIAL", 28, 38); ctx.fillStyle = "#8fdcff"; ctx.font = "800 15px Arial"; ctx.fillText(`${ar ? "الفرص" : "LIVES"}: ${game.lives}`, 28, 66);
        drawBricks(ctx, game.bricks, false);
        const paddle = ctx.createLinearGradient(game.paddleX, 0, game.paddleX + 156, 0); paddle.addColorStop(0, "#ff5a22"); paddle.addColorStop(.5, "#ffe0a0"); paddle.addColorStop(1, "#ff5a22"); ctx.fillStyle = paddle; ctx.strokeStyle = "white"; ctx.shadowColor = "#ff762e"; ctx.shadowBlur = 18; rounded(ctx, game.paddleX, 832, 156, 24, 12); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.fillStyle = "#f9fbff"; ctx.shadowColor = "#55c9ff"; ctx.shadowBlur = 16; ctx.arc(ball.x, ball.y, 11, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      } else {
        const game = volleyRef.current;
        game.balls.forEach(ball => {
          if (!ball.active) { ball.delay -= dt; if (ball.delay <= 0) ball.active = true; else return; }
          const px = ball.x, py = ball.y; ball.x += ball.vx * dt; ball.y += ball.vy * dt;
          if (ball.x < 12 || ball.x > W - 12) { ball.x = Math.max(12, Math.min(W - 12, ball.x)); ball.vx *= -1; }
          if (ball.y < 98) { ball.y = 98; ball.vy = Math.abs(ball.vy); }
          for (const brick of game.bricks) if (hitBrick(ball, brick, 8)) { brick.hp--; const fromSide = px <= brick.x || px >= brick.x + brick.w; if (fromSide) ball.vx *= -1; else ball.vy *= -1; break; }
          if (ball.y > 872) { if (game.landingX === game.shooterX) game.landingX = ball.x; ball.active = false; ball.delay = 999; }
        });
        if (!game.aiming && game.balls.length && game.balls.every(b => !b.active && b.delay > 900)) { game.shooterX = Math.max(30, Math.min(W - 30, game.landingX)); game.landingX = game.shooterX; game.aiming = true; game.turn++; game.balls = []; setMessage(ar ? "اختر زاوية جديدة وأطلق" : "Choose a new angle and fire"); }
        if (!game.bricks.some(b => b.hp > 0)) { game.aiming = false; setMessage(ar ? "أحسنت! دمّرت نواة Volley" : "Core destroyed! Volley mastered"); }
        ctx.fillStyle = "white"; ctx.font = "900 21px Arial"; ctx.textAlign = "start"; ctx.fillText(ar ? "تجربة VOLLEY" : "VOLLEY TRIAL", 28, 38); ctx.fillStyle = "#d69aff"; ctx.font = "800 15px Arial"; ctx.fillText(`${ar ? "الدور" : "TURN"}: ${game.turn}  ·  ${ar ? "الكرات" : "BALLS"}: ${game.total}`, 28, 66);
        drawBricks(ctx, game.bricks, true);
        if (game.aiming && game.bricks.some(b => b.hp > 0)) { const dx = pointerRef.current.x - game.shooterX; const dy = Math.min(-40, pointerRef.current.y - 856); const len = Math.hypot(dx, dy) || 1; ctx.save(); ctx.setLineDash([9, 11]); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(game.shooterX, 856); ctx.lineTo(game.shooterX + dx / len * 230, 856 + dy / len * 230); ctx.stroke(); ctx.restore(); }
        game.balls.forEach(ball => { if (!ball.active) return; ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.shadowColor = "#bd5cff"; ctx.shadowBlur = 13; ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });
        ctx.beginPath(); ctx.fillStyle = "#d85cff"; ctx.shadowColor = "#d85cff"; ctx.shadowBlur = 20; ctx.arc(game.shooterX, 856, 15, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [ar, drawBackdrop, drawBricks, revision]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current.add(e.key); if (e.code === "Space") { e.preventDefault(); canvasRef.current?.click(); } };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const canvasPoint = (clientX: number, clientY: number) => { const rect = canvasRef.current!.getBoundingClientRect(); return { x: (clientX - rect.left) * W / rect.width, y: (clientY - rect.top) * H / rect.height }; };
  const move = (clientX: number, clientY: number) => { const p = canvasPoint(clientX, clientY); pointerRef.current = p; if (modeRef.current === "classic") { const game = classicRef.current; game.paddleX = Math.max(18, Math.min(W - 174, p.x - 78)); } };
  const launch = () => {
    if (modeRef.current === "classic") { const game = classicRef.current; if (game.lives > 0 && game.bricks.some(b => b.hp > 0)) { game.ball.active = true; setMessage(ar ? "اكسر جميع القراميد" : "Break every brick"); } }
    else { const game = volleyRef.current; if (!game.aiming || !game.bricks.some(b => b.hp > 0)) return; const dx = pointerRef.current.x - game.shooterX; const dy = Math.min(-60, pointerRef.current.y - 856); const len = Math.hypot(dx, dy) || 1; const speed = 470; game.balls = Array.from({ length: game.total }, (_, i) => ({ x: game.shooterX, y: 856, vx: dx / len * speed, vy: dy / len * speed, active: i === 0, delay: i * .075 })); game.aiming = false; setMessage(ar ? "تابع الارتدادات وابحث عن المسار الأفضل" : "Watch the ricochets and find the best route"); }
  };

  return (
    <section className="playable-demo" aria-label={ar ? "تجربة اللعب" : "Playable game demo"}>
      <div className="mode-toggle" role="tablist" aria-label={ar ? "اختيار نمط اللعب" : "Choose game mode"}>
        <button role="tab" aria-selected={mode === "classic"} onClick={() => chooseMode("classic")} className={mode === "classic" ? "active classic" : ""}>CLASSIC</button>
        <button role="tab" aria-selected={mode === "volley"} onClick={() => chooseMode("volley")} className={mode === "volley" ? "active volley" : ""}>VOLLEY</button>
      </div>
      <div className={`demo-frame demo-${mode}`}>
        <canvas ref={canvasRef} width={W} height={H} onPointerMove={e => move(e.clientX, e.clientY)} onPointerDown={e => { move(e.clientX, e.clientY); launch(); }} aria-label={mode === "classic" ? "Playable Classic stage" : "Playable Volley stage"} />
      </div>
      <div className="demo-toolbar"><p aria-live="polite">{message}</p><button onClick={() => reset()}>{ar ? "إعادة المرحلة" : "RESTART STAGE"}</button></div>
      <p className="demo-help">{mode === "classic" ? (ar ? "التحكم: اللمس أو الماوس أو الأسهم و A / D" : "Controls: touch, mouse, arrow keys or A / D") : (ar ? "التحكم: حرّك مؤشر التصويب ثم اضغط لإطلاق الكرات" : "Controls: aim with touch or mouse, then tap to fire")}</p>
    </section>
  );
}
