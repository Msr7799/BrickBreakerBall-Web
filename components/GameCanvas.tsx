"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/site";
import { worlds } from "@/lib/site";
import ballFilesData from "@/content/ball-files.json";

const W = 900;
const H = 1600;
const PLAY_TOP = 205;
const PADDLE_Y = 1480;
const BALL_R = 17;

type Status = "ready" | "playing" | "paused" | "won" | "gameover";
type Kind = "basic" | "blue" | "red" | "purple" | "green" | "orange" | "pink" | "electric" | "stone" | "armored" | "rough" | "steel" | "blackhole" | "lightning" | "powerup" | "boss";
type DropType = "life" | "expand" | "slow";
type PaddleForm = "normal" | "weapon" | "sticky";
type Brick = { x: number; y: number; w: number; h: number; kind: Kind; hp: number; maxHp: number; breakable: boolean };
type Drop = { x: number; y: number; vy: number; type: DropType };
type Physics = {
  paddleX: number;
  paddleW: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  bricks: Brick[];
  drops: Drop[];
  score: number;
  lives: number;
  stage: number;
  world: number;
  worldStage: number;
  lastTime: number;
};

type PaddleAsset = {
  spriteNumber: number;
  displayName?: { en: string; ar: string };
  file?: string;
  name?: string;
  type?: string;
  style?: string;
  group?: { id?: string; en?: string; ar?: string };
  x: number;
  y: number;
  width: number;
  height: number;
  sheet: string;
  sheetWidth: number;
  sheetHeight: number;
  previewSrc?: string;
};

type PaddleStyle = {
  id: string;
  normal: PaddleAsset;
  weapon: PaddleAsset;
  sticky: PaddleAsset;
};

type RawPaddleAsset = Omit<PaddleAsset, "spriteNumber" | "displayName" | "sheet" | "sheetWidth" | "sheetHeight"> & {
  spriteNumber?: number;
  displayName?: { en: string; ar: string };
  type?: string;
  style?: string;
  group?: { id?: string; en?: string; ar?: string };
};

const paddleGroups = [
  ["paddles-group1.json", "paddle-group1.png"],
  ["paddles-group2.json", "paddles-group2.png"],
  ["paddles-group3.json", "paddle-group3.png"],
  ["paddles-group4.json", "paddles-group4.png"],
  ["paddles-group5.json", "paddles-group5.png"],
  ["paddles-group6.json", "paddles-group6.png"]
] as const;

const defaultPaddle: PaddleAsset = {
  spriteNumber: 2,
  displayName: { en: "Titanium Edge", ar: "حافة التيتانيوم" },
  file: "paddle_normal_titanium_edge.png",
  x: 18,
  y: 166,
  width: 396,
  height: 86,
  sheet: "/game/assets/sprites/paddles-sprites/paddle-group1.png",
  sheetWidth: 1235,
  sheetHeight: 1254,
  previewSrc: "/game/paddles/group1/style1-normal.png"
};

const ballFiles = ballFilesData as string[];

const starterBalls = [
  ["38_chrome_mirror.png", "Chrome Mirror"],
  ["39_black_gloss.png", "Black Gloss"],
  ["43_amber_glass.png", "Amber Glass"],
  ["44_orange_glass.png", "Orange Glass"],
  ["42_smoky_stone.png", "Smoky Stone"],
  ["41_pearl_white.png", "Pearl White"]
] as const;

const brickArt: Record<Kind, [string, string?]> = {
  basic: ["brick_basic_one_hit.png"],
  blue: ["brick_crystal_blue_intact.png", "brick_crystal_blue_damaged.png"],
  red: ["brick_crystal_red_intact.png", "brick_crystal_red_damaged.png"],
  purple: ["brick_crystal_purple_intact.png", "brick_crystal_purple_damaged.png"],
  green: ["brick_crystal_green_intact.png", "brick_crystal_green_damaged.png"],
  orange: ["brick_crystal_orange_intact.png", "brick_crystal_orange_damaged.png"],
  pink: ["brick_crystal_pink_intact.png", "brick_crystal_pink_damaged.png"],
  electric: ["brick_electric_white_intact.png", "brick_electric_white_damaged.png"],
  stone: ["brick_stone_gray_intact.png", "brick_stone_gray_damaged.png"],
  armored: ["brick_armored_dark_intact.png", "brick_armored_dark_damaged.png"],
  rough: ["brick_rough_stone.png"],
  steel: ["brick_steel_unbreakable.png"],
  blackhole: ["brick_black_hole_teleporter.png"],
  lightning: ["brick_lightning_speed_pass_through.png"],
  powerup: ["brick_random_inventory_powerup.png"],
  boss: ["brick_armored_dark_intact.png", "brick_armored_dark_damaged.png"]
};

