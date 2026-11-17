"use strict";
/* Full campaign visual adjacency regression; does not alter authored stage files. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const GrassSeams = require("../public/volley/gallery/grass-seams.js");

const publicRoot = path.resolve(__dirname, "../public/volley");
const index = JSON.parse(fs.readFileSync(path.join(publicRoot,"stage-gallery-data.json"),"utf8"));
const image = {width:256,height:320};
let stages=0,trimmed=0,outer=0,untouched=0,stage3=null;
for (const row of index.stages) {
  const source=fs.readFileSync(path.join(publicRoot,row.file),"utf8").replace(/\r\n/g,"\n");
  const stage=JSON.parse(source.slice("window.VolleyGallery.registerStage(".length,-3));
  const before=JSON.stringify(stage.bricks);
  for(const brick of stage.bricks) {
    const layer=brick.layers[0];
    if(!GrassSeams.isEligibleImage(brick,layer)){
      if (!GrassSeams.isGrassSquare(brick))
        assert.equal(GrassSeams.joinsBelow(brick,stage.bricks),false);
      untouched++;
      continue;
    }
    const frame=GrassSeams.visualFrame(brick,layer,stage.bricks,image);
    assert.equal(frame.height,layer.height*(frame.trim?0.8:1));
    assert.equal(frame.viewBox,"0 0 256 "+(320*(frame.trim?0.8:1)));
    if(frame.trim)trimmed++;else outer++;
    if(stage.id===3) {
      stage3 ||= {trimmed:0,edge:0};
      stage3[frame.trim?"trimmed":"edge"]++;
    }
  }
  assert.equal(JSON.stringify(stage.bricks),before,"Stage data mutated");
  stages++;
}
assert.equal(stages,160);
assert.ok(trimmed>100,"All worlds should contain connected square sprites");
assert.ok(outer>100,"Open bottom edges must retain original soil");
assert.ok(stage3?.trimmed>4,"Stage 3 should have connected squares with no brown seams");
assert.ok(stage3?.edge>4,"Stage 3 should retain brown at exposed bottom edges");
const upper={id:1,kind:"GRASS",shape:"SQ",x:0,y:80,w:80,h:80,health:12};
const lower={id:2,kind:"GRASS",shape:"SQ",x:0,y:0,w:80,h:80,health:12};
assert.equal(GrassSeams.joinsBelow(upper,[upper,lower]),true);
assert.equal(GrassSeams.joinsBelow(upper,[upper,{...lower,kind:"SAND"}]),false);
assert.equal(GrassSeams.joinsBelow(upper,[upper,{...lower,shape:"SE"}]),false);
assert.equal(GrassSeams.joinsBelow(upper,[upper,{...lower,shape:"NW"}]),true);
const sourceLayer={path:"volley-source/bricks/Enemies/Grass/Enemy_Grass_256x320_2x2_block_SQ.png",width:80,height:100};
assert.equal(GrassSeams.isEligibleImage(upper,sourceLayer),true);
assert.equal(GrassSeams.visualFrame(upper,sourceLayer,[upper,lower],image).height,80);
assert.equal(GrassSeams.visualFrame(upper,sourceLayer,[upper],image).height,100);
const svg={
  attrs:{"data-trimmed":"true","data-source-width":"256","data-source-height":"320","data-full-height":"100"},
  getAttribute(key){return this.attrs[key];},
  setAttribute(key,value){this.attrs[key]=String(value);}
};
const nodes=new Map([[1,{node:{querySelector:(s)=>s===".grass-square-sprite"?svg:null}}]]);
GrassSeams.syncLive(nodes,[upper,{...lower,health:0}]);
assert.equal(svg.attrs["data-trimmed"],"false","Exposed soil must return when lower square breaks");
assert.equal(svg.attrs.height,"100");
assert.equal(svg.attrs.viewBox,"0 0 256 320");
GrassSeams.syncLive(nodes,[upper,lower]);
assert.equal(svg.attrs["data-trimmed"],"true","Grass should cover internal seam while neighbour lives");
assert.equal(svg.attrs.height,"80");
assert.equal(svg.attrs.viewBox,"0 0 256 256");
console.log("GRASS_SEAMS_OK:",stages,"stages,",trimmed,
  "internal seamless square images,",outer,"bottom-edge images,",
  untouched,"other tiles unaffected, stage3:",JSON.stringify(stage3));
