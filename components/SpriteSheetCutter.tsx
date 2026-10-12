"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent } from "react";
import type { Lang } from "@/lib/site";

export type CustomEditorSprite = {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
};

type Region = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pixelArea: number;
  members: number[];
  manual?: boolean;
};

type Sheet = {
  name: string;
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
};

type Settings = {
  alphaThreshold: number;
  minArea: number;
  mergeDistance: number;
  autoSplitTouching: boolean;
  backgroundRemoval: boolean;
  bgColor: string;
  tolerance: number;
  cropMode: "exact" | "box";
};

const defaults: Settings = {
  alphaThreshold: 26,
  minArea: 12,
  mergeDistance: 0,
  autoSplitTouching: true,
  backgroundRemoval: false,
  bgColor: "#151922",
  tolerance: 22,
  cropMode: "exact",
};

function extractSprite(
  sheet: Sheet,
  region: Region,
  settings: Settings,
  labels: Uint32Array | null,
) {
  const canvas = document.createElement("canvas");
  canvas.width = region.w;
  canvas.height = region.h;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable");
  context.drawImage(
    sheet.image,
    region.x,
    region.y,
    region.w,
    region.h,
    0,
    0,
    region.w,
    region.h,
  );
  const pixels = context.getImageData(0, 0, region.w, region.h);
  const data = pixels.data;
  const background = [1, 3, 5].map((index) =>
    Number.parseInt(settings.bgColor.slice(index, index + 2), 16),
  );
  const tolerance = settings.tolerance * settings.tolerance * 3;
  const members = new Set(region.members);
  for (let y = 0; y < region.h; y += 1) {
    for (let x = 0; x < region.w; x += 1) {
      const offset = (y * region.w + x) * 4;
      if (data[offset + 3] < settings.alphaThreshold) {
        data[offset + 3] = 0;
        continue;
      }
      if (settings.backgroundRemoval) {
        const red = data[offset] - background[0];
        const green = data[offset + 1] - background[1];
        const blue = data[offset + 2] - background[2];
        if (red * red + green * green + blue * blue <= tolerance) {
          data[offset + 3] = 0;
          continue;
        }
      }
      if (
        settings.cropMode === "exact" &&
        !region.manual &&
        labels &&
        !members.has(labels[(region.y + y) * sheet.width + region.x + x])
      ) {
        data[offset + 3] = 0;
      }
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

export default function SpriteSheetCutter({
  lang,
  onUseSprite,
}: {
  lang: Lang;
  onUseSprite: (sprite: CustomEditorSprite) => void;
}) {
  const ar = lang === "ar";
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [labels, setLabels] = useState<Uint32Array | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaults);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [gridColumns, setGridColumns] = useState(8);
  const [gridRows, setGridRows] = useState(8);
  const [drawing, setDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (sheet) URL.revokeObjectURL(sheet.url);
  }, [sheet]);

  const ratio = sheet ? Math.min(1, 920 / sheet.width, 600 / sheet.height) : 1;
  const selected = regions.find((region) => region.id === selectedId) ?? null;
  const previews = useMemo(() => {
    if (!sheet) return [];
    return regions.map((region, index) => ({
      region,
      index,
      dataUrl: extractSprite(sheet, region, settings, labels).toDataURL("image/png"),
    }));
  }, [labels, regions, settings, sheet]);

  const loadSheet = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError(ar ? "استخدم صورة PNG أو JPG أو WebP." : "Use a PNG, JPG, or WebP image.");
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 16_000_000) {
        throw new Error(ar ? "الصورة تتجاوز حد 16 مليون بكسل." : "The image exceeds 16 million pixels.");
      }
      if (sheet) URL.revokeObjectURL(sheet.url);
      setSheet({
        name: file.name,
        url,
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setRegions([]);
      setLabels(null);
      setSelectedId(null);
      setError("");
    } catch (caught) {
      URL.revokeObjectURL(url);
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const detect = async () => {
    if (!sheet || busy) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = sheet.width;
      canvas.height = sheet.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas is unavailable");
      context.drawImage(sheet.image, 0, 0);
      const pixels = context.getImageData(0, 0, sheet.width, sheet.height);
      const result = await new Promise<{
        type: "result" | "error";
        regions?: Array<Omit<Region, "id"> & { index: number }>;
        labels?: Uint32Array;
        message?: string;
      }>((resolve, reject) => {
        const worker = new Worker("/sprite-detect-worker.js");
        worker.onmessage = (message) => {
          worker.terminate();
          resolve(message.data);
        };
        worker.onerror = () => {
          worker.terminate();
          reject(new Error(ar ? "تعطلت أداة تحليل الصورة." : "Image analysis failed."));
        };
        worker.postMessage(
          {
            sheetId: "editor-sheet",
            buffer: pixels.data.buffer,
            width: sheet.width,
            height: sheet.height,
            settings,
          },
          [pixels.data.buffer],
        );
      });
      if (result.type === "error") throw new Error(result.message ?? "Detection failed");
      const next = (result.regions ?? []).map((region) => ({
        ...region,
        id: `auto-${region.index}`,
      }));
      setRegions(next);
      setLabels(result.labels ?? null);
      setSelectedId(next[0]?.id ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  };

  const sliceGrid = () => {
    if (!sheet) return;
    const cellWidth = sheet.width / gridColumns;
    const cellHeight = sheet.height / gridRows;
    const next: Region[] = [];
    for (let row = 0; row < gridRows; row += 1) {
      for (let column = 0; column < gridColumns; column += 1) {
        const x = Math.round(column * cellWidth);
        const y = Math.round(row * cellHeight);
        const right = Math.round((column + 1) * cellWidth);
        const bottom = Math.round((row + 1) * cellHeight);
        next.push({
          id: `grid-${row}-${column}`,
          x,
          y,
          w: right - x,
          h: bottom - y,
          pixelArea: (right - x) * (bottom - y),
          members: [],
          manual: true,
        });
      }
    }
    setRegions(next);
    setLabels(null);
    setSelectedId(next[0]?.id ?? null);
  };

  const point = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = boardRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(sheet!.width, Math.round((event.clientX - bounds.left) / ratio))),
      y: Math.max(0, Math.min(sheet!.height, Math.round((event.clientY - bounds.top) / ratio))),
    };
  };

  const addManualRegion = (end = dragEnd) => {
    if (!dragStart || !end) return;
    const x = Math.min(dragStart.x, end.x);
    const y = Math.min(dragStart.y, end.y);
    const w = Math.abs(end.x - dragStart.x);
    const h = Math.abs(end.y - dragStart.y);
    if (w > 1 && h > 1) {
      const region: Region = {
        id: `manual-${crypto.randomUUID()}`,
        x,
        y,
        w,
        h,
        pixelArea: w * h,
        members: [],
        manual: true,
      };
      setRegions((current) => [...current, region]);
      setSelectedId(region.id);
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const splitSelected = (axis: "x" | "y") => {
    if (!selected) return;
    const cut = Math.floor((axis === "x" ? selected.w : selected.h) / 2);
    if (cut < 1) return;
    const halves: Region[] = axis === "x"
      ? [
          { ...selected, id: `${selected.id}-a`, w: cut, manual: true },
          { ...selected, id: `${selected.id}-b`, x: selected.x + cut, w: selected.w - cut, manual: true },
        ]
      : [
          { ...selected, id: `${selected.id}-a`, h: cut, manual: true },
          { ...selected, id: `${selected.id}-b`, y: selected.y + cut, h: selected.h - cut, manual: true },
        ];
    setRegions((current) => current.flatMap((region) => region.id === selected.id ? halves : [region]));
    setSelectedId(halves[0].id);
  };

  const useSelected = () => {
    if (!sheet || !selected) return;
    const canvas = extractSprite(sheet, selected, settings, labels);
    onUseSprite({
      id: selected.id,
      name: `${sheet.name.replace(/\.[^.]+$/, "")}-${regions.indexOf(selected) + 1}.png`,
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    });
  };

  const downloadSelected = () => {
    if (!selected) return;
    const preview = previews.find((item) => item.region.id === selected.id);
    if (!preview) return;
    const anchor = document.createElement("a");
    anchor.href = preview.dataUrl;
    anchor.download = `sprite-${preview.index + 1}.png`;
    anchor.click();
  };

  const draft = dragStart && dragEnd ? {
    x: Math.min(dragStart.x, dragEnd.x),
    y: Math.min(dragStart.y, dragEnd.y),
    w: Math.abs(dragEnd.x - dragStart.x),
    h: Math.abs(dragEnd.y - dragStart.y),
  } : null;

  return (
    <section className="sprite-cutter">
      <div className="sprite-cutter-head">
        <div>
          <small>SPRITEFORGE TOOLS</small>
          <h2>{ar ? "تقطيع واستخراج Sprite Sheet" : "Sprite sheet cutter"}</h2>
          <p>{ar ? "المعالجة محلية داخل المتصفح، ولا تُرفع الصور إلى أي خادم." : "Images are processed locally in your browser and are never uploaded."}</p>
        </div>
        <button className="primary" onClick={() => fileRef.current?.click()}>
          {ar ? "رفع Sprite Sheet" : "Upload sprite sheet"}
        </button>
        <input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={loadSheet} />
      </div>

      {error && <div className="sprite-error" role="alert">{error}</div>}

      {!sheet ? (
        <button className="sprite-drop" onClick={() => fileRef.current?.click()}>
          <b>＋</b>
          <span>{ar ? "اختر الشيت لبدء التقسيم" : "Choose a sheet to start slicing"}</span>
          <small>PNG · JPG · WEBP · 16 MP MAX</small>
        </button>
      ) : (
        <div className="sprite-cutter-layout">
          <aside className="sprite-settings">
            <h3>{ar ? "إعدادات الاكتشاف" : "Detection settings"}</h3>
            <label><span>Alpha threshold <b>{settings.alphaThreshold}</b></span><input type="range" min="1" max="255" value={settings.alphaThreshold} onChange={(event) => setSettings((value) => ({ ...value, alphaThreshold: Number(event.target.value) }))} /></label>
            <label><span>Min area <b>{settings.minArea}px</b></span><input type="range" min="1" max="1000" value={settings.minArea} onChange={(event) => setSettings((value) => ({ ...value, minArea: Number(event.target.value) }))} /></label>
            <label><span>Merge distance <b>{settings.mergeDistance}px</b></span><input type="range" min="0" max="35" value={settings.mergeDistance} onChange={(event) => setSettings((value) => ({ ...value, mergeDistance: Number(event.target.value) }))} /></label>
            <label className="sprite-check"><input type="checkbox" checked={settings.autoSplitTouching} onChange={(event) => setSettings((value) => ({ ...value, autoSplitTouching: event.target.checked }))} /><span>{ar ? "فصل العناصر الملتصقة" : "Split touching sprites"}</span></label>
            <label className="sprite-check"><input type="checkbox" checked={settings.backgroundRemoval} onChange={(event) => setSettings((value) => ({ ...value, backgroundRemoval: event.target.checked }))} /><span>{ar ? "إزالة لون الخلفية" : "Remove background color"}</span></label>
            {settings.backgroundRemoval && <><input aria-label="Background color" type="color" value={settings.bgColor} onChange={(event) => setSettings((value) => ({ ...value, bgColor: event.target.value }))} /><label><span>Tolerance <b>{settings.tolerance}</b></span><input type="range" min="0" max="120" value={settings.tolerance} onChange={(event) => setSettings((value) => ({ ...value, tolerance: Number(event.target.value) }))} /></label></>}
            <div className="sprite-segmented"><button className={settings.cropMode === "exact" ? "active" : ""} onClick={() => setSettings((value) => ({ ...value, cropMode: "exact" }))}>Exact</button><button className={settings.cropMode === "box" ? "active" : ""} onClick={() => setSettings((value) => ({ ...value, cropMode: "box" }))}>Box</button></div>
            <button className="primary" disabled={busy} onClick={detect}>{busy ? (ar ? "جارٍ التحليل…" : "Detecting…") : (ar ? "اكتشاف تلقائي" : "Auto detect")}</button>
            <div className="sprite-grid-controls"><input type="number" min="1" max="64" value={gridColumns} onChange={(event) => setGridColumns(Math.max(1, Number(event.target.value) || 1))} /><span>×</span><input type="number" min="1" max="64" value={gridRows} onChange={(event) => setGridRows(Math.max(1, Number(event.target.value) || 1))} /></div>
            <button onClick={sliceGrid}>{ar ? "تقسيم كشبكة" : "Slice as grid"}</button>
          </aside>

          <div className="sprite-workspace">
            <div className="sprite-toolbar"><b dir="ltr">{sheet.name} · {sheet.width}×{sheet.height}</b><button className={drawing ? "active" : ""} onClick={() => setDrawing((value) => !value)}>{drawing ? (ar ? "إنهاء الرسم" : "Stop drawing") : (ar ? "رسم قطعة يدويًا" : "Draw region")}</button></div>
            <div className="sprite-board-scroll">
              <div ref={boardRef} className={`sprite-board ${drawing ? "drawing" : ""}`} style={{ width: sheet.width * ratio, height: sheet.height * ratio }} onPointerDown={(event) => { if (drawing) { event.currentTarget.setPointerCapture(event.pointerId); const value = point(event); setDragStart(value); setDragEnd(value); } }} onPointerMove={(event) => { if (drawing && dragStart) setDragEnd(point(event)); }} onPointerUp={(event) => { if (drawing) addManualRegion(point(event)); }}>
                <img src={sheet.url} alt={sheet.name} draggable={false} />
                {regions.map((region, index) => <button key={region.id} className={`sprite-region ${selectedId === region.id ? "selected" : ""}`} style={{ left: region.x * ratio, top: region.y * ratio, width: Math.max(3, region.w * ratio), height: Math.max(3, region.h * ratio) }} onClick={(event) => { event.stopPropagation(); if (!drawing) setSelectedId(region.id); }}><span>{index + 1}</span></button>)}
                {draft && <i className="sprite-draft" style={{ left: draft.x * ratio, top: draft.y * ratio, width: draft.w * ratio, height: draft.h * ratio }} />}
              </div>
            </div>
            {selected && <div className="sprite-selection-actions"><span dir="ltr">X {selected.x} · Y {selected.y} · {selected.w}×{selected.h}</span><button onClick={() => splitSelected("x")}>{ar ? "قسم يمين/يسار" : "Split left/right"}</button><button onClick={() => splitSelected("y")}>{ar ? "قسم أعلى/أسفل" : "Split top/bottom"}</button><button onClick={() => { setRegions((current) => current.filter((region) => region.id !== selected.id)); setSelectedId(null); }}>{ar ? "حذف" : "Delete"}</button><button onClick={downloadSelected}>{ar ? "تنزيل PNG" : "Download PNG"}</button><button className="primary" onClick={useSelected}>{ar ? "استخدمها في المحرر" : "Use in editor"}</button></div>}
          </div>

          <aside className="sprite-results">
            <div><h3>{ar ? "القطع المستخرجة" : "Extracted sprites"}</h3><b>{regions.length}</b></div>
            <div className="sprite-results-grid">{previews.map(({ region, index, dataUrl }) => <button key={region.id} className={selectedId === region.id ? "active" : ""} onClick={() => setSelectedId(region.id)}><img src={dataUrl} alt={`Sprite ${index + 1}`} /><span>{index + 1}</span></button>)}</div>
          </aside>
        </div>
      )}
    </section>
  );
}