const worldMaterials: Kind[][] = [
  ["basic", "basic", "blue", "basic", "red"],
  ["basic", "red", "basic", "green", "blue"],
  ["basic", "blue", "red", "electric", "purple"],
  ["basic", "orange", "stone", "red", "orange"],
  ["red", "green", "blue", "electric", "basic"],
  ["electric", "blue", "purple", "armored", "red"],
  ["red", "blue", "green", "orange", "pink"],
  ["electric", "red", "blue", "stone", "armored"],
  ["purple", "armored", "pink", "red", "stone"],
  ["electric", "orange", "blue", "purple", "red"],
  ["armored", "purple", "red", "pink", "stone"],
  ["stone", "electric", "blue", "red", "orange"],
  ["red", "orange", "armored", "stone", "purple"]
];

const baseTargets = [22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 54, 60];

function campaignPosition(stage: number) {
  if (stage <= 84) {
    const world = Math.floor((stage - 1) / 7) + 1;
    return { world, worldStage: stage - (world - 1) * 7, worldStages: 7 };
  }
  return { world: 13, worldStage: stage - 84, worldStages: 6 };
}

function boardHash(levelId: number, row: number, column: number) {
  const v = BigInt(levelId) * 1103515245n + BigInt(row) * 92821n + BigInt(column) * 68917n;
  return Number(v & 2147483647n);
}

function hpFor(kind: Kind) {
  if (["blue", "red", "purple", "green", "orange", "pink", "electric", "stone", "armored"].includes(kind)) return 2;
  if (kind === "steel") return 999;
  return 1;
}

function makeBoard(stage: number): { bricks: Brick[]; world: number; worldStage: number } {
  const { world, worldStage, worldStages } = campaignPosition(stage);
  const rows = 8;
  const cols = 9;
  const gap = 8;
  const left = 42;
  const brickW = (W - left * 2 - gap * (cols - 1)) / cols;
  const brickH = 53;
  const rowGap = 11;
  const top = 300;
  const map = new Map<string, Kind>();
  const mats = worldMaterials[world - 1];
  const proceduralRows = world >= 2 ? rows - 1 : rows;
  const positions: Array<[number, number]> = [];
  for (let r = 0; r < proceduralRows; r++) for (let c = 0; c < cols; c++) positions.push([r, c]);
  positions.sort((a, b) => boardHash(stage, a[0], a[1]) - boardHash(stage, b[0], b[1]));
  const target = Math.min(66, baseTargets[world - 1] + (worldStage - 1) * 2);
  positions.slice(0, target).forEach(([r, c], i) => map.set(`${r}:${c}`, mats[(i + worldStage + r * 2) % mats.length]));

  if (world >= 2) {
    for (let c = 0; c < cols; c++) map.set(`${rows - 1}:${c}`, mats[(c + worldStage + world) % mats.length]);
  }

  const place = (r: number, c: number, kind: Kind) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) map.set(`${r}:${c}`, kind);
  };

  if (worldStage === 1) for (let c = 0; c < cols; c++) place(0, c, mats[c % mats.length]);
  if (worldStage === 2) for (let r = 0; r < 6; r++) { place(r, (r + world) % cols, mats[(r + 2) % mats.length]); place(r, cols - 1 - ((r + world) % cols), "basic"); }
  if (worldStage === 3) for (let c = 1; c < 8; c++) { place(2, c, mats[(c + 1) % mats.length]); place(4, c, mats[(c + 3) % mats.length]); }
  if (worldStage === 4) for (let r = 0; r < 7; r++) { place(r, 0, mats[r % mats.length]); place(r, 8, mats[(r + 2) % mats.length]); }
  if (worldStage === 5) for (let r = 0; r < 7; r++) for (let c = r; c <= 8 - Math.min(r, 4); c++) place(r, c, mats[(r + c) % mats.length]);
  if (worldStage === 6) for (let c = 0; c < cols; c++) place(3, c, mats[(c + worldStage) % mats.length]);
  if (worldStage === 7) for (let r = 0; r < 7; r++) place(r, (r * 2 + world) % cols, mats[r % mats.length]);

  if (world >= 3 && worldStage >= 4) place(1, 4, "blackhole");
  if (world >= 5 && worldStage >= 3) place(2, 2, "lightning");
  if (world >= 7 && worldStage >= 4) place(2, 6, "steel");
  if (world >= 9 && worldStage >= 5) place(4, 4, "rough");
  if ([3, 6, 9, 12].includes(world) && worldStage === 6) {
    [[0,1],[0,3],[0,5],[0,7],[2,2],[2,4],[2,6]].forEach(([r,c]) => place(r, c, "powerup"));
  }
  if (worldStage === worldStages) {
    place(3, 4, "boss");
    place(2, 3, "armored"); place(2, 5, "armored"); place(4, 3, "armored"); place(4, 5, "armored");
  }

  const bricks: Brick[] = [];
  for (const [key, kind] of map.entries()) {
    const [r, c] = key.split(":").map(Number);
    const boss = kind === "boss";
    const hp = boss ? 5 + world * 2 : hpFor(kind);
    bricks.push({
      x: left + c * (brickW + gap),
      y: top + r * (brickH + rowGap),
      w: brickW,
      h: brickH,
      kind,
      hp,
      maxHp: hp,
      breakable: kind !== "steel"
    });
  }
  return { bricks, world, worldStage };
}

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

