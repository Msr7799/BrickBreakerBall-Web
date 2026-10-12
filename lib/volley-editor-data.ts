import formationData from "./volley-formations.generated.json";

export type VolleyShape = "RECTANGLE" | "TRIANGLE_NW" | "TRIANGLE_NE" | "TRIANGLE_SW" | "TRIANGLE_SE";

export const EDITOR_ROWS = 9;
export const EDITOR_COLUMNS = 11;

export const BRICK_TYPES = [
  "NORMAL_ONE_HIT", "CRYSTAL_BLUE", "CRYSTAL_MAROON", "CRYSTAL_GREEN", "CRYSTAL_ORANGE",
  "CRYSTAL_RED", "CRYSTAL_PURPLE", "CRYSTAL_PINK", "ELECTRIC_WHITE", "STONE_GRAY",
  "ROUGH_STONE", "GLASS", "ARMORED_TWO_HIT", "ARMORED_THREE_HIT", "ARMORED_DARK",
  "POWERUP_CARRIER", "RANDOM_INVENTORY_POWERUP", "REGENERATING", "EXPLOSIVE",
  "LIGHTNING_SPEED_PASS_THROUGH", "TRANSPARENT_SLOW_PASS_THROUGH", "MOVING_HORIZONTAL",
  "MOVING_VERTICAL", "KEY_BRICK", "LOCKED", "SWITCH", "GHOST", "CHAIN_BRICK",
  "BLACK_HOLE_TELEPORTER", "INDESTRUCTIBLE", "SPIKED_HAZARD", "BOSS_CORE",
] as const;

export type VolleyBrickType = typeof BRICK_TYPES[number];

export type EditorBrick = {
  type: VolleyBrickType;
  /** Exact frame name from this world's atlas, when the brick uses an atlas tile directly. */
  atlasSprite?: string;
  hp: number;
  shape: VolleyShape;
  groupId: number;
  countsForClear: boolean;
  shieldLock?: boolean;
  hazardKind?: "SPIKED" | "LASER" | "DEATH";
};

export type EditorRail = { x1: number; y1: number; x2: number; y2: number; thickness: number; fixed: boolean };
export type EditorPickup = { x: number; y: number; amount: number; type: "BALL" | "CROWN" | "SHIELD" | "MYSTERY" | "STAR" | "SPEED" | "COINS" };

export type EditorStage = {
  format: "brick-breaker-ball-volley-stage";
  version: 1;
  world: number;
  stage: number;
  name: string;
  rows: typeof EDITOR_ROWS;
  columns: typeof EDITOR_COLUMNS;
  backgroundAsset: string;
  spritesheetAsset: string;
  atlasAsset: string;
  expectedSourceSheet: string;
  cannonAsset: string;
  referenceAsset: string;
  baseHp: number;
  startingBalls: number;
  bossStage: boolean;
  cells: Array<Array<EditorBrick | null>>;
  rails: EditorRail[];
  pickups: EditorPickup[];
};

const folderNames = [
  "01_Mystery_Forest", "02_Venom_Wilds", "03_Aqua_Vortex", "04_Desert_Spirits",
  "05_Ice_Grave", "06_Tormented_Souls", "07_Moon_light", "08_Infernal_Gates", "09_Final_Eclipse",
];
const expectedSourceSheets = ["1.png", "6.png", "2.png", "7.png", "4.png", "5.png", "9.png", "3.png", "8.png"];
const cannonFiles = ["Mystery_Forest_Cannon.png", "Venom_Wilds_Cannon.png", "Aqua_Vortex_Cannon.png", "Desert_Spirits_Cannon.png", "Ice_Grave_Cannon.png", "Tormented_Souls_Cannon.png", "Moon_Light_Cannon.png", "Infernal_Gates_Cannon.png", "Final_Eclipse_Cannon.png"];

const imageNumbers = [
  [1, 2, 3, 4, 5, 6, 7],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6, 7, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
];

