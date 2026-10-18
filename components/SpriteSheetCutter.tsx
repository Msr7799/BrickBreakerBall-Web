"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import { get, ref, serverTimestamp, set } from "firebase/database";
import { firebaseAuth, firebaseDatabase } from "@/lib/firebase";
import type { Lang } from "@/lib/site";

export type CustomEditorSprite = {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
};

type Point = { x: number; y: number };
type Region = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pixelArea: number;
  members: number[];
  manual?: boolean;
  points?: Point[];
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
type Tool = "select" | "rectangle" | "polygon";
type CloudStatus = "loading" | "saving" | "saved" | "idle" | "error";
type BoxHandle = "move" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
type Transform =
  | { kind: "box"; region: Region; start: Point; handle: BoxHandle }
  | { kind: "vertex"; region: Region; pointIndex: number };
type SpriteWorkspaceRecord = {
  version: 1;
  sheet: { name: string; dataUrl: string; width: number; height: number };
  regions: Region[];
  settings: Settings;
  gridColumns: number;
  gridRows: number;
  selectedId: string | null;
  updatedAt?: number;
  updatedBy?: string;
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

const handles: BoxHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function spriteWorkspacePath() {
  const uid = firebaseAuth?.currentUser?.uid;
  return uid ? `adminEditor/spriteWorkspaces/${uid}` : null;
}

function polygonArea(points: Point[]) {
  return Math.abs(
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0) / 2,
  );
}

function regionFromPoints(id: string, points: Point[]): Region {
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  return {
    id,
    x: Math.round(minX),
    y: Math.round(minY),
    w: Math.max(1, Math.round(maxX - minX)),
    h: Math.max(1, Math.round(maxY - minY)),
    pixelArea: Math.max(1, Math.round(polygonArea(points))),
    members: [],
    manual: true,
    points,
  };
}

function pointInPolygon(x: number, y: number, points: Point[]) {
  let inside = false;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index++) {
    const a = points[index];
    const b = points[previous];
    const crosses =
      a.y > y !== b.y > y &&
      x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y || Number.EPSILON) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

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
      if (
        region.points &&
        !pointInPolygon(region.x + x + 0.5, region.y + y + 0.5, region.points)
      ) {
        data[offset + 3] = 0;
        continue;
      }
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