function assetLabel(file: string) {
  return file.replace(/^\d+_/, "").replace(/\.png$/, "").replace(/_/g, " ");
}

function paddleKind(item: PaddleAsset): PaddleForm {
  const declared = (item.group?.id || item.type || "").toLowerCase();
  if (declared === "weapon" || declared === "sticky" || declared === "normal") return declared;
  const name = (item.file || item.name || item.displayName?.en || "").toLowerCase();
  if (name.includes("weapon") || name.includes("blaster") || name.includes("cannon")) return "weapon";
  if (name.includes("sticky") || name.includes("gel") || name.includes("resin") || name.includes("membrane") || name.includes("foam") || name.includes("pad") || name.includes("mesh")) return "sticky";
  return "normal";
}

function fitImage(ctx: CanvasRenderingContext2D, image: CanvasImageSource, sourceWidth: number, sourceHeight: number, targetX: number, targetY: number, targetWidth: number, targetHeight: number) {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  ctx.drawImage(image, targetX + (targetWidth - width) / 2, targetY + (targetHeight - height) / 2, width, height);
}

function fitCrop(ctx: CanvasRenderingContext2D, image: CanvasImageSource, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, targetX: number, targetY: number, targetWidth: number, targetHeight: number) {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, targetX + (targetWidth - width) / 2, targetY + (targetHeight - height) / 2, width, height);
}

