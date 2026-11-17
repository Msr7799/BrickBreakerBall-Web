"use strict";
// Compare the real RPG GDScript timing constants against the existing web sandbox.
// Does not alter campaign source stages, saves, accounts, coins or shop products.
const assert = require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const H=require("../public/volley/gallery/rpg-effects.js");
const Sandbox=require("../public/volley/gallery/play-engine.js");
const base=path.resolve(__dirname,"../public/volley");
const manifest=JSON.parse(fs.readFileSync(path.join(base,"stage-gallery-data.json"),"utf8"));
function load(n){
  const row=manifest.stages.find(s=>s.id===n);
  const text=fs.readFileSync(path.join(base,row.file),"utf8").replace(/\r\n/g,"\n");
  return JSON.parse(text.slice("window.VolleyGallery.registerStage(".length,-3));
}
assert.equal(H.SPIKE_START_DELAY,.1);
assert.equal(H.SPIKE_REARM,10);
assert.equal(H.SPIKE_SHOW,.2);
assert.equal(H.SPIKE_HIDE,.2);
assert.equal(H.VORTEX_ABSORB,.4);
assert.equal(H.spikeArmed(0,0),false);
assert.equal(H.spikeArmed(0,.099),false);
assert.equal(H.spikeArmed(0,.1),true);
assert.equal(H.spikeArmed(.01,10),false);
assert.equal(H.spikeArmed(0,10),true);
assert.equal(H.spikeVisualStrength(0,0),0);
assert.ok(Math.abs(H.spikeVisualStrength(0,.2)-.5)<.001);
assert.ok(Math.abs(H.spikeVisualStrength(0,.3)-1)<.001);
assert.ok(Math.abs(H.spikeVisualStrength(10,20)-1)<.001);
assert.ok(Math.abs(H.spikeVisualStrength(9.8,20))<.001);
assert.ok(Math.abs(H.spikeVisualStrength(.1,20)-.5)<.001);
const vortexScenes=[
  ["res://Enemies/Vortex/Rock1_Vortex/enemy_rock_vortex_2x2_SQ.tscn",2,4,2],
  ["res://Enemies/Vortex/Ice1_Vortex/enemy_ice_vortex_2x2_SQ.tscn",3,3,3],
  ["res://Enemies/Vortex/Black1_vortex/enemy_black_vortex_2x2_SQ.tscn",4,2.5,4]
];
for(const [scene,active,inactive,boundary] of vortexScenes){
  assert.deepEqual(H.vortexCycle(scene),{active,inactive});
  assert.equal(H.vortexActive(scene,0),true);
  assert.equal(H.vortexActive(scene,boundary-.01),true);
  assert.equal(H.vortexActive(scene,boundary),false);
  assert.equal(H.vortexActive(scene,active+inactive),true);
}
let spikes=0,rock=0,ice=0,black=0, stages=0, bosses=0, pieces=0;
for(const row of manifest.stages){
  const stage=load(row.id);
  assert.equal(stage.bricks.length,row.brickCount);
  for(const b of stage.bricks){
    if(b.kind==="SPIKE_TRAP"){spikes++;assert.ok(b.sourceScene.includes("/Spike_Traps/"));}
    if(b.kind==="VORTEX"){
      if(b.sourceScene.includes("/Rock1_Vortex/"))rock++;
      else if(b.sourceScene.includes("/Ice1_Vortex/"))ice++;
      else if(b.sourceScene.includes("/Black1_vortex/"))black++;
      else throw Error("Unknown source vortex scene "+b.sourceScene);
    }
  }
  pieces+=stage.bricks.length;stages++;if(stage.boss)bosses++;
}
assert.equal(spikes,67);assert.equal(rock,60);assert.equal(ice,11);assert.equal(black,18);
assert.equal(stages,160);assert.equal(bosses,9);assert.equal(pieces,manifest.totalActiveBricks);
const stage5=load(5),spike=stage5.bricks.find(x=>x.kind==="SPIKE_TRAP");
const engine=new Sandbox({...stage5,bricks:[spike],boss:false},{playerLevel:1,balls:10,hit:1});
assert.equal(engine.bricks.length,1);
engine.elapsed=.4;
const hazard=engine.bricks[0];
const hit={x:hazard.x+hazard.w*.5,y:hazard.y-hazard.h*.2,
  vx:0,vy:1278.4,radius:15,id:999,alive:true,last:-1,portal:0,fire:false};
engine.phase="firing";
engine.move(hit,.08);
assert.equal(hit.alive,false,"Armed spike kills ball");
assert.equal(hazard.spikeCooldown,10);
assert.equal(JSON.stringify(stage5.bricks),JSON.stringify(load(5).bricks),"Source stage untouched");
const html=fs.readFileSync(path.join(base,"stage-gallery.html"),"utf8");
assert.ok(html.includes("gallery/rpg-effects.js")&&html.includes("gallery/rpg-effects.css"));
const renderer=fs.readFileSync(path.join(base,"gallery/renderer.js"),"utf8");
for(const marker of ["rpg-spike-tines","rpg-vortex-rings","rpg-alt-shutters"])
  assert.ok(renderer.includes(marker),marker);
console.log("RPG_SOURCE_EFFECTS_OK:",stages,"stages, 9 bosses,",
  spikes,"spikes,",rock,"rock vortex,",ice,"ice vortex,",black,"black vortex;",
  "timings/visual hooks/active spike collision all checked");
