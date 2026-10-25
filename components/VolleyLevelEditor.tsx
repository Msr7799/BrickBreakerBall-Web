"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SpriteSheetCutter, { type CustomEditorSprite } from "@/components/SpriteSheetCutter";
import {
  BRICK_TYPES,
  EDITOR_COLUMNS,
  EDITOR_ROWS,
  EDITOR_WORLDS,
  cloneStage,
  createVolleyStage,
  type EditorBrick,
  type EditorStage,
  type VolleyBrickType,
  type VolleyShape,
} from "@/lib/volley-editor-data";
import type { Lang } from "@/lib/site";

type Tool = "select" | "draw" | "erase";
type Point = { row: number; column: number } | null;
type AtlasSlice = {
  name: string;
  sourceSheet: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
type AtlasJson = {
  frames: Record<
    string,
    {
      frame: { x: number; y: number; w: number; h: number };
      origin: { sheet: string; x: number; y: number; w: number; h: number };
    }
  >;
  meta: { image: string; size: { w: number; h: number } };
};

const shapeOptions: VolleyShape[] = [
  "RECTANGLE",
  "TRIANGLE_NW",
  "TRIANGLE_NE",
  "TRIANGLE_SW",
  "TRIANGLE_SE",
];
const typeColors: Record<string, string> = {
  NORMAL_ONE_HIT: "#b7c4d5",
  CRYSTAL_BLUE: "#30b8ff",
  CRYSTAL_MAROON: "#d74478",
  CRYSTAL_GREEN: "#43df7b",
  CRYSTAL_ORANGE: "#ff9c37",
  CRYSTAL_RED: "#ff4949",
  CRYSTAL_PURPLE: "#a86cff",
  CRYSTAL_PINK: "#f063d8",
  ELECTRIC_WHITE: "#e6fbff",
  STONE_GRAY: "#7d8795",
  ROUGH_STONE: "#81715f",
  GLASS: "#8cecff",
  ARMORED_TWO_HIT: "#a6b2c3",
  ARMORED_THREE_HIT: "#667285",
  ARMORED_DARK: "#34394b",
  POWERUP_CARRIER: "#ffcc3d",
  RANDOM_INVENTORY_POWERUP: "#82ff69",
  REGENERATING: "#64dc8c",
  EXPLOSIVE: "#ff633c",
  LIGHTNING_SPEED_PASS_THROUGH: "#f7f45c",
  TRANSPARENT_SLOW_PASS_THROUGH: "#76d7ff",
  MOVING_HORIZONTAL: "#68a6ff",
  MOVING_VERTICAL: "#68a6ff",
  KEY_BRICK: "#ffd866",
  LOCKED: "#b27b42",
  SWITCH: "#55dcff",
  GHOST: "#d7d5ff",
  CHAIN_BRICK: "#c4a074",
  BLACK_HOLE_TELEPORTER: "#9b4dff",
  INDESTRUCTIBLE: "#9ba2ad",
  SPIKED_HAZARD: "#f13d61",
  BOSS_CORE: "#ff274f",
};

function shortName(type: string) {
  const aliases: Record<string, string> = {
    NORMAL_ONE_HIT: "1",
    POWERUP_CARRIER: "+",
    RANDOM_INVENTORY_POWERUP: "?",
    ARMORED_TWO_HIT: "A2",
    ARMORED_THREE_HIT: "A3",
    ARMORED_DARK: "AD",
    REGENERATING: "RG",
    EXPLOSIVE: "EX",
    MOVING_HORIZONTAL: "↔",
    MOVING_VERTICAL: "↕",
    KEY_BRICK: "KEY",
    LOCKED: "🔒",
    SWITCH: "SW",
    GHOST: "GH",
    CHAIN_BRICK: "CH",
    BLACK_HOLE_TELEPORTER: "◎",
    INDESTRUCTIBLE: "∞",
    SPIKED_HAZARD: "⚠",
    BOSS_CORE: "BOSS",
  };
  return (
    aliases[type] ??
    type.replace("CRYSTAL_", "").replace("ELECTRIC_", "").slice(0, 4)
  );
}

const brickOrdinals: Record<VolleyBrickType, number> = {
  NORMAL_ONE_HIT: 0,
  ARMORED_TWO_HIT: 1,
  ARMORED_THREE_HIT: 2,
  INDESTRUCTIBLE: 3,
  GLASS: 4,
  EXPLOSIVE: 5,
  POWERUP_CARRIER: 6,
  MOVING_HORIZONTAL: 7,
  MOVING_VERTICAL: 8,
  REGENERATING: 9,
  GHOST: 10,
  SWITCH: 11,
  LOCKED: 12,
  KEY_BRICK: 13,
  CHAIN_BRICK: 14,
  BOSS_CORE: 15,
  ROUGH_STONE: 16,
  LIGHTNING_SPEED_PASS_THROUGH: 17,
  ELECTRIC_WHITE: 18,
  CRYSTAL_BLUE: 19,
  CRYSTAL_RED: 20,
  CRYSTAL_PURPLE: 21,
  STONE_GRAY: 22,
  BLACK_HOLE_TELEPORTER: 23,
  RANDOM_INVENTORY_POWERUP: 24,
  CRYSTAL_MAROON: 25,
  ARMORED_DARK: 26,
  CRYSTAL_PINK: 27,
  CRYSTAL_ORANGE: 28,
  CRYSTAL_GREEN: 29,
  SPIKED_HAZARD: 30,
  TRANSPARENT_SLOW_PASS_THROUGH: 31,
};

function sliceFor(type: VolleyBrickType, slices: AtlasSlice[]) {
  if (!slices.length) return null;
  // Unassigned stage bricks use only the eight basic material tiles at the
  // start of the source sheet. Special parts remain selectable from the full
  // atlas library, but are never guessed for an unrelated brick type.
  const basicTileCount = Math.min(8, slices.length);
  return slices[brickOrdinals[type] % basicTileCount];
}

function brickStyle(brick: EditorBrick): React.CSSProperties {
  const color = typeColors[brick.type] ?? "#8090a0";
  const clip =
    brick.shape === "TRIANGLE_NW"
      ? "polygon(0 0,100% 100%,0 100%)"
      : brick.shape === "TRIANGLE_NE"
        ? "polygon(0 0,100% 0,0 100%)"
        : brick.shape === "TRIANGLE_SW"
          ? "polygon(0 0,100% 0,100% 100%)"
          : brick.shape === "TRIANGLE_SE"
            ? "polygon(100% 0,100% 100%,0 100%)"
            : undefined;
  return { "--brick-color": color, clipPath: clip } as React.CSSProperties;
}

function brickGeometry(
  shape: VolleyShape,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const left = x;
  const right = x + width;
  const bottom = y;
  const top = y + height;
  const verticesByShape: Record<VolleyShape, Array<{ x: number; y: number }>> = {
    RECTANGLE: [
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: right, y: top },
      { x: left, y: top },
    ],
    TRIANGLE_NW: [
      { x: left, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ],
    TRIANGLE_NE: [
      { x: left, y: top },
      { x: right, y: top },
      { x: left, y: bottom },
    ],
    TRIANGLE_SW: [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
    ],
    TRIANGLE_SE: [
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ],
  };
  return {
    kind: shape === "RECTANGLE" ? "polygon-4" : "polygon-3",
    shape,
    bounds: { x, y, width, height },
    vertices: verticesByShape[shape],
  };
}

function AtlasSprite({
  type,
  sheet,
  slices,
  spriteName,
  customSource,
}: {
  type: VolleyBrickType;
  sheet: string;
  slices: AtlasSlice[];
  spriteName?: string;
  customSource?: string;
}) {
  const slice =
    (spriteName && slices.find((item) => item.name === spriteName)) ||
    sliceFor(type, slices);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slice || !sheet || customSource) return;
    const image = new Image();
    image.onload = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = slice.width;
      canvas.height = slice.height;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        slice.x,
        slice.y,
        slice.width,
        slice.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    };
    image.src = sheet;
    return () => {
      image.onload = null;
    };
  }, [customSource, sheet, slice?.name, slice?.x, slice?.y, slice?.width, slice?.height]);
  if (customSource)
    return <img src={customSource} className="atlas-sprite" alt="" aria-hidden="true" />;
  if (!slice)
    return (
      <span
        className="atlas-sprite-fallback"
        style={{ background: typeColors[type] }}
      />
    );
  return <canvas ref={canvasRef} className="atlas-sprite" aria-hidden="true" />;
}