export default function GameCanvas({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  const t = useMemo(() => ar ? {
    stage: "المرحلة", world: "العالم", score: "النقاط", lives: "الحياة", launch: "ابدأ", pause: "إيقاف", resume: "متابعة", restart: "إعادة", sound: "الصوت", clear: "تم إنهاء المرحلة", next: "المرحلة التالية", gameOver: "انتهت اللعبة", retry: "حاول مجددًا", ready: "حرّك المضرب ثم اضغط للبدء", controls: "اسحب باللمس أو الماوس، أو استخدم الأسهم / A و D", ball: "الكرة", unlocked: "أعلى مرحلة مفتوحة", paddle: "المضرب", selectWorld: "اختر العالم", selectBall: "اختر الكرة", selectPaddle: "اختر البادل", loadout: "التجهيزات", balls: "الكور", paddles: "المضارب", equipped: "مجهز", normal: "عادي", weapon: "مسلح", sticky: "لاصق", chooseForm: "اختر شكل البادل"
  } : {
    stage: "STAGE", world: "WORLD", score: "SCORE", lives: "LIVES", launch: "LAUNCH", pause: "PAUSE", resume: "RESUME", restart: "RESTART", sound: "SOUND", clear: "STAGE CLEAR", next: "NEXT STAGE", gameOver: "GAME OVER", retry: "TRY AGAIN", ready: "Move the paddle, then tap to launch", controls: "Drag with touch/mouse, or use Arrow keys / A and D", ball: "BALL", unlocked: "Highest unlocked", paddle: "PADDLE", selectWorld: "SELECT WORLD", selectBall: "SELECT BALL", selectPaddle: "SELECT PADDLE", loadout: "LOADOUT", balls: "BALLS", paddles: "PADDLES", equipped: "EQUIPPED", normal: "NORMAL", weapon: "WEAPON", sticky: "STICKY", chooseForm: "CHOOSE PADDLE FORM"
  }, [ar]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsRef = useRef<Physics | null>(null);
  const statusRef = useRef<Status>("ready");
  const keysRef = useRef(new Set<string>());
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});
  const soundRef = useRef(true);
  const ballFileRef = useRef<string>(starterBalls[0][0]);
  const paddleRef = useRef<PaddleAsset | null>(defaultPaddle);

  const [stage, setStage] = useState(1);
  const [maxUnlocked, setMaxUnlocked] = useState(1);
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(4);
  const [sound, setSound] = useState(true);
  const [ballFile, setBallFile] = useState<string>(starterBalls[0][0]);
  const [paddleStyles, setPaddleStyles] = useState<PaddleStyle[]>([]);
  const [paddleStyleId, setPaddleStyleId] = useState("0-0");
  const [paddleForm, setPaddleForm] = useState<PaddleForm>("normal");
  const [paddle, setPaddle] = useState<PaddleAsset | null>(defaultPaddle);
  const [loadoutTab, setLoadoutTab] = useState<"paddles" | "balls">("paddles");
  const { world, worldStage } = campaignPosition(stage);
  const worldInfo = worlds[world - 1];

  const setGameStatus = useCallback((value: Status) => {
    statusRef.current = value;
    setStatus(value);
  }, []);

  const playSound = useCallback((name: string) => {
    if (!soundRef.current) return;
    const a = audioRef.current[name];
    if (!a) return;
    try { a.currentTime = 0; void a.play(); } catch { /* browser may block until interaction */ }
  }, []);

  const resetStage = useCallback((targetStage: number) => {
    const board = makeBoard(targetStage);
    const localStage = campaignPosition(targetStage).worldStage;
    const localLives = board.world === 1 || ([3,6,9,12].includes(board.world) && localStage === 6) ? 4 : 3;
    const speed = Math.min(920, 600 + (board.world - 1) * 20 + (localStage - 1) * 5);
    physicsRef.current = {
      paddleX: W / 2 - 95,
      paddleW: 190,
      ballX: W / 2,
      ballY: PADDLE_Y - BALL_R - 1,
      ballVX: speed * .42,
      ballVY: -speed,
      bricks: board.bricks,
      drops: [],
      score: 0,
      lives: localLives,
      stage: targetStage,
      world: board.world,
      worldStage: board.worldStage,
      lastTime: performance.now()
    };
    setScore(0);
    setLives(localLives);
    setGameStatus("ready");
  }, [setGameStatus]);

  useEffect(() => {
    const savedMax = Number(window.localStorage.getItem("bbb-web-max-stage") || "1");
    const savedStage = Number(window.localStorage.getItem("bbb-web-stage") || "1");
    const savedBall = window.localStorage.getItem("bbb-web-ball");
    const safeMax = clamp(Number.isFinite(savedMax) ? savedMax : 1, 1, 90);
    const safeStage = clamp(Number.isFinite(savedStage) ? savedStage : 1, 1, safeMax);
    setMaxUnlocked(safeMax);
    setStage(safeStage);
    if (savedBall && ballFiles.includes(savedBall as typeof ballFiles[number])) setBallFile(savedBall);
  }, []);

  useEffect(() => {
    const paths = new Set<string>();
    Object.values(brickArt).forEach(([a, b]) => { paths.add(`/game/assets/brick/${a}`); if (b) paths.add(`/game/assets/brick/${b}`); });
    paths.add("/game/assets/paddle/paddle_normal.png");
    ballFiles.forEach(file => paths.add(`/game/assets/sprites/balls-sprites/balls_set/${file}`));
    paddleGroups.forEach(([, image]) => paths.add(`/game/assets/sprites/paddles-sprites/${image}`));
    paths.add("/game/assets/powerup/powerup_extra_life.png");
    paths.add("/game/assets/powerup/powerup_expand_paddle.png");
    paths.add("/game/assets/powerup/powerup_slow_ball.png");
    paths.forEach(src => { const img = new Image(); img.src = src; imagesRef.current[src] = img; });

    const loadPaddles = async () => {
      const styles: PaddleStyle[] = [];
      for (let groupIndex = 0; groupIndex < paddleGroups.length; groupIndex++) {
        const [json, image] = paddleGroups[groupIndex];
        const response = await fetch(`/game/assets/sprites/paddles-sprites/${json}`);
        if (!response.ok) continue;
        const frames = await response.json() as RawPaddleAsset[];
        const sheetWidth = Math.max(...frames.map(frame => frame.x + frame.width));
        const sheetHeight = Math.max(...frames.map(frame => frame.y + frame.height));
        const loaded = frames.map((frame, index) => ({
          ...frame,
          spriteNumber: frame.spriteNumber ?? index + 1,
          displayName: frame.displayName || {
            en: frame.file ? assetLabel(frame.file) : `${frame.type || "Paddle"} ${frame.style || index + 1}`,
            ar: frame.file ? assetLabel(frame.file) : `${frame.type || "مضرب"} ${frame.style || index + 1}`
          },
          sheet: `/game/assets/sprites/paddles-sprites/${image}`,
          sheetWidth,
          sheetHeight
        }));
        for (let index = 0; index + 2 < loaded.length; index += 3) {
          const trio = loaded.slice(index, index + 3);
          const styleNumber = index / 3 + 1;
          const withPreview = (item: PaddleAsset, form: PaddleForm): PaddleAsset => ({
            ...item,
            previewSrc: `/game/paddles/group${groupIndex + 1}/style${styleNumber}-${form}.png`
          });
          const normal = withPreview(trio.find(item => paddleKind(item) === "normal") || trio[0], "normal");
          const weapon = withPreview(trio.find(item => paddleKind(item) === "weapon") || trio[1], "weapon");
          const sticky = withPreview(trio.find(item => paddleKind(item) === "sticky") || trio[2], "sticky");
          styles.push({ id: `${groupIndex}-${index / 3}`, normal, weapon, sticky });
        }
      }
      setPaddleStyles(styles);
      const savedPaddle = window.localStorage.getItem("bbb-web-paddle-style");
      const savedForm = window.localStorage.getItem("bbb-web-paddle-form") as PaddleForm | null;
      const selected = styles.find(item => item.id === savedPaddle) || styles[0];
      const form: PaddleForm = savedForm && ["normal", "weapon", "sticky"].includes(savedForm) ? savedForm : "normal";
      setPaddleStyleId(selected?.id || "0-0");
      setPaddleForm(form);
      setPaddle(selected?.[form] || selected?.normal || defaultPaddle);
    };
    void loadPaddles();

    audioRef.current = {
      brick: new Audio("/game/audio/brick_hit.ogg"),
      wall: new Audio("/game/audio/wall_hit.ogg"),
      power: new Audio("/game/audio/powerup.ogg"),
      explosion: new Audio("/game/audio/explosion.ogg")
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem("bbb-web-stage", String(stage));
    resetStage(stage);
  }, [stage, resetStage]);

  useEffect(() => { soundRef.current = sound; }, [sound]);
  useEffect(() => { ballFileRef.current = ballFile; }, [ballFile]);
  useEffect(() => { paddleRef.current = paddle; }, [paddle]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, p: Physics) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(4, 8, 15, .36)";
    ctx.fillRect(0, PLAY_TOP, W, H - PLAY_TOP);

    ctx.fillStyle = "rgba(7, 11, 17, .90)";
    ctx.fillRect(0, 0, W, 180);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(W, 180); ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,.48)";
    ctx.font = "700 22px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`${t.world} ${p.world}`, 36, 48);
    ctx.fillText(`${t.stage} ${p.stage}`, 36, 92);
    ctx.textAlign = "right";
    ctx.fillText(`${t.score} ${p.score}`, W - 36, 48);
    ctx.fillText(`${t.lives} ${p.lives}`, W - 36, 92);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "900 27px system-ui";
    ctx.fillText(ar ? worldInfo.ar : worldInfo.en, W / 2, 135);

    const cache = imagesRef.current;
    for (const brick of p.bricks) {
      if (brick.breakable && brick.hp <= 0) continue;
      const art = brickArt[brick.kind];
      const useDamaged = brick.maxHp > 1 && brick.hp > 0 && brick.hp <= Math.max(1, Math.ceil(brick.maxHp * .45)) && art[1];
      const src = `/game/assets/brick/${useDamaged ? art[1] : art[0]}`;
      const img = cache[src];
      if (img?.complete && img.naturalWidth) {
        fitImage(ctx, img, img.naturalWidth, img.naturalHeight, brick.x, brick.y, brick.w, brick.h);
      } else {
        ctx.fillStyle = brick.breakable ? "#7f1d1d" : "#4b5563";
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      }
      if (brick.kind === "boss") {
        const pct = clamp(brick.hp / brick.maxHp, 0, 1);
        ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(brick.x, brick.y - 8, brick.w, 5);
        ctx.fillStyle = "#ca3500"; ctx.fillRect(brick.x, brick.y - 8, brick.w * pct, 5);
      }
    }

    for (const drop of p.drops) {
      const file = drop.type === "life" ? "powerup_extra_life.png" : drop.type === "expand" ? "powerup_expand_paddle.png" : "powerup_slow_ball.png";
      const img = cache[`/game/assets/powerup/${file}`];
      if (img?.complete && img.naturalWidth) ctx.drawImage(img, drop.x - 25, drop.y - 25, 50, 50);
    }

    const selectedPaddle = paddleRef.current;
    const paddleImage = selectedPaddle ? cache[selectedPaddle.sheet] : cache["/game/assets/paddle/paddle_normal.png"];
    if (selectedPaddle && paddleImage?.complete && paddleImage.naturalWidth) {
      fitCrop(ctx, paddleImage, selectedPaddle.x, selectedPaddle.y, selectedPaddle.width, selectedPaddle.height, p.paddleX, PADDLE_Y, p.paddleW, 52);
    } else if (paddleImage?.complete && paddleImage.naturalWidth) {
      ctx.drawImage(paddleImage, p.paddleX, PADDLE_Y, p.paddleW, 52);
    } else {
      ctx.fillStyle = "#d16201"; ctx.fillRect(p.paddleX, PADDLE_Y, p.paddleW, 28);
    }

    const ball = cache[`/game/assets/sprites/balls-sprites/balls_set/${ballFileRef.current}`];
    if (ball?.complete && ball.naturalWidth) fitImage(ctx, ball, ball.naturalWidth, ball.naturalHeight, p.ballX - BALL_R, p.ballY - BALL_R, BALL_R * 2, BALL_R * 2);
    else { ctx.beginPath(); ctx.fillStyle = "white"; ctx.arc(p.ballX, p.ballY, BALL_R, 0, Math.PI * 2); ctx.fill(); }

  }, [ar, t, worldInfo.ar, worldInfo.en]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;

    let raf = 0;
    const tick = (now: number) => {
      const p = physicsRef.current;
      if (!p) { raf = requestAnimationFrame(tick); return; }
      let dt = Math.min(.028, Math.max(0, (now - p.lastTime) / 1000));
      p.lastTime = now;

      if (statusRef.current === "playing") {
        const keys = keysRef.current;
        const move = (keys.has("ArrowLeft") || keys.has("a") || keys.has("A") ? -1 : 0) + (keys.has("ArrowRight") || keys.has("d") || keys.has("D") ? 1 : 0);
        if (move) p.paddleX = clamp(p.paddleX + move * 620 * dt, 12, W - p.paddleW - 12);

        const prevX = p.ballX;
        const prevY = p.ballY;
        p.ballX += p.ballVX * dt;
        p.ballY += p.ballVY * dt;

        if (p.ballX - BALL_R <= 8 && p.ballVX < 0) { p.ballX = 8 + BALL_R; p.ballVX *= -1; playSound("wall"); }
        if (p.ballX + BALL_R >= W - 8 && p.ballVX > 0) { p.ballX = W - 8 - BALL_R; p.ballVX *= -1; playSound("wall"); }
        if (p.ballY - BALL_R <= PLAY_TOP + 4 && p.ballVY < 0) { p.ballY = PLAY_TOP + 4 + BALL_R; p.ballVY *= -1; playSound("wall"); }

        if (p.ballVY > 0 && p.ballY + BALL_R >= PADDLE_Y && p.ballY - BALL_R <= PADDLE_Y + 54 && p.ballX >= p.paddleX - BALL_R && p.ballX <= p.paddleX + p.paddleW + BALL_R) {
          const relative = clamp((p.ballX - (p.paddleX + p.paddleW / 2)) / (p.paddleW / 2), -1, 1);
          const speed = Math.min(980, Math.hypot(p.ballVX, p.ballVY) * 1.006);
          p.ballVX = speed * relative * .78;
          p.ballVY = -Math.sqrt(Math.max(speed * speed - p.ballVX * p.ballVX, speed * speed * .35));
          p.ballY = PADDLE_Y - BALL_R - 2;
          playSound("wall");
        }

        for (const brick of p.bricks) {
          if (brick.breakable && brick.hp <= 0) continue;
          const hit = p.ballX + BALL_R > brick.x && p.ballX - BALL_R < brick.x + brick.w && p.ballY + BALL_R > brick.y && p.ballY - BALL_R < brick.y + brick.h;
          if (!hit) continue;

          if (brick.kind === "blackhole") {
            p.ballX = 70 + Math.random() * (W - 140);
            p.ballY = 810 + Math.random() * 180;
            const speed = Math.hypot(p.ballVX, p.ballVY);
            const angle = -Math.PI * (.2 + Math.random() * .6);
            p.ballVX = Math.cos(angle) * speed;
            p.ballVY = Math.sin(angle) * speed;
            playSound("power");
            break;
          }

          const passThrough = brick.kind === "lightning";
          if (brick.breakable) {
            brick.hp -= 1;
            p.score += brick.kind === "boss" ? 250 : brick.maxHp > 1 ? 140 : 100;
            setScore(p.score);
            if (brick.hp <= 0) {
              if (brick.kind === "powerup" || Math.random() < .12) {
                const types: DropType[] = ["life", "expand", "slow"];
                p.drops.push({ x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, vy: 250, type: types[Math.floor(Math.random() * types.length)] });
              }
              playSound(brick.kind === "boss" ? "explosion" : "brick");
            } else playSound("brick");
          } else playSound("wall");

          if (brick.kind === "rough") {
            const speed = Math.hypot(p.ballVX, p.ballVY);
            const angle = -Math.PI * (.18 + Math.random() * .64);
            p.ballVX = Math.cos(angle) * speed;
            p.ballVY = Math.sin(angle) * speed;
          } else if (!passThrough) {
            const cameFromTop = prevY + BALL_R <= brick.y;
            const cameFromBottom = prevY - BALL_R >= brick.y + brick.h;
            if (cameFromTop || cameFromBottom) p.ballVY *= -1;
            else p.ballVX *= -1;
          } else {
            p.ballVX *= 1.04; p.ballVY *= 1.04;
          }
          break;
        }

        for (let i = p.drops.length - 1; i >= 0; i--) {
          const drop = p.drops[i];
          drop.y += drop.vy * dt;
          if (drop.y > PADDLE_Y - 10 && drop.y < PADDLE_Y + 70 && drop.x >= p.paddleX - 20 && drop.x <= p.paddleX + p.paddleW + 20) {
            if (drop.type === "life") { p.lives += 1; setLives(p.lives); }
            if (drop.type === "expand") p.paddleW = Math.min(310, p.paddleW + 60);
            if (drop.type === "slow") { p.ballVX *= .82; p.ballVY *= .82; }
            p.drops.splice(i, 1); playSound("power");
          } else if (drop.y > H + 60) p.drops.splice(i, 1);
        }

        if (p.ballY - BALL_R > H) {
          p.lives -= 1; setLives(p.lives);
          if (p.lives <= 0) {
            setGameStatus("gameover");
          } else {
            p.ballX = p.paddleX + p.paddleW / 2;
            p.ballY = PADDLE_Y - BALL_R - 1;
            const speed = Math.min(920, 600 + (p.world - 1) * 20 + (p.worldStage - 1) * 5);
            p.ballVX = speed * .42; p.ballVY = -speed;
            p.drops = [];
            setGameStatus("ready");
          }
        }

        if (!p.bricks.some(b => b.breakable && b.hp > 0)) {
          const next = Math.min(90, p.stage + 1);
          const unlocked = Math.max(maxUnlocked, next);
          setMaxUnlocked(unlocked);
          window.localStorage.setItem("bbb-web-max-stage", String(unlocked));
          setGameStatus("won");
        }
      }

      draw(ctx, p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [draw, maxUnlocked, playSound, setGameStatus]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.code === "Space") {
        e.preventDefault();
        if (statusRef.current === "ready" || statusRef.current === "paused") setGameStatus("playing");
        else if (statusRef.current === "playing") setGameStatus("paused");
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [setGameStatus]);

  const movePaddle = (clientX: number) => {
    const canvas = canvasRef.current;
    const p = physicsRef.current;
    if (!canvas || !p) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * W / rect.width;
    p.paddleX = clamp(x - p.paddleW / 2, 12, W - p.paddleW - 12);
    if (statusRef.current === "ready") p.ballX = p.paddleX + p.paddleW / 2;
  };

  const equipPaddle = (style: PaddleStyle, form: PaddleForm) => {
    setPaddleStyleId(style.id);
    setPaddleForm(form);
    setPaddle(style[form]);
    window.localStorage.setItem("bbb-web-paddle-style", style.id);
    window.localStorage.setItem("bbb-web-paddle-form", form);
  };

  const primaryAction = () => {
    if (status === "ready" || status === "paused") setGameStatus("playing");
    else if (status === "playing") setGameStatus("paused");
    else if (status === "gameover") resetStage(stage);
    else if (status === "won") {
      if (stage >= 90) resetStage(stage);
      else setStage(stage + 1);
    }
  };

  const primaryLabel = status === "ready" ? t.launch : status === "playing" ? t.pause : status === "paused" ? t.resume : status === "won" ? (stage >= 90 ? t.restart : t.next) : t.retry;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_500px] xl:items-start">
      <section className="min-w-0">
        <div className="glass rounded-[2rem] p-3 sm:p-4 lg:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.22em] text-orange-300">{t.world} {world} • {t.stage} {stage}</div>
              <div className="mt-1 text-lg font-black text-white sm:text-xl">{ar ? worldInfo.ar : worldInfo.en}</div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-white/55 sm:text-xs">
              <span className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">{t.score} <b className="text-white">{score}</b></span>
              <span className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">{t.lives} <b className="text-white">{lives}</b></span>
            </div>
          </div>

          <div className="game-shell mx-auto select-none">
            <video key={world} autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
              <source src={`/game/worlds/${world}.mp4`} type="video/mp4" />
            </video>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              aria-label="Brick Breaker Ball web game"
              onPointerMove={(e) => movePaddle(e.clientX)}
              onPointerDown={(e) => { movePaddle(e.clientX); if (statusRef.current === "ready") setGameStatus("playing"); }}
            />
            {status !== "playing" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex justify-center px-4">
                <div className="max-w-[92%] rounded-2xl border border-white/10 bg-[#070b11]/88 px-5 py-4 text-center shadow-2xl backdrop-blur-xl sm:max-w-[78%]">
                  <div className="text-base font-black text-white sm:text-lg">
                    {status === "won" ? t.clear : status === "gameover" ? t.gameOver : status === "paused" ? t.pause : t.ready}
                  </div>
                  <div className="mt-1 text-[10px] leading-5 text-white/50 sm:text-xs">{status === "ready" ? t.controls : `${t.score}: ${score}`}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button onClick={primaryAction} className="min-w-28 rounded-xl bg-gradient-to-b from-[#e46a0d] to-[#9f0712] px-5 py-3 text-xs font-black tracking-[.1em] text-white shadow-lg shadow-red-950/25 transition hover:brightness-110">{primaryLabel}</button>
            <button onClick={() => resetStage(stage)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black text-white/75 transition hover:bg-white/10">{t.restart}</button>
            <button onClick={() => setSound(v => !v)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black text-white/75 transition hover:bg-white/10">{t.sound}: {sound ? "ON" : "OFF"}</button>
          </div>
        </div>
      </section>

      <aside className="glass rounded-[2rem] p-4 sm:p-5 xl:sticky xl:top-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black tracking-[.2em] text-orange-300">WEB CAMPAIGN</div>
            <h2 className="mt-2 text-2xl font-black text-white">{ar ? worldInfo.ar : worldInfo.en}</h2>
            <p className="mt-1 text-xs leading-5 text-white/45">{ar ? worldInfo.arSub : worldInfo.enSub}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-center">
            <div className="text-[9px] font-black uppercase tracking-wider text-white/35">{t.stage}</div>
            <div className="text-xl font-black text-white">{stage}<span className="text-xs text-white/35">/90</span></div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-black/20 p-3"><div className="text-[9px] font-bold uppercase tracking-wider text-white/35">{t.unlocked}</div><div className="mt-1 text-xl font-black">{maxUnlocked}</div></div>
          <div className="rounded-2xl bg-black/20 p-3"><div className="text-[9px] font-bold uppercase tracking-wider text-white/35">{t.score}</div><div className="mt-1 text-xl font-black">{score}</div></div>
          <div className="rounded-2xl bg-black/20 p-3"><div className="text-[9px] font-bold uppercase tracking-wider text-white/35">{t.lives}</div><div className="mt-1 text-xl font-black">{lives}</div></div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{t.stage}</span>
            <select value={stage} onChange={(e) => setStage(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1017] px-3 py-3 text-sm font-bold text-white outline-none focus:border-orange-500/60">
              {Array.from({ length: maxUnlocked }, (_, i) => i + 1).map(n => <option key={n} value={n}>{t.stage} {n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{t.selectWorld}</span>
            <select value={world} onChange={(e) => setStage(Number(e.target.value) === 13 ? 85 : (Number(e.target.value) - 1) * 7 + 1)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1017] px-3 py-3 text-sm font-bold text-white outline-none focus:border-orange-500/60">
              {worlds.map(item => {
                const firstStage = item.id === 13 ? 85 : (item.id - 1) * 7 + 1;
                const locked = firstStage > maxUnlocked;
                return <option key={item.id} value={item.id} disabled={locked}>{t.world} {item.id} - {ar ? item.ar : item.en}{locked ? (ar ? " • مقفل" : " • LOCKED") : ""}</option>;
              })}
            </select>
          </label>
        </div>

        <div className="mt-6 border-t border-white/8 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">{t.loadout}</div>
              <div className="mt-1 text-sm font-black text-white">{loadoutTab === "paddles" ? t.selectPaddle : t.selectBall}</div>
            </div>
            <div className="flex rounded-xl border border-white/8 bg-black/20 p-1">
              <button onClick={() => setLoadoutTab("paddles")} className={`rounded-lg px-3 py-2 text-[10px] font-black transition ${loadoutTab === "paddles" ? "bg-orange-600 text-white" : "text-white/45 hover:text-white"}`}>{t.paddles}</button>
              <button onClick={() => setLoadoutTab("balls")} className={`rounded-lg px-3 py-2 text-[10px] font-black transition ${loadoutTab === "balls" ? "bg-orange-600 text-white" : "text-white/45 hover:text-white"}`}>{t.balls}</button>
            </div>
          </div>

          {loadoutTab === "balls" ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-white/35"><span>{t.selectBall}</span><span>60</span></div>
              <div className="grid max-h-[32rem] grid-cols-5 gap-2 overflow-y-auto pr-1 scrollbar-thin sm:grid-cols-7 xl:grid-cols-6">
                {ballFiles.map(file => (
                  <button key={file} onClick={() => { setBallFile(file); window.localStorage.setItem("bbb-web-ball", file); }} title={assetLabel(file)} className={`aspect-square overflow-hidden rounded-xl border p-1.5 transition ${ballFile === file ? "border-orange-400 bg-orange-500/12 ring-1 ring-orange-400/40" : "border-white/8 bg-black/15 hover:border-white/20 hover:bg-white/5"}`}>
                    <img src={`/game/assets/sprites/balls-sprites/balls_set/${file}`} alt={assetLabel(file)} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="mb-3 flex items-center justify-between text-[10px] font-bold text-white/35"><span>{t.chooseForm}</span><span>{paddleStyles.length || 36} {ar ? "ستايل" : "STYLE SETS"}</span></div>
              <div className="max-h-[38rem] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                {paddleStyles.map(style => {
                  const selectedStyle = paddleStyleId === style.id;
                  const styleLabel = style.normal.displayName?.[ar ? "ar" : "en"] || (style.normal.file ? assetLabel(style.normal.file) : "Paddle");
                  const forms: Array<[PaddleForm, PaddleAsset, string]> = [
                    ["normal", style.normal, t.normal],
                    ["weapon", style.weapon, t.weapon],
                    ["sticky", style.sticky, t.sticky]
                  ];
                  return (
                    <div key={style.id} className={`rounded-2xl border p-3 transition ${selectedStyle ? "border-lime-500/70 bg-lime-500/[.04] shadow-[0_0_0_1px_rgba(132,204,22,.12)]" : "border-orange-950/70 bg-black/15 hover:border-orange-700/50"}`}>
                      <div className="mb-2 flex items-center justify-between gap-3 px-1">
                        <div className="truncate text-xs font-black uppercase tracking-wide text-white">{styleLabel}</div>
                        {selectedStyle && <div className="text-[9px] font-black uppercase tracking-wider text-lime-400">{t.equipped}</div>}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {forms.map(([form, item, label]) => {
                          const active = selectedStyle && paddleForm === form;
                          return (
                            <button key={form} onClick={() => equipPaddle(style, form)} title={`${styleLabel} • ${label}`} className={`group rounded-xl border p-2 transition ${active ? "border-orange-400 bg-orange-500/12" : "border-white/7 bg-[#090e14] hover:border-white/20 hover:bg-white/[.04]"}`}>
                              <div className="flex h-14 items-center justify-center sm:h-16">
                                <img src={item.previewSrc} alt={`${styleLabel} ${label}`} className="max-h-full max-w-full object-contain" draggable={false} />
                              </div>
                              <div className={`mt-1.5 text-center text-[8px] font-black tracking-[.14em] ${active ? "text-orange-300" : "text-white/40 group-hover:text-white/65"}`}>{label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/8 bg-black/15 p-4 text-xs leading-6 text-white/45">{t.controls}</div>
      </aside>
    </div>
  );
}