export const EDITOR_WORLDS = [
  { id: 1, en: "Mystery Forest", ar: "الغابة الغامضة", stages: 7 },
  { id: 2, en: "Venom Wilds", ar: "براري السموم", stages: 10 },
  { id: 3, en: "Aqua Vortex", ar: "دوامة المياه", stages: 6 },
  { id: 4, en: "Desert Spirits", ar: "أرواح الصحراء", stages: 10 },
  { id: 5, en: "Ice Grave", ar: "قبر الجليد", stages: 10 },
  { id: 6, en: "Tormented Souls", ar: "الأرواح المعذبة", stages: 10 },
  { id: 7, en: "Moon Light", ar: "ضوء القمر", stages: 8 },
  { id: 8, en: "Infernal Gates", ar: "بوابات الجحيم", stages: 10 },
  { id: 9, en: "Final Eclipse", ar: "الكسوف الأخير", stages: 10 },
] as const;

const shapes: Record<string, VolleyShape> = { "1": "TRIANGLE_NW", "2": "TRIANGLE_NE", "3": "TRIANGLE_SW", "4": "TRIANGLE_SE" };
const labels = ["OPENING SALVO", "CROSSFIRE", "TWIN GATES", "RICOCHET VAULT", "FALLING FORTRESS", "RELIC CACHE", "PRISM BASTION", "DIAMOND CITADEL", "CHEVRON CASCADE"];
const formationPalettes: VolleyBrickType[][] = [
  ["CRYSTAL_GREEN", "CRYSTAL_MAROON", "NORMAL_ONE_HIT", "GLASS", "ROUGH_STONE", "ARMORED_TWO_HIT", "CRYSTAL_BLUE", "CRYSTAL_PURPLE"],
  ["CRYSTAL_MAROON", "ARMORED_DARK", "CRYSTAL_BLUE", "GLASS", "ARMORED_TWO_HIT", "ARMORED_THREE_HIT", "ROUGH_STONE", "CRYSTAL_PURPLE"],
  ["CRYSTAL_GREEN", "CRYSTAL_BLUE", "ROUGH_STONE", "GLASS", "CRYSTAL_PINK", "ARMORED_TWO_HIT", "ELECTRIC_WHITE", "CRYSTAL_PURPLE"],
  ["STONE_GRAY", "CRYSTAL_ORANGE", "CRYSTAL_RED", "ROUGH_STONE", "GLASS", "ARMORED_TWO_HIT", "CRYSTAL_MAROON", "ELECTRIC_WHITE"],
  ["CRYSTAL_MAROON", "CRYSTAL_GREEN", "ELECTRIC_WHITE", "CRYSTAL_BLUE", "GLASS", "ARMORED_TWO_HIT", "CRYSTAL_PURPLE", "ROUGH_STONE"],
  ["ELECTRIC_WHITE", "CRYSTAL_PURPLE", "ARMORED_DARK", "CRYSTAL_MAROON", "GLASS", "ARMORED_TWO_HIT", "CRYSTAL_BLUE", "ROUGH_STONE"],
  ["CRYSTAL_BLUE", "CRYSTAL_GREEN", "CRYSTAL_PINK", "GLASS", "ROUGH_STONE", "ARMORED_TWO_HIT", "CRYSTAL_PURPLE", "ELECTRIC_WHITE"],
  ["ELECTRIC_WHITE", "CRYSTAL_BLUE", "STONE_GRAY", "ARMORED_DARK", "CRYSTAL_RED", "GLASS", "ARMORED_TWO_HIT", "CRYSTAL_PURPLE"],
  ["CRYSTAL_PURPLE", "ARMORED_DARK", "CRYSTAL_PINK", "GLASS", "ROUGH_STONE", "ARMORED_TWO_HIT", "CRYSTAL_RED", "ELECTRIC_WHITE"],
];
const materials = formationPalettes;

const unbreakable = new Set<VolleyBrickType>(["INDESTRUCTIBLE", "BLACK_HOLE_TELEPORTER", "SPIKED_HAZARD"]);
const nonObjectives = new Set<VolleyBrickType>(["SWITCH", "TRANSPARENT_SLOW_PASS_THROUGH", "LIGHTNING_SPEED_PASS_THROUGH", ...unbreakable]);
const oneHit = new Set<VolleyBrickType>(["NORMAL_ONE_HIT", "ROUGH_STONE", "LIGHTNING_SPEED_PASS_THROUGH", "TRANSPARENT_SLOW_PASS_THROUGH"]);
const totalLevels = imageNumbers.reduce((sum, values) => sum + values.length, 0);

