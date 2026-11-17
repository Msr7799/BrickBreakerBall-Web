"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Sandbox=require("../public/volley/gallery/play-engine.js");
const root=path.resolve(__dirname,"../public/volley");
const index=JSON.parse(fs.readFileSync(path.join(root,"stage-gallery-data.json"),"utf8"));
function load(id) {
  const entry=index.stages.find(x=>x.id===id);
  const js=fs.readFileSync(path.join(root,entry.file),"utf8").replace(/\r\n/g,"\n");
  return JSON.parse(js.slice("window.VolleyGallery.registerStage(".length,-3));
}
const cases=[
  {stage:5,kind:"enemy_wooden_alt_blocker_2x2.tscn"},
  {stage:8,kind:"enemy_wooden_alt_blocker_2x2.tscn"},
  {stage:42,kind:"enemy_rust_alt_blocker_2x2.tscn"},
  {stage:58,kind:"enemy_rust_alt_blocker_2x2.tscn"}
];
for(const t of cases){
  const stage=load(t.stage), before=JSON.stringify(stage.bricks);
  const s=new Sandbox(stage,{playerLevel:1,balls:10,hit:1});
  const gate=s.bricks.find(x=>x.sourceScene?.endsWith("/Alt_Blocker/"+t.kind));
  assert.ok(gate,"Missing original gate in level "+t.stage);
  assert.ok(Number.isFinite(gate.health),"Recovered gate has finite authored HP");
  const health=gate.health;
  assert.equal(s.turn,1,"Imported alternate gate must start open");
  s.applyDamage(gate,1);
  assert.equal(gate.health,health-1,"Open gate accepts damage");
  s.turn=2;
  s.applyDamage(gate,Math.min(5,gate.health),{fire:true,opening:true});
  assert.equal(gate.health,health-1,"Closed gate resists ALL damage sources");
  s.turn=3;
  s.applyDamage(gate,1);
  assert.equal(gate.health,health-2,"Gate reopens after next descent");
  assert.equal(JSON.stringify(stage.bricks),before,"No original stage data mutation");
}
console.log("RPG_ALTERNATE_GATES_OK:",cases.length,"level scenarios; original wooden/rust scenes, open/closed/save-turn parity");
