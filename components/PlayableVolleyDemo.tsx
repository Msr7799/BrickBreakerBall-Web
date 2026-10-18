"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";

type Brick = { x: number; y: number; w: number; h: number; hp: number; color: string };
type Ball = { x: number; y: number; vx: number; vy: number; active: boolean; delay: number };

const W = 720;
const H = 960;
const BALL_COUNT = 14;
const palette = ["#ff4b2b", "#ff9b28", "#43bfff", "#a55cff", "#5ee687"];

function makeBricks(): Brick[] {
  const rows = ["2333332", "3221223", "2413142", "0234320", "0022200"];
  return rows.flatMap((row, y) => [...row].flatMap((cell, x) => cell === "0" ? [] : [{
    x: 56 + x * 88, y: 132 + y * 68, w: 76, h: 54,
    hp: Number(cell), color: palette[(x * 2 + y) % palette.length],
  }]));
}

export default function PlayableVolleyDemo({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: W / 2, y: H / 2 });
  const gameRef = useRef({ shooterX: W / 2, balls: [] as Ball[], bricks: makeBricks(), aiming: true, turn: 1, landingX: W / 2, cleared: false });
  const [message, setMessage] = useState(ar ? "حرّك خط التصويب واضغط لإطلاق الكرات" : "Aim, then tap to launch the balls");
  const [revision, setRevision] = useState(0);

  const reset = useCallback(() => {
    gameRef.current = { shooterX: W / 2, balls: [], bricks: makeBricks(), aiming: true, turn: 1, landingX: W / 2, cleared: false };
    setMessage(ar ? "حرّك خط التصويب واضغط لإطلاق الكرات" : "Aim, then tap to launch the balls");
    setRevision(value => value + 1);
  }, [ar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(.025, (now - last) / 1000);
      last = now;
      const game = gameRef.current;
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#19102b");
      gradient.addColorStop(.55, "#291335");
      gradient.addColorStop(1, "#05070c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = .18;
      ctx.strokeStyle = "#c761ff";
      ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        ctx.beginPath(); ctx.arc(W / 2, H + 80, 120 + i * 72, Math.PI, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(3,8,16,.82)";
      ctx.fillRect(0, 0, W, 86);
      ctx.strokeStyle = "#b54cff";
      ctx.beginPath(); ctx.moveTo(0, 86); ctx.lineTo(W, 86); ctx.stroke();

      game.balls.forEach(ball => {
        if (!ball.active) {
          ball.delay -= dt;
          if (ball.delay <= 0) ball.active = true;
          else return;
        }
        const previousX = ball.x;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        if (ball.x < 12 || ball.x > W - 12) {
          ball.x = Math.max(12, Math.min(W - 12, ball.x));
          ball.vx *= -1;
        }
        if (ball.y < 98) { ball.y = 98; ball.vy = Math.abs(ball.vy); }
        for (const brick of game.bricks) {
          if (brick.hp <= 0 || ball.x + 8 <= brick.x || ball.x - 8 >= brick.x + brick.w || ball.y + 8 <= brick.y || ball.y - 8 >= brick.y + brick.h) continue;
          brick.hp -= 1;
          if (previousX <= brick.x || previousX >= brick.x + brick.w) ball.vx *= -1;
          else ball.vy *= -1;
          break;
        }
        if (ball.y > 872) {
          if (game.landingX === game.shooterX) game.landingX = ball.x;
          ball.active = false;
          ball.delay = 999;
        }
      });
      if (!game.cleared && !game.bricks.some(brick => brick.hp > 0)) {
        game.cleared = true;
        game.aiming = false;
        setMessage(ar ? "أحسنت! دمّرت جميع القراميد" : "Stage clear! All bricks destroyed");
      } else if (!game.cleared && !game.aiming && game.balls.length && game.balls.every(ball => !ball.active && ball.delay > 900)) {
        game.shooterX = Math.max(30, Math.min(W - 30, game.landingX));
        game.landingX = game.shooterX;
        game.aiming = true;
        game.turn += 1;
        game.balls = [];
        setMessage(ar ? "اختر زاوية جديدة وأطلق" : "Choose a new angle and fire");
      }

      ctx.fillStyle = "white";
      ctx.font = "900 21px Arial";
      ctx.textAlign = "start";
      ctx.fillText(ar ? "تجربة VOLLEY" : "VOLLEY TRIAL", 28, 38);
      ctx.fillStyle = "#d69aff";
      ctx.font = "800 15px Arial";
      ctx.fillText(`${ar ? "الدور" : "TURN"}: ${game.turn}  ·  ${ar ? "الكرات" : "BALLS"}: ${BALL_COUNT}`, 28, 66);
      game.bricks.forEach(brick => {
        if (brick.hp <= 0) return;
        const glow = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.h);
        glow.addColorStop(0, brick.color); glow.addColorStop(1, "#111827");
        ctx.fillStyle = glow;
        ctx.strokeStyle = "rgba(255,255,255,.5)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 8); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = "900 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(brick.hp), brick.x + brick.w / 2, brick.y + brick.h / 2);
      });
      if (game.aiming && !game.cleared) {
        const dx = pointerRef.current.x - game.shooterX;
        const dy = Math.min(-40, pointerRef.current.y - 856);
        const length = Math.hypot(dx, dy) || 1;
        ctx.save(); ctx.setLineDash([9, 11]); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(game.shooterX, 856); ctx.lineTo(game.shooterX + dx / length * 230, 856 + dy / length * 230); ctx.stroke(); ctx.restore();
      }
      game.balls.forEach(ball => {
        if (!ball.active) return;
        ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.shadowColor = "#bd5cff"; ctx.shadowBlur = 13;
        ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      });
      ctx.beginPath(); ctx.fillStyle = "#d85cff"; ctx.shadowColor = "#d85cff"; ctx.shadowBlur = 20;
      ctx.arc(game.shooterX, 856, 15, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [ar, revision]);

  const aim = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    pointerRef.current = { x: (clientX - rect.left) * W / rect.width, y: (clientY - rect.top) * H / rect.height };
  };
  const launch = () => {
    const game = gameRef.current;
    if (!game.aiming || game.cleared) return;
    const dx = pointerRef.current.x - game.shooterX;
    const dy = Math.min(-60, pointerRef.current.y - 856);
    const length = Math.hypot(dx, dy) || 1;
    game.balls = Array.from({ length: BALL_COUNT }, (_, index) => ({
      x: game.shooterX, y: 856, vx: dx / length * 470, vy: dy / length * 470,
      active: index === 0, delay: index * .075,
    }));
    game.aiming = false;
    setMessage(ar ? "تابع الارتدادات وابحث عن المسار الأفضل" : "Watch the ricochets and find the best route");
  };

  return (
    <section id="volley" className="playable-demo" aria-label={ar ? "تجربة الفولي" : "Playable Volley demo"}>
      <div className="demo-frame demo-volley">
        <canvas ref={canvasRef} width={W} height={H} onPointerMove={event => aim(event.clientX, event.clientY)} onPointerDown={event => { aim(event.clientX, event.clientY); launch(); }} aria-label={ar ? "مرحلة فولي تجريبية" : "Playable Volley stage"} />
      </div>
      <div className="demo-toolbar"><p aria-live="polite">{message}</p><button onClick={reset}>{ar ? "إعادة المرحلة" : "RESTART STAGE"}</button></div>
      <p className="demo-help">{ar ? "التحكم: حرّك مؤشر التصويب ثم اضغط لإطلاق الكرات" : "Controls: aim with touch or mouse, then tap to fire"}</p>
    </section>
  );
}
