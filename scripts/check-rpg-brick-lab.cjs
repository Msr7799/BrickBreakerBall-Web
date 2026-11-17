"use strict";
/* No browser/Android binary required: fake SVG DOM and immutable source-stage data. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../public/volley");
const index=JSON.parse(fs.readFileSync(path.join(root,"stage-gallery-data.json"),"utf8"));
function node(tag){
  return {tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=v;},
    append(...v){this.children.push(...v);}};
}
const ui = {
  "rpg-preview-enabled": {checked: false},
  "rpg-preview-detail": {replaceChildren(){},append(){}},
  "rpg-preview-status": {textContent:""},
};
const context={
  window:{},currentStage:null,console,
  document:{createElementNS:node,createElement:node,
    getElementById:(id)=>ui[id]||null,querySelectorAll:()=>[]}
};
vm.runInNewContext(fs.readFileSync(path.join(root,"gallery/rpg-brick-lab.js"),"utf8"),context);
const lib=context.window.RpgBrickLab;
assert.ok(lib,"RPG prototype library must boot");
assert.equal(lib.isEnabled(),false,"Prototype is OFF by default; first campaign stages are original");
const untouched=node("g");
lib.decorateBrick(untouched,{id:1,kind:"GRASS",shape:"SQ",x:10,y:10,w:80,h:80},0);
assert.equal(untouched.children.length,0,"Unselected visual prototypes must not overlay campaign");
lib.select("RAINBOW");
assert.equal(lib.isEnabled(),true,"Explicit choice should enable preview");

assert.equal(lib.library.length,10);
assert.equal(new Set(lib.library.map(x=>x.id)).size,10);
assert.ok(lib.library.some(x=>x.id==="SPIKE_TRAP"&&x.status.includes("EXISTS")));
assert.ok(lib.library.some(x=>x.id==="RAINBOW"&&x.status==="NEW"));
for(const info of lib.library){
  assert.ok(info.scene.startsWith("Enemies/")&&info.scene.endsWith(".tscn"));
  const art=lib.artwork(info.id);
  assert.ok(art.children.length>=2,info.id);
}
let stages=0,totalBricks=0,bosses=0,withPrototypeSlots=0;
for(const row of index.stages){
  const script=fs.readFileSync(path.join(root,row.file),"utf8").replace(/\r\n/g,"\n");
  const stage=JSON.parse(script.slice("window.VolleyGallery.registerStage(".length,-3));
  context.currentStage=stage;
  lib.refresh(stage);
  const snapshot=JSON.stringify(stage.bricks);
  const ids=Array.from(lib.candidates(stage));
  assert.ok(ids.length<=9);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){
    const b=stage.bricks.find(x=>x.id===id);
    assert.ok(b);
    assert.ok(["GRASS","SAND","ICE","BLACK","BLOCKER"].includes(b.kind));
    assert.ok(!b.shieldLock&&!b.gate&&!b.overlap);
    const el=node("g");
    lib.decorateBrick(el,b,0);
    assert.equal(el.children.length,1, "Selected prototype should draw precisely once");
  }
  assert.equal(JSON.stringify(stage.bricks),snapshot,"Stage mutated by visual preview");
  if(stage.boss){
    bosses++;
    assert.equal(stage.bricks.filter(b=>b.kind==="BOSS").length,1);
  }
  if(ids.length)withPrototypeSlots++;
  stages++;totalBricks+=stage.bricks.length;
}
assert.equal(stages,160);
assert.equal(bosses,9);
assert.equal(totalBricks,index.totalActiveBricks);
const html=fs.readFileSync(path.join(root,"stage-gallery.html"),"utf8");
for(const id of ["rpg-brick-library","rpg-preview-enabled","rpg-preview-clear",
  "rpg-preview-status","rpg-preview-detail"])
  assert.ok(html.includes('id="'+id+'"'),id+" must be mounted");
assert.ok(!html.includes('id="rpg-preview-enabled" type="checkbox" checked'),
  "Preview must be unchecked in HTML");
console.log("RPG_BRICK_VISUAL_PREVIEW_OK:",lib.library.length,"source variants,",stages,
  "stages,",bosses,"existing bosses,",totalBricks,"untouched pieces,",
  withPrototypeSlots,"stages with preview-safe positions");