function withoutLegacyFormationAsset(
  value: EditorStage & { formationAsset?: unknown },
): EditorStage {
  const clean = { ...value, rails: [] };
  delete clean.formationAsset;
  return clean;
}

function normalizeEditorCells(
  value: unknown,
): Array<Array<EditorBrick | null>> {
  if (!Array.isArray(value)) throw new Error("Invalid stage grid");
  const rows = value as Array<Array<EditorBrick | null>>;
  if (
    rows.length === EDITOR_ROWS &&
    rows.every((row) => Array.isArray(row) && row.length === EDITOR_COLUMNS)
  )
    return rows.map((row) => [...row]);
  if (
    rows.length === 8 &&
    rows.every((row) => Array.isArray(row) && row.length === 9)
  ) {
    const expanded: Array<Array<EditorBrick | null>> = Array.from(
      { length: EDITOR_ROWS },
      () => Array(EDITOR_COLUMNS).fill(null),
    );
    rows.forEach((row, r) =>
      row.forEach((brick, c) => {
        expanded[r][c + 1] = brick;
      }),
    );
    return expanded;
  }
  throw new Error("Unsupported stage grid size");
}

function hydrateEditorStage(
  value: EditorStage & { formationAsset?: unknown },
  world: number,
  stageNumber: number,
): EditorStage {
  const saved = withoutLegacyFormationAsset(value);
  const source = createVolleyStage(world, stageNumber);
  return {
    ...source,
    ...saved,
    rows: EDITOR_ROWS,
    columns: EDITOR_COLUMNS,
    cells: normalizeEditorCells(saved.cells),
    world,
    stage: stageNumber,
    backgroundAsset: source.backgroundAsset,
    spritesheetAsset: source.spritesheetAsset,
    atlasAsset: source.atlasAsset,
    expectedSourceSheet: source.expectedSourceSheet,
    cannonAsset: source.cannonAsset,
    referenceAsset: source.referenceAsset,
  };
}