function resizedRegion(
  original: Region,
  handle: BoxHandle,
  current: Point,
  start: Point,
  sheet: Sheet,
) {
  if (handle === "move") {
    const dx = clamp(current.x - start.x, -original.x, sheet.width - original.x - original.w);
    const dy = clamp(current.y - start.y, -original.y, sheet.height - original.y - original.h);
    const moved = {
      ...original,
      x: Math.round(original.x + dx),
      y: Math.round(original.y + dy),
      manual: true,
    };
    if (original.points) {
      moved.points = original.points.map((point) => ({ x: point.x + dx, y: point.y + dy }));
    }
    return moved;
  }
  let left = original.x;
  let top = original.y;
  let right = original.x + original.w;
  let bottom = original.y + original.h;
  if (handle.includes("w")) left = clamp(current.x, 0, right - 1);
  if (handle.includes("e")) right = clamp(current.x, left + 1, sheet.width);
  if (handle.includes("n")) top = clamp(current.y, 0, bottom - 1);
  if (handle.includes("s")) bottom = clamp(current.y, top + 1, sheet.height);
  return {
    ...original,
    x: Math.round(left),
    y: Math.round(top),
    w: Math.max(1, Math.round(right - left)),
    h: Math.max(1, Math.round(bottom - top)),
    members: [],
    manual: true,
  };
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
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [settings, setSettings] = useState<Settings>(defaults);
  const [busy, setBusy] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [error, setError] = useState("");
  const [gridColumns, setGridColumns] = useState(8);
  const [gridRows, setGridRows] = useState(8);
  const [tool, setTool] = useState<Tool>("select");
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragEnd, setDragEnd] = useState<Point | null>(null);
  const [polygonDraft, setPolygonDraft] = useState<Point[]>([]);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>("loading");
  const [cloudError, setCloudError] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const transformRef = useRef<Transform | null>(null);
  const cloudReadyRef = useRef(false);
  const cloudSaveTimerRef = useRef<number | null>(null);

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

  const replaceRegion = (next: Region) =>
    setRegions((current) => current.map((region) => (region.id === next.id ? next : region)));

  const restoreCloudWorkspace = async (announce = false) => {
    const path = spriteWorkspacePath();
    if (!firebaseDatabase || !path) {
      setCloudStatus("error");
      setCloudError(ar ? "جلسة Firebase غير متاحة" : "Firebase session is unavailable");
      return;
    }
    cloudReadyRef.current = false;
    setCloudStatus("loading");
    setCloudError("");
    try {
      const snapshot = await get(ref(firebaseDatabase, path));
      if (!snapshot.exists()) {
        setCloudStatus("idle");
        if (announce) setError(ar ? "لا يوجد مشروع قص محفوظ بعد." : "No saved cutter project yet.");
        return;
      }
      const saved = snapshot.val() as SpriteWorkspaceRecord;
      if (saved.version !== 1 || !saved.sheet?.dataUrl || !Array.isArray(saved.regions))
        throw new Error(ar ? "بيانات المشروع السحابي غير صالحة." : "Cloud workspace data is invalid.");
      const image = new Image();
      image.src = saved.sheet.dataUrl;
      await image.decode();
      setSheet({
        name: saved.sheet.name,
        url: saved.sheet.dataUrl,
        image,
        width: saved.sheet.width,
        height: saved.sheet.height,
      });
      setRegions(saved.regions);
      setSettings({ ...defaults, ...saved.settings });
      setGridColumns(saved.gridColumns || 8);
      setGridRows(saved.gridRows || 8);
      setSelectedId(saved.selectedId && saved.regions.some((region) => region.id === saved.selectedId) ? saved.selectedId : saved.regions[0]?.id ?? null);
      setSelectedPoint(null);
      setLabels(null);
      setPolygonDraft([]);
      setTool("select");
      setCloudStatus("saved");
      if (announce) setError("");
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : String(caught);
      setCloudStatus("error");
      setCloudError(detail);
      if (announce) setError(detail);
    } finally {
      cloudReadyRef.current = true;
    }
  };

  const saveCloudWorkspace = async (announce = false) => {
    const path = spriteWorkspacePath();
    const currentUser = firebaseAuth?.currentUser;
    if (!firebaseDatabase || !path || !currentUser || !sheet) return;
    setCloudStatus("saving");
    setCloudError("");
    const record: SpriteWorkspaceRecord = {
      version: 1,
      sheet: { name: sheet.name, dataUrl: sheet.url, width: sheet.width, height: sheet.height },
      regions,
      settings,
      gridColumns,
      gridRows,
      selectedId,
      updatedBy: currentUser.email ?? currentUser.uid,
    };
    try {
      const payload = JSON.parse(JSON.stringify(record)) as SpriteWorkspaceRecord;
      await set(ref(firebaseDatabase, path), { ...payload, updatedAt: serverTimestamp() });
      try {
        localStorage.setItem("bbb-sprite-cutter-workspace", JSON.stringify(record));
      } catch {
        // Firebase remains the source of truth when a large sheet exceeds localStorage.
      }
      setCloudStatus("saved");
      if (announce) setError("");
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : String(caught);
      setCloudStatus("error");
      setCloudError(detail);
      if (announce) setError(detail);
    }
  };

  useEffect(() => {
    void restoreCloudWorkspace();
    // The authenticated admin identity is fixed while this component is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cloudReadyRef.current || !sheet) return;
    if (cloudSaveTimerRef.current) window.clearTimeout(cloudSaveTimerRef.current);
    setCloudStatus("saving");
    cloudSaveTimerRef.current = window.setTimeout(() => void saveCloudWorkspace(), 1200);
    return () => {
      if (cloudSaveTimerRef.current) window.clearTimeout(cloudSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridColumns, gridRows, regions, selectedId, settings, sheet?.name, sheet?.url]);

  const point = (event: PointerEvent<HTMLElement>): Point => {
    const bounds = boardRef.current!.getBoundingClientRect();
    return {
      x: clamp(Math.round((event.clientX - bounds.left) / ratio), 0, sheet!.width),
      y: clamp(Math.round((event.clientY - bounds.top) / ratio), 0, sheet!.height),
    };
  };

  const loadSheet = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError(ar ? "استخدم صورة PNG أو JPG أو WebP." : "Use a PNG, JPG, or WebP image.");
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      const image = new Image();
      image.src = url;
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 16_000_000)
        throw new Error(ar ? "الصورة تتجاوز حد 16 مليون بكسل." : "The image exceeds 16 million pixels.");
      setSheet({ name: file.name, url, image, width: image.naturalWidth, height: image.naturalHeight });
      setRegions([]);
      setLabels(null);
      setSelectedId(null);
      setSelectedPoint(null);
      setPolygonDraft([]);
      setError("");
    } catch (caught) {
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
          { sheetId: "editor-sheet", buffer: pixels.data.buffer, width: sheet.width, height: sheet.height, settings },
          [pixels.data.buffer],
        );
      });
      if (result.type === "error") throw new Error(result.message ?? "Detection failed");
      const next = (result.regions ?? []).map((region) => ({ ...region, id: `auto-${region.index}` }));
      setRegions(next);
      setLabels(result.labels ?? null);
      setSelectedId(next[0]?.id ?? null);
      setSelectedPoint(null);
      setTool("select");
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
        next.push({ id: `grid-${row}-${column}`, x, y, w: right - x, h: bottom - y, pixelArea: (right - x) * (bottom - y), members: [], manual: true });
      }
    }
    setRegions(next);
    setLabels(null);
    setSelectedId(next[0]?.id ?? null);
    setSelectedPoint(null);
    setTool("select");
  };

  const addManualRegion = (end: Point) => {
    if (!dragStart) return;
    const x = Math.min(dragStart.x, end.x);
    const y = Math.min(dragStart.y, end.y);
    const w = Math.abs(end.x - dragStart.x);
    const h = Math.abs(end.y - dragStart.y);
    if (w > 1 && h > 1) {
      const region: Region = { id: `manual-${crypto.randomUUID()}`, x, y, w, h, pixelArea: w * h, members: [], manual: true };
      setRegions((current) => [...current, region]);
      setSelectedId(region.id);
      setTool("select");
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const finishPolygon = () => {
    if (polygonDraft.length < 3) return;
    const region = regionFromPoints(`polygon-${crypto.randomUUID()}`, polygonDraft);
    setRegions((current) => [...current, region]);
    setSelectedId(region.id);
    setSelectedPoint(null);
    setPolygonDraft([]);
    setTool("select");
  };

  const beginBoxTransform = (
    event: PointerEvent<HTMLElement>,
    region: Region,
    handle: BoxHandle,
  ) => {
    if (tool !== "select") return;
    event.preventDefault();
    event.stopPropagation();
    boardRef.current?.setPointerCapture(event.pointerId);
    setSelectedId(region.id);
    setSelectedPoint(null);
    transformRef.current = { kind: "box", region: { ...region, points: region.points?.map((item) => ({ ...item })) }, start: point(event), handle };
  };

  const beginVertexTransform = (
    event: PointerEvent<HTMLButtonElement>,
    region: Region,
    pointIndex: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    boardRef.current?.setPointerCapture(event.pointerId);
    setSelectedPoint(pointIndex);
    transformRef.current = { kind: "vertex", region: { ...region, points: region.points?.map((item) => ({ ...item })) }, pointIndex };
  };

  const onBoardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const value = point(event);
    if (tool === "rectangle") {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragStart(value);
      setDragEnd(value);
      return;
    }
    if (tool === "polygon") {
      const first = polygonDraft[0];
      const closeDistance = first ? Math.hypot(value.x - first.x, value.y - first.y) * ratio : Infinity;
      if (polygonDraft.length >= 3 && closeDistance <= 12) finishPolygon();
      else setPolygonDraft((current) => [...current, value]);
      return;
    }
    setSelectedId(null);
    setSelectedPoint(null);
  };

  const onBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const value = point(event);
    if (tool === "rectangle" && dragStart) {
      setDragEnd(value);
      return;
    }
    const transform = transformRef.current;
    if (!transform || !sheet) return;
    if (transform.kind === "box") {
      replaceRegion(resizedRegion(transform.region, transform.handle, value, transform.start, sheet));
      return;
    }
    const points = transform.region.points?.map((item) => ({ ...item })) ?? [];
    points[transform.pointIndex] = {
      x: clamp(value.x, 0, sheet.width),
      y: clamp(value.y, 0, sheet.height),
    };
    replaceRegion(regionFromPoints(transform.region.id, points));
  };

  const onBoardPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (tool === "rectangle" && dragStart) addManualRegion(point(event));
    transformRef.current = null;
  };

  const convertToPolygon = () => {
    if (!selected) return;
    const points = [
      { x: selected.x, y: selected.y },
      { x: selected.x + selected.w, y: selected.y },
      { x: selected.x + selected.w, y: selected.y + selected.h },
      { x: selected.x, y: selected.y + selected.h },
    ];
    replaceRegion(regionFromPoints(selected.id, points));
    setSelectedPoint(0);
  };

  const insertPolygonPoint = (index: number) => {
    if (!selected?.points) return;
    const points = selected.points.map((item) => ({ ...item }));
    const next = points[(index + 1) % points.length];
    const current = points[index];
    points.splice(index + 1, 0, { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 });
    replaceRegion(regionFromPoints(selected.id, points));
    setSelectedPoint(index + 1);
  };

  const deleteSelectedPoint = () => {
    if (!selected?.points || selectedPoint === null || selected.points.length <= 3) return;
    const points = selected.points.filter((_, index) => index !== selectedPoint);
    replaceRegion(regionFromPoints(selected.id, points));
    setSelectedPoint(null);
  };

  const updateGeometry = (field: "x" | "y" | "w" | "h", raw: number) => {
    if (!selected || !sheet || !Number.isFinite(raw)) return;
    const next = { ...selected, points: selected.points?.map((item) => ({ ...item })) };
    const old = { x: selected.x, y: selected.y, w: selected.w, h: selected.h };
    if (field === "x") next.x = clamp(Math.round(raw), 0, sheet.width - next.w);
    if (field === "y") next.y = clamp(Math.round(raw), 0, sheet.height - next.h);
    if (field === "w") next.w = clamp(Math.round(raw), 1, sheet.width - next.x);
    if (field === "h") next.h = clamp(Math.round(raw), 1, sheet.height - next.y);
    if (next.points) {
      next.points = next.points.map((item) => ({
        x: next.x + ((item.x - old.x) / old.w) * next.w,
        y: next.y + ((item.y - old.y) / old.h) * next.h,
      }));
      replaceRegion(regionFromPoints(next.id, next.points));
    } else {
      next.manual = true;
      next.members = [];
      next.pixelArea = next.w * next.h;
      replaceRegion(next);
    }
  };

  const splitSelected = (axis: "x" | "y") => {
    if (!selected || selected.points) return;
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

  const deleteRegion = (id: string) => {
    setRegions((current) => current.filter((region) => region.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedPoint(null);
    }
  };

  const downloadZip = async () => {
    if (!sheet || exportingZip) return;
    setExportingZip(true);
    setError("");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const imageType = /^data:image\/(png|jpeg|webp);base64,/.exec(sheet.url)?.[1];
      if (!imageType) throw new Error(ar ? "تعذر قراءة الصورة للتصدير." : "Could not read the image for export.");
      const baseName = sheet.name.replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}._-]+/gu, "_") || "sprite-sheet";
      const imageName = `${baseName}.${imageType === "jpeg" ? "jpg" : imageType}`;
      zip.file(imageName, sheet.url.slice(sheet.url.indexOf(",") + 1), { base64: true });
      zip.file(`${baseName}.json`, JSON.stringify({
        version: 1,
        image: { file: imageName, width: sheet.width, height: sheet.height },
        coordinates: "pixels from top-left of original image",
        sprites: regions.map((region, index) => ({
          index: index + 1,
          id: region.id,
          x: region.x,
          y: region.y,
          width: region.w,
          height: region.h,
          ...(region.points ? { points: region.points } : {}),
        })),
      }, null, 2));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${baseName}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setExportingZip(false);
    }
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
          <p>{ar ? "ارسم مستطيلات أو مسارات نقطية دقيقة. تتم المعالجة محليًا داخل المتصفح." : "Draw rectangles or precise point paths. Images are processed locally in your browser."}</p>
        </div>
        <div className="sprite-project-actions">
          <span className={`sprite-project-status ${cloudStatus}`} title={cloudError || undefined}>
            <i />
            {cloudStatus === "loading" && (ar ? "استعادة المشروع…" : "Restoring…")}
            {cloudStatus === "saving" && (ar ? "حفظ تلقائي…" : "Auto-saving…")}
            {cloudStatus === "saved" && (ar ? "محفوظ في السحابة" : "Saved to cloud")}
            {cloudStatus === "idle" && (ar ? "جاهز للحفظ" : "Ready to save")}
            {cloudStatus === "error" && (ar ? "تعذرت المزامنة" : "Sync failed")}
          </span>
          <button disabled={!sheet || cloudStatus === "saving"} onClick={() => void saveCloudWorkspace(true)}>
            {ar ? "حفظ الآن" : "Save now"}
          </button>
          <button disabled={cloudStatus === "loading"} onClick={() => void restoreCloudWorkspace(true)}>
            {ar ? "استعادة" : "Restore"}
          </button>
          <button disabled={!sheet || exportingZip} onClick={() => void downloadZip()}>
            {exportingZip ? (ar ? "جارٍ تجهيز ZIP…" : "Preparing ZIP…") : (ar ? "تنزيل ZIP (الصورة + JSON)" : "Download ZIP (image + JSON)")}
          </button>
          <button className="primary" onClick={() => fileRef.current?.click()}>{ar ? "رفع Sprite Sheet" : "Upload sprite sheet"}</button>
        </div>
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
            <div className="sprite-toolbar">
              <b dir="ltr">{sheet.name} · {sheet.width}×{sheet.height}</b>
              <div className="sprite-tool-group">
                <button className={tool === "select" ? "active" : ""} onClick={() => { setTool("select"); setPolygonDraft([]); }}>⌖ {ar ? "تحديد" : "Select"}</button>
                <button className={tool === "rectangle" ? "active" : ""} onClick={() => { setTool("rectangle"); setPolygonDraft([]); }}>▭ {ar ? "مستطيل" : "Rectangle"}</button>
                <button className={tool === "polygon" ? "active" : ""} onClick={() => setTool("polygon")}>◇ {ar ? "نقاط" : "Pen"}</button>
                {tool === "polygon" && polygonDraft.length >= 3 && <button className="primary" onClick={finishPolygon}>{ar ? "إغلاق الشكل" : "Close shape"}</button>}
                {tool === "polygon" && polygonDraft.length > 0 && <button onClick={() => setPolygonDraft([])}>{ar ? "إلغاء" : "Cancel"}</button>}
              </div>
            </div>
            {tool === "polygon" && <div className="sprite-tool-tip">{ar ? "انقر لزرع النقاط، ثم انقر أول نقطة أو زر «إغلاق الشكل»." : "Click to place points, then click the first point or Close shape."}</div>}
            <div className="sprite-board-scroll">
              <div
                ref={boardRef}
                className={`sprite-board tool-${tool}`}
                style={{ width: sheet.width * ratio, height: sheet.height * ratio }}
                onPointerDown={onBoardPointerDown}
                onPointerMove={onBoardPointerMove}
                onPointerUp={onBoardPointerUp}
                onPointerCancel={() => { transformRef.current = null; setDragStart(null); setDragEnd(null); }}
              >
                <img src={sheet.url} alt={sheet.name} draggable={false} />
                <svg className="sprite-vector-layer" viewBox={`0 0 ${sheet.width} ${sheet.height}`} preserveAspectRatio="none" aria-hidden="true">
                  {regions.filter((region) => region.points).map((region) => (
                    <polygon key={region.id} className={selectedId === region.id ? "selected" : ""} points={region.points!.map((item) => `${item.x},${item.y}`).join(" ")} />
                  ))}
                  {polygonDraft.length > 0 && <polyline className="draft" points={polygonDraft.map((item) => `${item.x},${item.y}`).join(" ")} />}
                </svg>
                {regions.map((region, index) => (
                  <div
                    key={region.id}
                    className={`sprite-region ${region.points ? "polygon" : ""} ${selectedId === region.id ? "selected" : ""}`}
                    style={{ left: region.x * ratio, top: region.y * ratio, width: Math.max(3, region.w * ratio), height: Math.max(3, region.h * ratio) }}
                    onPointerDown={(event) => beginBoxTransform(event, region, "move")}
                    role="button"
                    tabIndex={0}
                  >
                    <span>{index + 1}</span>
                  </div>
                ))}
                {selected && !selected.points && handles.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    aria-label={`Resize ${handle}`}
                    className={`sprite-resize-handle handle-${handle}`}
                    style={{ left: (selected.x + (handle.includes("w") ? 0 : handle.includes("e") ? selected.w : selected.w / 2)) * ratio, top: (selected.y + (handle.includes("n") ? 0 : handle.includes("s") ? selected.h : selected.h / 2)) * ratio }}
                    onPointerDown={(event) => beginBoxTransform(event, selected, handle)}
                  />
                ))}
                {selected?.points?.map((item, index) => {
                  const next = selected.points![(index + 1) % selected.points!.length];
                  return (
                    <span key={`${selected.id}-point-${index}`}>
                      <button
                        type="button"
                        aria-label={`Point ${index + 1}`}
                        className={`sprite-vector-point ${selectedPoint === index ? "active" : ""}`}
                        style={{ left: item.x * ratio, top: item.y * ratio }}
                        onPointerDown={(event) => beginVertexTransform(event, selected, index)}
                        onDoubleClick={deleteSelectedPoint}
                      />
                      <button
                        type="button"
                        aria-label={ar ? "إضافة نقطة" : "Add point"}
                        className="sprite-vector-midpoint"
                        style={{ left: ((item.x + next.x) / 2) * ratio, top: ((item.y + next.y) / 2) * ratio }}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => insertPolygonPoint(index)}
                      />
                    </span>
                  );
                })}
                {polygonDraft.map((item, index) => <i key={`draft-point-${index}`} className={`sprite-draft-point ${index === 0 ? "first" : ""}`} style={{ left: item.x * ratio, top: item.y * ratio }} />)}
                {draft && <i className="sprite-draft" style={{ left: draft.x * ratio, top: draft.y * ratio, width: draft.w * ratio, height: draft.h * ratio }} />}
              </div>
            </div>
            {selected && (
              <div className="sprite-selection-panel">
                <div className="sprite-geometry-fields">
                  {(["x", "y", "w", "h"] as const).map((field) => (
                    <label key={field}><span>{field.toUpperCase()}</span><input type="number" min={field === "w" || field === "h" ? 1 : 0} value={selected[field]} onChange={(event) => updateGeometry(field, Number(event.target.value))} /></label>
                  ))}
                </div>
                <div className="sprite-selection-actions">
                  <span dir="ltr">{selected.points ? `${selected.points.length} POINTS` : `X ${selected.x} · Y ${selected.y} · ${selected.w}×${selected.h}`}</span>
                  {!selected.points && <><button onClick={() => splitSelected("x")}>{ar ? "قسم يمين/يسار" : "Split left/right"}</button><button onClick={() => splitSelected("y")}>{ar ? "قسم أعلى/أسفل" : "Split top/bottom"}</button><button onClick={convertToPolygon}>{ar ? "تحويل إلى نقاط" : "Convert to path"}</button></>}
                  {selected.points && <button disabled={selectedPoint === null || selected.points.length <= 3} onClick={deleteSelectedPoint}>{ar ? "حذف النقطة" : "Delete point"}</button>}
                  <button onClick={() => deleteRegion(selected.id)}>{ar ? "حذف المكوّن" : "Delete sprite"}</button>
                  <button onClick={downloadSelected}>{ar ? "تنزيل PNG" : "Download PNG"}</button>
                  <button className="primary" onClick={useSelected}>{ar ? "استخدامها في المحرر" : "Use in editor"}</button>
                </div>
              </div>
            )}
          </div>

          <aside className="sprite-results">
            <div><h3>{ar ? "القطع المستخرجة" : "Extracted sprites"}</h3><b>{regions.length}</b></div>
            <div className="sprite-results-grid">{previews.map(({ region, index, dataUrl }) => <div className="sprite-result-item" key={region.id}><button className={`sprite-result-select ${selectedId === region.id ? "active" : ""}`} aria-label={ar ? `تحديد المكوّن ${index + 1}` : `Select sprite ${index + 1}`} onClick={() => { setSelectedId(region.id); setSelectedPoint(null); setTool("select"); }}><img src={dataUrl} alt="" /><span>{index + 1}</span></button><button className="sprite-result-delete" aria-label={ar ? `حذف المكوّن ${index + 1}` : `Delete sprite ${index + 1}`} title={ar ? "حذف المكوّن" : "Delete sprite"} onClick={() => deleteRegion(region.id)}>×</button></div>)}</div>
          </aside>
        </div>
      )}
    </section>
  );
}