function mod(value: number, by: number) { return ((value % by) + by) % by; }
function levelIdFor(world: number, stage: number) { return imageNumbers.slice(0, world - 1).reduce((sum, values) => sum + values.length, 0) + stage; }

export function createVolleyStage(world: number, stage: number): EditorStage {
  world = Math.max(1, Math.min(9, world));
  stage = Math.max(1, Math.min(imageNumbers[world - 1].length, stage));
  const levelId = levelIdFor(world, stage);
  const baseHp = 3 + Math.floor(((levelId - 1) * 27) / Math.max(1, totalLevels - 1));
  const startingBalls = 18 + Math.floor(((levelId - 1) * 26) / Math.max(1, totalLevels - 1));
  const bossStage = stage === imageNumbers[world - 1].length;
  const formation = formationData[levelId - 1] ?? formationData[0];
  const grid: Array<Array<({ type: VolleyBrickType; shape: VolleyShape; scale: number; groupId: number; countsForClear?: boolean; shieldLock?: boolean; hazardKind?: "SPIKED" | "LASER" | "DEATH" }) | null>> = Array.from({ length: 8 }, () => Array(9).fill(null));
  const rails: EditorRail[] = [];
  const pickups: EditorPickup[] = [];
  const material = materials[world - 1];
  const formationPalette = formationPalettes[world - 1];
  const formationType = (row: number, column: number) => formationPalette[mod(Number(formation.variants[row]?.[column]) || 0, formationPalette.length)];
  const put = (r: number, c: number, type: VolleyBrickType = material[mod(r + c + world, material.length)], groupId = 0, scale = 1) => {
    if (r >= 0 && r < 8 && c >= 0 && c < 9) grid[r][c] = { type, shape: "RECTANGLE", scale, groupId };
  };
  const putSeed = (r: number, c: number, type: VolleyBrickType, options: Partial<NonNullable<(typeof grid)[number][number]>> = {}) => {
    if (r >= 0 && r < 8 && c >= 0 && c < 9) grid[r][c] = { type, shape: "RECTANGLE", scale: 1, groupId: 0, ...options };
  };
  const addRail = (x1: number, y1: number, x2: number, y2: number, thickness = 22, fixed = false) => rails.push({ x1, y1, x2, y2, thickness, fixed });
  const addPickup = (x: number, y: number, amount: number, type: EditorPickup["type"] = "BALL") => pickups.push({ x, y, amount, type });

  formation.rows.forEach((line, row) => [...line].forEach((character, column) => {
    if (character === ".") return;
    put(row, column, formationType(row, column));
    if (character !== "#" && grid[row][column]) grid[row][column]!.shape = shapes[character] ?? "RECTANGLE";
  }));

  if (bossStage) {
    const outer = [[0,0],[0,1],[0,7],[0,8],[1,0],[1,8],[2,0],[2,8],[3,0],[3,8],[4,0],[4,1],[4,2],[4,6],[4,7],[4,8]];
    outer.forEach(([r,c], i) => put(r,c,material[mod(world+i,material.length)],0,1.22+world*.025));
    [[0,3],[0,5],[2,3],[2,5],[4,3],[4,5]].forEach(([r,c], i) => put(r,c,material[mod(world*2+i,material.length)],0,1.30+world*.03));
    const reinforcements = [[0,2],[0,6],[1,1],[1,7],[2,1],[2,2],[2,6],[2,7],[3,1],[3,7],[4,4]];
    if (world >= 6) reinforcements.push([1,3],[1,5]);
    reinforcements.forEach(([r,c], i) => put(r,c,material[mod(world*5+i,material.length)],0,1.26+world*.028));
    [[5,0],[5,1],[5,2],[5,6],[5,7],[5,8],[6,0],[6,1],[6,3],[6,5],[6,7],[6,8],[7,1],[7,2],[7,6],[7,7]].forEach(([r,c], i) => put(r,c,material[mod(world*7+i,material.length)],0,1.20+world*.026));
    const guard: VolleyBrickType = ["ARMORED_TWO_HIT","ARMORED_THREE_HIT","REGENERATING","EXPLOSIVE","ARMORED_DARK","ARMORED_DARK","CHAIN_BRICK","REGENERATING","ARMORED_DARK"][world-1] as VolleyBrickType;
    [[1,2],[1,6],[3,2],[3,6]].forEach(([r,c]) => putSeed(r,c,guard,{ scale:1.35+world*.035, countsForClear:true, shieldLock:true }));
    putSeed(0,4,"BOSS_CORE",{ groupId:2100+world, scale:3.35+world*.13, countsForClear:true });
    addRail(.75,5.05,2.55,4.10,25,world>=6); addRail(8.25,5.05,6.45,4.10,25,world>=6);
    if (world >= 5) { addRail(3.35,4.30,4.15,4.78,19,world>=8); addRail(5.65,4.30,4.85,4.78,19,world>=8); }
    addPickup(4.5,5.6,world>=7?3:2);
    if (world===3) put(1,4,"MOVING_HORIZONTAL",0,1.1);
    if (world===4) put(3,4,"EXPLOSIVE");
    if (world===5) { const g=2505; putSeed(1,4,"SWITCH",{groupId:g,scale:.75,countsForClear:false}); put(3,4,"GHOST",g,1.1); }
    if (world===6) { const g=2606; put(1,4,"KEY_BRICK",g,.8); put(3,4,"LOCKED",g,1.35); }
    if (world===7) { const g=2707; putSeed(1,4,"BLACK_HOLE_TELEPORTER",{groupId:g,countsForClear:false}); putSeed(4,4,"BLACK_HOLE_TELEPORTER",{groupId:g,countsForClear:false}); }
    if (world===8) { putSeed(1,4,"INDESTRUCTIBLE",{countsForClear:false}); putSeed(4,4,"INDESTRUCTIBLE",{countsForClear:false}); }
    if (world===9) putSeed(4,4,"SPIKED_HAZARD",{countsForClear:false,hazardKind:"LASER"});
    [[0,0],[1,0],[5,0],[6,0],[7,1]].forEach(([r,c])=>{ if(grid[r][c]) grid[r][c]!.shape="TRIANGLE_NW"; });
    [[0,8],[1,8],[5,8],[6,8],[7,7]].forEach(([r,c])=>{ if(grid[r][c]) grid[r][c]!.shape="TRIANGLE_NE"; });
    [[4,0],[5,2],[6,3]].forEach(([r,c])=>{ if(grid[r][c]) grid[r][c]!.shape="TRIANGLE_SW"; });
    [[4,8],[5,6],[6,5]].forEach(([r,c])=>{ if(grid[r][c]) grid[r][c]!.shape="TRIANGLE_SE"; });
  } else {
    const archetype = mod(stage - 1 + (world - 1) * 2, 9);
    const railSets: EditorRail[][] = [
      [{x1:.7,y1:5.3,x2:2.75,y2:4.12,thickness:22,fixed:false},{x1:8.3,y1:5.3,x2:6.25,y2:4.12,thickness:22,fixed:false}],
      [{x1:.65,y1:4.95,x2:2.55,y2:3.92,thickness:22,fixed:false},{x1:8.35,y1:4.95,x2:6.45,y2:3.92,thickness:22,fixed:false}],
      [],
      [{x1:.85,y1:4.95,x2:3.35,y2:3.72,thickness:23,fixed:false},{x1:8.15,y1:4.95,x2:5.65,y2:3.72,thickness:23,fixed:false}],
      [{x1:.75,y1:5.05,x2:2.65,y2:4.05,thickness:22,fixed:false},{x1:2.85,y1:4,x2:4.15,y2:4.72,thickness:20,fixed:false},{x1:6.15,y1:4,x2:4.85,y2:4.72,thickness:20,fixed:false},{x1:8.25,y1:5.05,x2:6.35,y2:4.05,thickness:22,fixed:false}],
      [{x1:.85,y1:5,x2:3.1,y2:3.95,thickness:22,fixed:false},{x1:4.5,y1:5.05,x2:4.5,y2:4.15,thickness:18,fixed:false},{x1:8.15,y1:5,x2:5.9,y2:3.95,thickness:22,fixed:false}],
      [{x1:.65,y1:5.02,x2:2.2,y2:4.15,thickness:24,fixed:true},{x1:8.35,y1:5.02,x2:6.8,y2:4.15,thickness:24,fixed:true},{x1:3.25,y1:4.1,x2:4.15,y2:4.72,thickness:19,fixed:false},{x1:5.75,y1:4.1,x2:4.85,y2:4.72,thickness:19,fixed:false}],
      [{x1:.72,y1:5.25,x2:3.18,y2:3.92,thickness:23,fixed:false},{x1:8.28,y1:5.25,x2:5.82,y2:3.92,thickness:23,fixed:false},{x1:3.18,y1:3.92,x2:4.18,y2:4.52,thickness:19,fixed:false},{x1:5.82,y1:3.92,x2:4.82,y2:4.52,thickness:19,fixed:false}],
      [{x1:.68,y1:5.22,x2:2.92,y2:4.02,thickness:22,fixed:false},{x1:3.22,y1:4.02,x2:4.18,y2:4.62,thickness:19,fixed:false},{x1:8.32,y1:5.22,x2:6.08,y2:4.02,thickness:22,fixed:false},{x1:5.78,y1:4.02,x2:4.82,y2:4.62,thickness:19,fixed:false}],
    ];
    rails.push(...railSets[archetype]);
    if ([0,2,3,5,7].includes(archetype)) put(archetype===7?3:2,4,"POWERUP_CARRIER",0,[.72,.72,.82,.86,.75,.75,.72,.88][archetype] ?? .8);
    if (archetype === 2) {
      const enterRight = world % 2 === 1;
      if (enterRight) { addRail(8.2,5,6.45,4.08,23); addRail(5.95,4,4.95,3.38,20); }
      else { addRail(.8,5,2.55,4.08,23); addRail(3.05,4,4.05,3.38,20); }
    }
    addPickup(archetype===1?(world%2===0?1.5:7.5):archetype===2?(world%2?7.55:1.45):archetype===6?(world%2===0?1.35:7.65):4.5,[5.48,5.35,5.15,4.78,5.32,5.55,5.35,5.38,5.52][archetype],[1,1,1+Math.floor(world/8),1,2,2,2,2,2][archetype]);

    if(world===1){ if(stage>=2)put(1,2,"GLASS",0,.65); if(stage>=3)put(2,4,"ROUGH_STONE",0,.75); if(stage>=4)put(1,6,"POWERUP_CARRIER",0,.75); if(stage>=6)put(3,4,"NORMAL_ONE_HIT",0,.55); }
    if(world===2){ put(1,2,"ARMORED_TWO_HIT"); if(stage>=3)put(2,6,"TRANSPARENT_SLOW_PASS_THROUGH",0,.7); if(stage>=4)put(3,2,"LIGHTNING_SPEED_PASS_THROUGH",0,.7); if(stage>=5)put(1,6,"ARMORED_THREE_HIT",0,1.05); if(stage>=6)put(2,4,"POWERUP_CARRIER",0,.85); }
    if(world===3){ put(1,1,"MOVING_HORIZONTAL",0,.85); if(stage>=3)put(3,7,"MOVING_VERTICAL",0,.85); if(stage>=4)put(2,4,"REGENERATING",0,1.1); if(stage>=6)put(1,6,"ROUGH_STONE",0,.85); }
    if(world===4){ put(1,4,"STONE_GRAY",0,1.05); if(stage>=3)put(3,2,"EXPLOSIVE",0,.82); if(stage>=4)put(3,6,"EXPLOSIVE",0,.82); if(stage>=6)put(2,4,"REGENERATING",0,1.15); }
    if(world===5){ const g=500+stage; if(stage>=2){putSeed(1,3,"SWITCH",{groupId:g,scale:.7,countsForClear:false});put(2,5,"GHOST",g);} if(stage>=5){putSeed(3,3,"SWITCH",{groupId:g+20,scale:.7,countsForClear:false});put(3,6,"GHOST",g+20,1.05);} }
    if(world===6){ const g=600+stage; if(stage>=2){put(1,1,"KEY_BRICK",g,.72);put(2,7,"LOCKED",g,1.2);} if(stage>=5){put(3,1,"KEY_BRICK",g+20,.78);put(3,6,"LOCKED",g+20,1.3);} }
    if(world===7){ const g=700+stage; if(stage>=2){putSeed(1,1,"BLACK_HOLE_TELEPORTER",{groupId:g,countsForClear:false});putSeed(3,7,"BLACK_HOLE_TELEPORTER",{groupId:g,countsForClear:false});} if(stage>=4){put(2,2,"CHAIN_BRICK",7,.9);put(2,4,"CHAIN_BRICK",7,.9);put(2,6,"CHAIN_BRICK",7,.9);} if(stage>=6)putSeed(4,4,"SPIKED_HAZARD",{countsForClear:false,hazardKind:"SPIKED"}); }
    if(world===8){ if(stage>=2){putSeed(2,1,"INDESTRUCTIBLE",{countsForClear:false});putSeed(2,7,"INDESTRUCTIBLE",{countsForClear:false});} if(stage>=4)put(3,4,"REGENERATING",0,1.35); if(stage>=5)put(1,4,"MOVING_HORIZONTAL"); if(stage>=7)put(4,4,"ARMORED_DARK",0,1.35); }
    if(world===9){ const g=900+stage; if(stage>=2){putSeed(1,1,"BLACK_HOLE_TELEPORTER",{groupId:g,countsForClear:false});putSeed(3,7,"BLACK_HOLE_TELEPORTER",{groupId:g,countsForClear:false});} if(stage>=4){const s=920+stage;putSeed(1,3,"SWITCH",{groupId:s,scale:.75,countsForClear:false});put(2,5,"GHOST",s,1.15);} if(stage>=6)putSeed(4,4,"SPIKED_HAZARD",{countsForClear:false,hazardKind:"LASER"}); }
    if(stage>=8){ if(grid[6][0])grid[6][0]!.shape="TRIANGLE_SW"; if(grid[6][8])grid[6][8]!.shape="TRIANGLE_SE"; addRail(.75,6.3,2.35,5.45,23,stage>=9); addRail(8.25,6.3,6.65,5.45,23,stage>=9); }
    const nodeX=1.4+mod(world*2+stage*3,7); const nodeTypes: Partial<Record<number,EditorPickup["type"]>>={2:"SPEED",3:"CROWN",4:"MYSTERY",5:"COINS",6:"STAR",7:"SHIELD"}; if(nodeTypes[stage]) addPickup(nodeX,stage===2?5.28:stage===3?5.35:stage===4?5.2:stage===5?5.05:stage===6?5.55:5.45,stage===5?1+Math.floor(world/3):1,nodeTypes[stage]);
    if ([3,6,9].includes(world) && stage === 6) {
      [[0,2],[0,6],[2,2],[2,6]].forEach(([r,c])=>put(r,c,"RANDOM_INVENTORY_POWERUP",0,.64));
      addPickup(4.5,5.65,3);
    }
    const scales=world<=2?[.82,1,1.12]:world<=5?[.86,1.02,1.16]:world<=8?[.9,1.06,1.2,1.3]:[.94,1.08,1.22,1.34];
    grid.forEach((row,r)=>row.forEach((seed,c)=>{if(seed&&formationPalette.includes(seed.type)&&seed.scale===1)seed.scale=scales[mod(r*3+c*5+world+stage,scales.length)];}));
  }

  // The reference geometry is the final stage silhouette. World mechanics and boss
  // bricks may change materials, HP and behavior, but they cannot fill its empty space.
  const specialSeeds = grid.flatMap((row, rowIndex) => row.flatMap((seed, columnIndex) =>
    seed && !material.includes(seed.type) ? [{ row: rowIndex, column: columnIndex, seed }] : []
  ));
  const formationShape = (character: string): VolleyShape => character === "#" ? "RECTANGLE" : shapes[character] ?? "RECTANGLE";

  formation.rows.forEach((line, row) => [...line].forEach((character, column) => {
    if (character === ".") {
      grid[row][column] = null;
      return;
    }
    if (!grid[row][column]) put(row, column, formationType(row, column));
    else if (material.includes(grid[row][column]!.type)) {
      const previous = grid[row][column]!;
      put(row, column, formationType(row, column), previous.groupId, previous.scale);
      grid[row][column]!.countsForClear = previous.countsForClear;
      grid[row][column]!.shieldLock = previous.shieldLock;
      grid[row][column]!.hazardKind = previous.hazardKind;
    }
    if (grid[row][column]) grid[row][column]!.shape = formationShape(character);
  }));

  const occupiedFormationCells = formation.rows.flatMap((line, row) => [...line].flatMap((character, column) =>
    character === "." ? [] : [{ row, column, character }]
  ));
  const retainedSpecials = new Set(grid.flat().filter((seed): seed is NonNullable<typeof seed> => Boolean(seed && !material.includes(seed.type))));
  const reservedCells = new Set(occupiedFormationCells.flatMap(({ row, column }) => {
    const seed = grid[row][column];
    return seed && !material.includes(seed.type) ? [`${row}:${column}`] : [];
  }));

  specialSeeds.filter(({ seed }) => !retainedSpecials.has(seed)).forEach(({ row, column, seed }) => {
    const target = occupiedFormationCells
      .filter(cell => !reservedCells.has(`${cell.row}:${cell.column}`))
      .sort((a, b) => (Math.abs(a.row - row) + Math.abs(a.column - column)) - (Math.abs(b.row - row) + Math.abs(b.column - column)))[0];
    if (!target) return;
    grid[target.row][target.column] = { ...seed, shape: formationShape(target.character) };
    reservedCells.add(`${target.row}:${target.column}`);
  });

  // Formation previews are compared to the supplied layouts, so keep the playfield free of synthetic rails.
  rails.length = 0;
  const sourceCells = grid.map(row => row.map(seed => {
    if (!seed) return null;
    const scaled = Math.max(1, Math.min(30, Math.round(baseHp * seed.scale)));
    let hp = scaled;
    if (oneHit.has(seed.type)) hp = 1;
    if (seed.type === "ARMORED_TWO_HIT") hp = Math.max(2, Math.round(2 * seed.scale));
    if (seed.type === "ARMORED_THREE_HIT") hp = Math.max(3, Math.round(3 * seed.scale));
    if (seed.type === "BOSS_CORE") hp = Math.max(40, Math.round(Math.max(1, Math.round(baseHp * seed.scale)) * 1.9));
    if (seed.type === "REGENERATING") hp = Math.max(2, scaled);
    if (unbreakable.has(seed.type)) hp = 999;
    return { type: seed.type, hp, shape: seed.shape, groupId: seed.groupId, countsForClear: seed.countsForClear ?? !nonObjectives.has(seed.type), shieldLock: seed.shieldLock, hazardKind: seed.hazardKind };
  }));
  const cells: Array<Array<EditorBrick | null>> = Array.from({ length: EDITOR_ROWS }, () => Array(EDITOR_COLUMNS).fill(null));
  sourceCells.forEach((row, rowIndex) => {
    cells[rowIndex] = Array.from({ length: EDITOR_COLUMNS }, (_, columnIndex) => {
      const sourceColumn = Math.round(columnIndex * (row.length - 1) / (EDITOR_COLUMNS - 1));
      const brick = row[sourceColumn];
      return brick ? { ...brick } : null;
    });
  });
  const folder = folderNames[world - 1];
  const image = imageNumbers[world - 1][stage - 1];
  return {
    format: "brick-breaker-ball-volley-stage", version: 1, world, stage,
    name: `${EDITOR_WORLDS[world - 1].en} • ${bossStage ? "CORE" : labels[(stage - 1) % labels.length]}`,
    rows: EDITOR_ROWS, columns: EDITOR_COLUMNS,
    backgroundAsset: `/game/volley-world/${folder}/${image}.jpg`,
    spritesheetAsset: `/game/volley-world/${folder}/spritesheet.png`,
    atlasAsset: `/game/volley-world/${folder}/atlas.json`,
    expectedSourceSheet: expectedSourceSheets[world - 1],
    cannonAsset: `/game/volley-world/${folder}/${cannonFiles[world - 1]}`,
    referenceAsset: formation.reference,
    baseHp, startingBalls, bossStage, cells, rails, pickups,
  };
}

export function cloneStage(stage: EditorStage): EditorStage {
  return JSON.parse(JSON.stringify(stage)) as EditorStage;
}