export default function VolleyLevelEditor({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  const [world, setWorld] = useState(1);
  const [stageNumber, setStageNumber] = useState(1);
  const [stage, setStage] = useState<EditorStage>(() =>
    createVolleyStage(1, 1),
  );
  const [selected, setSelected] = useState<Point>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [brushType, setBrushType] = useState<VolleyBrickType>("CRYSTAL_BLUE");
  const [brushHp, setBrushHp] = useState(3);
  const [brushSprite, setBrushSprite] = useState<string | undefined>();
  const [brushCustomSprite, setBrushCustomSprite] = useState<CustomEditorSprite | null>(null);
  const [workspace, setWorkspace] = useState<"editor" | "sprites">("editor");
  const [message, setMessage] = useState("");
  const [atlasSlices, setAtlasSlices] = useState<AtlasSlice[]>([]);
  const undoRef = useRef<EditorStage[]>([]);
  const redoRef = useRef<EditorStage[]>([]);
  const importRef = useRef<HTMLInputElement>(null);

  const flash = useCallback((value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2200);
  }, []);
  const commit = useCallback((change: (draft: EditorStage) => void) => {
    setStage((current) => {
      undoRef.current.push(cloneStage(current));
      if (undoRef.current.length > 60) undoRef.current.shift();
      redoRef.current = [];
      const next = cloneStage(current);
      change(next);
      return next;
    });
  }, []);

  const loadOriginal = useCallback(
    (nextWorld = world, nextStage = stageNumber) => {
      const original = createVolleyStage(nextWorld, nextStage);
      setStage(original);
      setSelected(null);
      undoRef.current = [];
      redoRef.current = [];
    },
    [stageNumber, world],
  );

  const undo = useCallback(() => {
    const prior = undoRef.current.pop();
    if (!prior) return;
    redoRef.current.push(cloneStage(stage));
    setStage(prior);
    setSelected(null);
  }, [stage]);
  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(cloneStage(stage));
    setStage(next);
    setSelected(null);
  }, [stage]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      }
      if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, undo]);

  useEffect(() => {
    let active = true;
    setAtlasSlices([]);
    setBrushSprite(undefined);
    fetch(stage.atlasAsset)
      .then((response) => response.json())
      .then((atlas: AtlasJson) => {
        if (!active) return;
        // atlas.json frame rectangles address atlas.png. Ice Grave is missing its
        // atlas.png asset, so use that world's source sheet with origin rectangles.
        const sourceFallback = stage.world === 5;
        const slices = Object.entries(atlas.frames)
          .sort(
            ([a], [b]) =>
              (Number(a.match(/_(\d+)\.png$/)?.[1]) || 9999) -
              (Number(b.match(/_(\d+)\.png$/)?.[1]) || 9999),
          )
          .map(([name, frame]) => ({
            name,
            sourceSheet: frame.origin.sheet,
            x: sourceFallback ? frame.origin.x : frame.frame.x,
            y: sourceFallback ? frame.origin.y : frame.frame.y,
            width: sourceFallback ? frame.origin.w : frame.frame.w,
            height: sourceFallback ? frame.origin.h : frame.frame.h,
          }));
        setAtlasSlices(slices);
      })
      .catch(() => active && setAtlasSlices([]));
    return () => {
      active = false;
    };
  }, [stage.atlasAsset]);

  const selectedBrick = selected
    ? stage.cells[selected.row][selected.column]
    : null;
  const gridBrickWidth = (824 - 4 * (EDITOR_COLUMNS - 1)) / EDITOR_COLUMNS;
  const gridColumnPitch = gridBrickWidth + 4;
  const brickCount = useMemo(
    () => stage.cells.flat().filter(Boolean).length,
    [stage],
  );
  const totalHp = useMemo(
    () =>
      stage.cells
        .flat()
        .reduce((sum, cell) => sum + (cell && cell.hp < 999 ? cell.hp : 0), 0),
    [stage],
  );

  const chooseWorld = (value: number) => {
    const nextStage = 1;
    setWorld(value);
    setStageNumber(nextStage);
    loadOriginal(value, nextStage);
  };
  const chooseStage = (value: number) => {
    setStageNumber(value);
    loadOriginal(world, value);
  };
  const activateCell = (row: number, column: number) => {
    setSelected({ row, column });
    if (tool === "erase")
      commit((draft) => {
        draft.cells[row][column] = null;
      });
    if (tool === "draw")
      commit((draft) => {
        draft.cells[row][column] = {
          type: brushType,
          ...(brushCustomSprite
            ? {
                customSpriteDataUrl: brushCustomSprite.dataUrl,
                customSpriteName: brushCustomSprite.name,
              }
            : brushSprite
              ? { atlasSprite: brushSprite }
              : {}),
          hp: brushHp,
          shape: "RECTANGLE",
          groupId: 0,
          countsForClear: true,
        };
      });
  };
  const updateSelected = (patch: Partial<EditorBrick>) => {
    if (!selected) return;
    commit((draft) => {
      const current = draft.cells[selected.row][selected.column];
      if (current)
        draft.cells[selected.row][selected.column] = { ...current, ...patch };
    });
  };
  const clearGrid = () =>
    commit((draft) => {
      draft.cells = Array.from({ length: EDITOR_ROWS }, () =>
        Array(EDITOR_COLUMNS).fill(null),
      );
      draft.rails = [];
      draft.pickups = [];
    });
  const exportPayload = useCallback(() => {
    const brickGap = 4;
    const boardWidth = 862 - 38;
    const brickWidth =
      (boardWidth - brickGap * (EDITOR_COLUMNS - 1)) / EDITOR_COLUMNS;
    const { referenceAsset: _referenceAsset, ...exportableStage } = stage;
    const bricks = stage.cells.flatMap((row, rowIndex) =>
      row.flatMap((brick, columnIndex) => {
        if (!brick) return [];
        const x = 38 + columnIndex * (brickWidth + brickGap);
        const y = 1368 - (rowIndex + 1) * 70;
        return [
          {
            id: rowIndex * EDITOR_COLUMNS + columnIndex + 1,
            row: rowIndex,
            column: columnIndex,
            x,
            y,
            width: brickWidth,
            height: 66,
            normalizedBoardBounds: {
              x: (x - 38) / boardWidth,
              y: y / 1600,
              width: brickWidth / boardWidth,
              height: 66 / 1600,
            },
            geometry: brickGeometry(brick.shape, x, y, brickWidth, 66),
            type: brick.type,
            hp: brick.hp,
            shape: brick.shape,
            groupId: brick.groupId,
            countsForClear: brick.countsForClear,
            shieldLock: Boolean(brick.shieldLock),
            hazardKind: brick.hazardKind ?? null,
            atlasSprite: brick.atlasSprite ?? null,
            customSpriteDataUrl: brick.customSpriteDataUrl ?? null,
            customSpriteName: brick.customSpriteName ?? null,
          },
        ];
      }),
    );
    return {
      ...exportableStage,
      blueprint: {
        schema: "brick-breaker-ball-ai-stage-blueprint",
        version: 1,
        purpose: "Rebuild this editor stage exactly from its grid, world coordinates, brick properties, and geometry vertices.",
        instructions: [
          "Treat cells as the canonical editable 9x11 grid.",
          "Treat bricks as the canonical flat render and game-geometry list.",
          "Use geometry.vertices to reproduce rectangles and triangular collision shapes exactly.",
          "Preserve type, hp, groupId, countsForClear, sprite references, rails, pickups, baseHp, and startingBalls.",
          "Coordinates use a bottom-left origin in a 900x1600 game world.",
        ],
        acceptedShapes: shapeOptions,
      },
      coordinateSystem: {
        origin: "bottom-left",
        worldWidth: 900,
        worldHeight: 1600,
        units: "game-world-pixels",
      },
      board: {
        left: 38,
        right: 862,
        top: 1410,
        brickStartTop: 1368,
        rows: EDITOR_ROWS,
        columns: EDITOR_COLUMNS,
        brickWidth,
        brickHeight: 66,
        brickGap,
        rowPitch: 70,
        dangerY: 300,
      },
      bricks,
      rails: stage.rails.map((rail, id) => ({
        id: id + 1,
        x1: 38 + 824 * (rail.x1 / 9),
        y1: 1368 - rail.y1 * 70,
        x2: 38 + 824 * (rail.x2 / 9),
        y2: 1368 - rail.y2 * 70,
        thickness: rail.thickness,
        fixed: rail.fixed,
      })),
      pickups: stage.pickups.map((pickup, id) => ({
        id: id + 1,
        x: 38 + 824 * (pickup.x / 9),
        y: 1368 - pickup.y * 70,
        amount: pickup.amount,
        type: pickup.type,
      })),
    };
  }, [stage]);
  const download = () => {
    const blob = new Blob([JSON.stringify(exportPayload(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `volley-world-${stage.world}-stage-${stage.stage}-ai-blueprint.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    flash(
      ar ? "تم تنزيل ملف المرحلة" : "Stage file downloaded",
    );
  };
  const copyJson = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(exportPayload(), null, 2),
    );
    flash(
      ar
        ? "تم نسخ JSON مع الإحداثيات"
        : "JSON with coordinates copied",
    );
  };
  const saveLocal = () => {
    localStorage.setItem(
      `bbb-volley-editor-${world}-${stageNumber}`,
      JSON.stringify(stage),
    );
    flash(
      ar ? "حُفظت محليًا في المتصفح" : "Saved in this browser",
    );
  };
  const restoreLocal = () => {
    const raw = localStorage.getItem(
      `bbb-volley-editor-${world}-${stageNumber}`,
    );
    if (!raw)
      return flash(
        ar ? "لا توجد نسخة محلية" : "No local save found",
      );
    try {
      const saved = withoutLegacyFormationAsset(
        JSON.parse(raw) as EditorStage & { formationAsset?: unknown },
      );
      setStage(hydrateEditorStage(saved, world, stageNumber));
      flash(ar ? "تم استرجاع النسخة" : "Local save restored");
    } catch {
      flash(
        ar ? "تعذرت قراءة النسخة" : "Could not read local save",
      );
    }
  };
  const importStage = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = withoutLegacyFormationAsset(
        JSON.parse(await file.text()) as EditorStage & {
          formationAsset?: unknown;
        },
      );
      const normalizedCells = normalizeEditorCells(parsed.cells);
      if (parsed.format !== "brick-breaker-ball-volley-stage")
        throw new Error("format");
      const safeWorld = Math.max(1, Math.min(9, parsed.world));
      const safeStage = Math.max(
        1,
        Math.min(EDITOR_WORLDS[safeWorld - 1].stages, parsed.stage),
      );
      setStage(
        hydrateEditorStage(
          { ...parsed, cells: normalizedCells },
          safeWorld,
          safeStage,
        ),
      );
      setWorld(safeWorld);
      setStageNumber(safeStage);
      setSelected(null);
      undoRef.current = [];
      redoRef.current = [];
      flash(ar ? "تم استيراد المرحلة" : "Stage imported");
    } catch {
      flash(ar ? "ملف المرحلة غير صالح" : "Invalid stage file");
    }
  };

  return (
    <div className="volley-editor" dir={ar ? "rtl" : "ltr"}>
      <header className="editor-hero">
        <div>
          <p>VOLLEY WORKSHOP • 11 × 9</p>
          <h1>
            {ar ? "محرّر مراحل الفولي" : "Volley Level Editor"}
          </h1>
          <span>
            {ar
              ? "حمّل أي مرحلة أصلية، وعدّل الطوب ونقاط الصحة HP، ثم نزّلها بصيغة JSON."
              : "Load any original stage, edit bricks and HP, then export it as JSON."}
          </span>
        </div>
        <div className="editor-hero-actions">
          <div className="editor-public-notice" role="status">
            {ar
              ? "الحفظ في Firebase معطّل؛ استخدم النسخة المحلية أو نزّل JSON."
              : "Firebase saving is disabled; use a browser backup or download JSON."}
          </div>
          <button onClick={download} className="primary">
            {ar ? "تنزيل JSON للـAI" : "Download AI JSON"}
          </button>
        </div>
      </header>

      <nav className="editor-workspace-tabs" aria-label={ar ? "أدوات المحرر" : "Editor tools"}>
        <button className={workspace === "editor" ? "active" : ""} onClick={() => setWorkspace("editor")}>▦ {ar ? "محرر المراحل" : "Level editor"}</button>
        <button className={workspace === "sprites" ? "active" : ""} onClick={() => setWorkspace("sprites")}>✂ {ar ? "تقطيع Sprite Sheet" : "Sprite sheet cutter"}</button>
      </nav>

      {workspace === "sprites" ? (
        <SpriteSheetCutter
          lang={lang}
          onUseSprite={(sprite) => {
            setBrushCustomSprite(sprite);
            setBrushSprite(undefined);
            setBrushType("CRYSTAL_GREEN");
            setTool("draw");
            setWorkspace("editor");
            flash(ar ? `تم اختيار ${sprite.name} للرسم` : `${sprite.name} is ready to draw`);
          }}
        />
      ) : (
      <>

      <section className="editor-sourcebar">
        <label>
          <span>{ar ? "العالم" : "World"}</span>
          <select
            value={world}
            onChange={(e) => chooseWorld(Number(e.target.value))}
          >
            {EDITOR_WORLDS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id}. {ar ? item.ar : item.en}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{ar ? "المرحلة" : "Stage"}</span>
          <select
            value={stageNumber}
            onChange={(e) => chooseStage(Number(e.target.value))}
          >
            {Array.from({ length: EDITOR_WORLDS[world - 1].stages }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
                {i + 1 === EDITOR_WORLDS[world - 1].stages
                  ? ` • ${ar ? "زعيم" : "Boss"}`
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="editor-source-actions">
          <button onClick={() => loadOriginal()}>
            {ar ? "إعادة تحميل الأصل" : "Reload original"}
          </button>
          <button onClick={restoreLocal}>
            {ar ? "نسخة المتصفح" : "Browser backup"}
          </button>
          <button onClick={saveLocal}>
            {ar ? "حفظ احتياطي" : "Local backup"}
          </button>
          <button onClick={() => importRef.current?.click()}>
            {ar ? "استيراد JSON" : "Import JSON"}
          </button>
          <input
            ref={importRef}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={(e) => importStage(e.target.files?.[0])}
          />
        </div>
      </section>

      <div className="editor-layout">
        <aside className="editor-panel editor-palette">
          <div className="editor-panel-title">
            <div>
              <small>{ar ? "أداة الرسم" : "DRAW TOOL"}</small>
              <h2>{ar ? "مكتبة الطوب" : "Brick Library"}</h2>
            </div>
            <b>{atlasSlices.length}</b>
          </div>
          <div className="editor-tools">
            <button
              className={tool === "select" ? "active" : ""}
              onClick={() => setTool("select")}
            >
              ⌁ {ar ? "تحديد" : "Select"}
            </button>
            <button
              className={tool === "draw" ? "active" : ""}
              onClick={() => setTool("draw")}
            >
              ✦ {ar ? "رسم" : "Draw"}
            </button>
            <button
              className={tool === "erase" ? "active" : ""}
              onClick={() => setTool("erase")}
            >
              ⌫ {ar ? "مسح" : "Erase"}
            </button>
          </div>
          <label className="hp-brush">
            <span>{ar ? "HP للطوبة الجديدة" : "NEW BRICK HP"}</span>
            <input
              type="number"
              min="1"
              max="999"
              value={brushHp}
              onChange={(e) =>
                setBrushHp(
                  Math.max(1, Math.min(999, Number(e.target.value) || 1)),
                )
              }
            />
          </label>
          {brushCustomSprite && (
            <div className="custom-brush-preview">
              <img src={brushCustomSprite.dataUrl} alt="" />
              <span><b>{ar ? "قطعة مخصصة جاهزة" : "Custom sprite ready"}</b><small>{brushCustomSprite.name}</small></span>
              <button onClick={() => setBrushCustomSprite(null)}>×</button>
            </div>
          )}
          <div className="atlas-palette-caption">
            {ar
              ? `كل ${atlasSlices.length} إطارًا من أطلس العالم ${world} • اختر الصورة ثم ارسم`
              : `All ${atlasSlices.length} sprites in this world's atlas · choose one to draw`}
          </div>
          <div className="brick-palette-list">
            {atlasSlices.map((slice, index) => (
              <button
                key={slice.name}
                title={`${slice.name} · ${slice.sourceSheet} · ${slice.width}×${slice.height}`}
                className={brushSprite === slice.name ? "active" : ""}
                onClick={() => {
                  setBrushSprite(slice.name);
                  setBrushCustomSprite(null);
                  setBrushType("CRYSTAL_GREEN");
                  setTool("draw");
                }}
              >
                <i>
                  <AtlasSprite
                    type="CRYSTAL_GREEN"
                    sheet={
                      world === 5
                        ? stage.spritesheetAsset
                        : stage.atlasAsset.replace(/\.json$/i, ".webp")
                    }
                    slices={atlasSlices}
                    spriteName={slice.name}
                  />
                </i>
                <span>
                  {slice.sourceSheet} · {slice.name.replace(/\.png$/i, "")}
                </span>
                <em>{index + 1}</em>
              </button>
            ))}
          </div>
        </aside>

        <main className="editor-canvas-column">
          <div className="editor-stage-meta">
            <div>
              <small>
                {stage.bossStage
                  ? ar
                    ? "مرحلة زعيم"
                    : "BOSS STAGE"
                  : ar
                    ? "مرحلة عادية"
                    : "STANDARD STAGE"}
              </small>
              <h2>{stage.name}</h2>
            </div>
            <div className="editor-stats">
              <span>
                <b>{brickCount}</b>
                {ar ? "طوبة" : "bricks"}
              </span>
              <span>
                <b>{totalHp}</b>HP
              </span>
              <span>
                <b>{stage.startingBalls}</b>
                {ar ? "كرة" : "balls"}
              </span>
            </div>
          </div>
          <div className="editor-board-comparison">
            <aside className="editor-reference-card">
              <div className="editor-reference-heading">
                <small>{ar ? "صورة مرجعية" : "REFERENCE IMAGE"}</small>
                <b>{ar ? "مرجع الشكل الهندسي" : "GEOMETRY REFERENCE"}</b>
              </div>
              <img
                src={stage.referenceAsset}
                alt={
                  ar
                    ? `مرجع تشكيل المرحلة ${stage.stage} من العالم ${stage.world}`
                    : `Formation reference for world ${stage.world}, stage ${stage.stage}`
                }
                draggable={false}
              />
              <p>
                {ar
                  ? "المرجع للشكل الهندسي وترتيب القراميد فقط؛ خلفية اللوحة مأخوذة من عالم ومرحلة اللعبة الفعلية."
                  : "This image guides brick geometry and arrangement only; the board keeps the selected game's actual world and stage background."}
              </p>
            </aside>
            <div
              className="editor-board"
              style={{
                backgroundImage: `linear-gradient(rgba(2,5,10,.28),rgba(2,5,10,.62)),url("${stage.backgroundAsset}")`,
              }}
            >
              <div className="danger-line">
                <span>{ar ? "خط الخطر" : "DANGER LINE"}</span>
              </div>
              <div className="editor-pickups" aria-hidden="true">
                {stage.pickups.map((pickup, i) => (
                  <span
                    key={i}
                    title={pickup.type}
                    style={{
                      left: `${(38 + 824 * (pickup.x / 9)) / 9}%`,
                      top: `${(232 + pickup.y * 70) / 16}%`,
                    }}
                  >
                    {pickup.type === "BALL"
                      ? `+${pickup.amount}`
                      : pickup.type.slice(0, 2)}
                  </span>
                ))}
              </div>
              <img
                className="editor-cannon"
                src={stage.cannonAsset}
                alt=""
                draggable={false}
              />
              <div className="editor-grid">
                {stage.cells.map((row, r) =>
                  row.map((brick, c) => (
                    <button
                      key={`${r}-${c}`}
                      style={{
                        left: `${(38 + c * gridColumnPitch) / 9}%`,
                        top: `${(236 + r * 70) / 16}%`,
                        width: `${gridBrickWidth / 9}%`,
                        height: `${66 / 16}%`,
                      }}
                      aria-label={`${r + 1}, ${c + 1}`}
                      className={`editor-cell ${brick ? "filled" : ""} ${selected?.row === r && selected.column === c ? "selected" : ""}`}
                      onClick={() => activateCell(r, c)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        setSelected({ row: r, column: c });
                        commit((d) => {
                          d.cells[r][c] = null;
                        });
                      }}
                    >
                      {brick && (
                        <span
                          className="editor-brick"
                          style={brickStyle(brick)}
                        >
                          <AtlasSprite
                            type={brick.type}
                            sheet={
                              world === 5
                                ? stage.spritesheetAsset
                                : stage.atlasAsset.replace(/\.json$/i, ".webp")
                            }
                            slices={atlasSlices}
                            spriteName={brick.atlasSprite}
                            customSource={brick.customSpriteDataUrl}
                          />
                          <b>{brick.hp >= 999 ? "∞" : brick.hp}</b>
                          <small>{shortName(brick.type)}</small>
                        </span>
                      )}
                    </button>
                  )),
                )}
              </div>
            </div>
          </div>
          <div className="editor-history">
            <button onClick={undo} disabled={!undoRef.current.length}>
              ↶ {ar ? "تراجع" : "Undo"}
            </button>
            <button onClick={redo} disabled={!redoRef.current.length}>
              ↷ {ar ? "إعادة" : "Redo"}
            </button>
            <button onClick={clearGrid} className="danger">
              {ar ? "مسح اللوحة" : "Clear board"}
            </button>
            <span>
              {ar
                ? "انقر بزر الفأرة الأيمن لمسح طوبة بسرعة"
                : "Right-click a cell to erase quickly"}
            </span>
          </div>
        </main>

        <aside className="editor-panel editor-inspector">
          <div className="editor-panel-title">
            <div>
              <small>{ar ? "خصائص العنصر" : "INSPECTOR"}</small>
              <h2>{ar ? "الطوبة المحددة" : "Selected Brick"}</h2>
            </div>
            {selected && (
              <b>
                {selected.row + 1}:{selected.column + 1}
              </b>
            )}
          </div>
          {!selectedBrick ? (
            <div className="empty-inspector">
              <span>◇</span>
              <p>
                {ar
                  ? "اختر طوبة من الشبكة لتغيير نوعها ونقاط صحتها وشكلها ومجموعتها."
                  : "Select a brick to change its type, HP, shape and group."}
              </p>
            </div>
          ) : (
            <div className="inspector-fields">
              <label>
                <span>{ar ? "النوع" : "TYPE"}</span>
                <select
                  value={selectedBrick.type}
                  onChange={(e) =>
                    updateSelected({ type: e.target.value as VolleyBrickType })
                  }
                >
                  {BRICK_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{ar ? "الصحة HP" : "HEALTH / HP"}</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={selectedBrick.hp}
                  onChange={(e) =>
                    updateSelected({
                      hp: Math.max(
                        1,
                        Math.min(999, Number(e.target.value) || 1),
                      ),
                    })
                  }
                />
              </label>
              <div className="hp-steps">
                {[-10, -1, 1, 10].map((amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      updateSelected({
                        hp: Math.max(
                          1,
                          Math.min(999, selectedBrick.hp + amount),
                        ),
                      })
                    }
                  >
                    {amount > 0 ? "+" : ""}
                    {amount}
                  </button>
                ))}
              </div>
              {selected && (
                <div className="coordinate-readout">
                  <span>
                    X <b>{(38 + selected.column * gridColumnPitch).toFixed(2)}</b>
                  </span>
                  <span>
                    Y <b>{(1368 - (selected.row + 1) * 70).toFixed(2)}</b>
                  </span>
                  <span>
                    W <b>{gridBrickWidth.toFixed(2)}</b>
                  </span>
                  <span>
                    H <b>66.00</b>
                  </span>
                </div>
              )}
              <label>
                <span>{ar ? "الشكل" : "SHAPE"}</span>
                <select
                  value={selectedBrick.shape}
                  onChange={(e) =>
                    updateSelected({ shape: e.target.value as VolleyShape })
                  }
                >
                  {shapeOptions.map((shape) => (
                    <option key={shape}>{shape}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{ar ? "رقم المجموعة" : "GROUP ID"}</span>
                <input
                  type="number"
                  min="0"
                  value={selectedBrick.groupId}
                  onChange={(e) =>
                    updateSelected({
                      groupId: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </label>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={selectedBrick.countsForClear}
                  onChange={(e) =>
                    updateSelected({ countsForClear: e.target.checked })
                  }
                />
                <span>
                  {ar
                    ? "يُحتسب لإنهاء المرحلة"
                    : "Counts for stage clear"}
                </span>
              </label>
              <button
                className="delete-brick"
                onClick={() =>
                  selected &&
                  commit((d) => {
                    d.cells[selected.row][selected.column] = null;
                  })
                }
              >
                {ar ? "حذف الطوبة" : "Delete brick"}
              </button>
            </div>
          )}
          <div className="stage-settings">
            <h3>{ar ? "إعدادات المرحلة" : "Stage Settings"}</h3>
            <label>
              <span>Base HP</span>
              <input
                type="number"
                min="1"
                max="999"
                value={stage.baseHp}
                onChange={(e) =>
                  commit((d) => {
                    d.baseHp = Math.max(1, Number(e.target.value) || 1);
                  })
                }
              />
            </label>
            <label>
              <span>{ar ? "كرات البداية" : "Starting balls"}</span>
              <input
                type="number"
                min="1"
                max="160"
                value={stage.startingBalls}
                onChange={(e) =>
                  commit((d) => {
                    d.startingBalls = Math.max(
                      1,
                      Math.min(160, Number(e.target.value) || 1),
                    );
                  })
                }
              />
            </label>
          </div>
          <div className="export-panel">
            <p>
              {ar
                ? "ملف مخطط كامل للـAI: مواقع الطوب، المقاسات، رؤوس الأشكال، HP، الأنواع والمجموعات. ويمكن استيراده هنا مرة أخرى."
                : "Complete AI blueprint with brick positions, sizes, shape vertices, HP, types and groups. It can also be imported here again."}
            </p>
            <button onClick={copyJson}>
              {ar ? "نسخ JSON للـAI" : "Copy AI JSON"}
            </button>
            <button onClick={download} className="primary">
              {ar ? "تنزيل JSON" : "Download JSON"}
            </button>
          </div>
        </aside>
      </div>
      </>
      )}
      {message && (
        <div className="editor-toast" role="status">
          ✓ {message}
        </div>
      )}
    </div>
  );
}
