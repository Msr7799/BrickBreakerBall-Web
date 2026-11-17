"use strict";
/* Exact source-scene placement tests: no invented replacements or Android writes. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../public/volley");
const index=JSON.parse(fs.readFileSync(path.join(root,"stage-gallery-data.json"),"utf8"));
function node(tag) {
  return {tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=v;},
    append(...v){this.children.push(...v);},replaceChildren(){this.children=[];}};
}
const ui={
  "rpg-preview-enabled":{checked:false},
  "rpg-preview-detail":{replaceChildren(){},append(){}},
  "rpg-preview-status":{textContent:""},
};
const context={
  window:{},currentStage:null,console,render:()=>{},
  document:{createElementNS:node,createElement:node,
    getElementById:id=>ui[id]||null,querySelectorAll:()=>[]}
};
vm.runInNewContext(fs.readFileSync(path.join(root,"gallery/rpg-brick-lab.js"),"utf8"),context);
const lab=context.window.RpgBrickLab;
assert.ok(lab,"RPG stage art library must boot");
assert.equal(lab.isEnabled(),false,"Original RPG stage must be default");
assert.equal(lab.library.length,10);
assert.equal(new Set(lab.library.map(x=>x.id)).size,10);
// Source has 1672 GRASS_D and 1372 SAND_D. Existing boss guard/core overlays
// replace 2 grass at stage 18, 1 grass at stage 36,
// 2 sand at stage 54, and 3 sand at stage 72.
const expected={
  RAINBOW:0,SPIKE_TRAP:67,CLOUD:0,CHEST:0,FIREWALL:0,
  ALT_WOOD:178,ALT_RUST:80,GRASS_D:1669,ICE_D:1037,SAND_D:1367
};
const actual=Object.fromEntries(lab.library.map(x=>[x.id,0]));
const byStage={};
let stages=0,allBricks=0,bosses=0;
for(const entry of lab.library){
  assert.ok(entry.scene.startsWith("Enemies/")&&entry.scene.endsWith(".tscn"));
  assert.ok(lab.artwork(entry.id).children.length>=2);
}
for(const row of index.stages){
  const file=fs.readFileSync(path.join(root,row.file),"utf8").replace(/\r\n/g,"\n");
  const stage=JSON.parse(file.slice("window.VolleyGallery.registerStage(".length,-3));
  context.currentStage=stage;
  const sourceSnapshot=JSON.stringify(stage.bricks);
  byStage[stage.id]={};
  for(const item of lab.library){
    const ids=Array.from(lab.candidates(stage,item.id));
    const matches=stage.bricks.filter(b=>b.sourceScene==="res://"+item.scene).map(b=>b.id);
    assert.deepEqual(ids,matches,"Exact authored scene reference "+stage.id+" "+item.id);
    assert.equal(new Set(ids).size,ids.length);
    actual[item.id]+=ids.length;
    byStage[stage.id][item.id]=ids.length;
    lab.select(item.id);
    lab.refresh(stage);
    for(const id of ids){
      const b=stage.bricks.find(x=>x.id===id);
      assert.ok(b,"Missing source brick");
      assert.ok(!b.shieldLock,"Never replace a boss guard");
      const g=node("g");lab.decorateBrick(g,b,0);
      assert.equal(g.children.length,1,"Only one art study at source position");
    }
    const nonSource=stage.bricks.find(b=>!ids.includes(b.id));
    if(nonSource){
      const g=node("g");lab.decorateBrick(g,nonSource,0);
      assert.equal(g.children.length,0,"No random replacement allowed");
    }
  }
  assert.equal(JSON.stringify(stage.bricks),sourceSnapshot,"Source stage mutated");
  stages++;allBricks+=stage.bricks.length;
  if(stage.boss)bosses++;
}
assert.deepEqual(actual,expected,"RPG scene counts excluding world-boss replacements");
assert.equal(byStage[18].GRASS_D,68);
assert.equal(byStage[36].GRASS_D,18);
assert.equal(byStage[54].SAND_D,32);
assert.equal(byStage[72].SAND_D,62);
assert.equal(byStage[2].SPIKE_TRAP,3);
assert.equal(byStage[5].SPIKE_TRAP,5);
assert.equal(byStage[5].ALT_WOOD,1);
assert.equal(byStage[42].ALT_RUST,1);
assert.equal(byStage[3].RAINBOW,0);
assert.equal(byStage[3].SPIKE_TRAP,0);
assert.equal(stages,160);
assert.equal(bosses,9);
assert.equal(allBricks,index.totalActiveBricks);
const html=fs.readFileSync(path.join(root,"stage-gallery.html"),"utf8");
assert.ok(!html.includes('id="rpg-preview-enabled" type="checkbox" checked'));
console.log("RPG_SCENE_PLACEMENTS_OK:",stages,"stages,",bosses,"bosses;",
  JSON.stringify(actual),";",allBricks,"unchanged authored pieces");
