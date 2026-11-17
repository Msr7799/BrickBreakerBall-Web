"use strict";
/* Visual-only RPG sprite study: original SVG drawings, never Godot textures or saved gameplay. */
(function () {
  const NS="http://www.w3.org/2000/svg";
  const defs=[
    ["RAINBOW","Rainbow","NEW","Enemies/Rainbow/enemy_rainbow_2x2.tscn","Four color states with source HP multipliers 5/3/2/1.","#53c7f1","#c77dfa"],
    ["SPIKE_TRAP","Spike Trap","EXISTS; ART GAP","Enemies/Spike_Traps/enemy_spike_trap_2x2.tscn","Existing campaign trap. Original rearms after 10 seconds.","#9db5ca","#fc6473"],
    ["CLOUD","Cloud","NEW","Enemies/Cloud/enemy_cloud_2x2.tscn","Non-damageable cloud obstacle. Gameplay is not ported.","#5399c4","#e8f8ff"],
    ["CHEST","Treasure Chest","NEW","Enemies/Chest/enemy_chest_1.tscn","Damageable chest; source gem/gold reward methods are placeholders.","#865126","#f4cb72"],
    ["FIREWALL","Firewall Bonus","TRAINING ONLY","Enemies/Bonus/enemy_bonus_firewall_2x2.tscn","Five hits release a fire-wall spell in the source training stage.","#b84026","#ffca6c"],
    ["ALT_WOOD","Wood Gate","PARTIAL","Enemies/Blocker/Alt_Blocker/enemy_wooden_alt_blocker_2x2.tscn","Opens/closes and toggles vulnerability.","#765023","#d8ad66"],
    ["ALT_RUST","Rust Gate","PARTIAL","Enemies/Blocker/Alt_Blocker/enemy_rust_alt_blocker_2x2.tscn","Steel gate with alternating damage immunity.","#826047","#d0a07b"],
    ["GRASS_D","Tough Grass","FOLDED VARIANT","Enemies/Grass_D/enemy_grassd_2x2.tscn","RPG higher-health grass material variant.","#2f7849","#b9ed8c"],
    ["ICE_D","Tough Ice","FOLDED VARIANT","Enemies/Ice_D/enemy_iced_2x2.tscn","RPG higher-health frozen material variant.","#409bd5","#d4faff"],
    ["SAND_D","Tough Sand","FOLDED VARIANT","Enemies/Sand_D/enemy_sandd_2x2.tscn","RPG higher-health desert material variant.","#a6783c","#ffe3a0"]
  ];
  const library=defs.map(d=>({id:d[0],name:d[1],status:d[2],scene:d[3],description:d[4],color:d[5],light:d[6]}));
  const map=new Map(library.map(x=>[x.id,x]));
  let chosen="RAINBOW",enabled=false,sampleStage=-1,sampleIds=new Set(),counter=0;
  function el(tag,attrs={},text) {
    const n=document.createElementNS(NS,tag);
    for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));
    if(text!==undefined)n.textContent=text;
    return n;
  }
  const points={SQ:"0,0 64,0 64,64 0,64",NW:"0,0 64,0 0,64",NE:"0,0 64,0 64,64",SW:"0,0 0,64 64,64",SE:"64,0 0,64 64,64"};
  function artwork(kind,shape="SQ") {
    const entry=map.get(kind);if(!entry)return el("g");
    const uid="rpg-preview-"+(counter++),root=el("g",{class:"rpg-tile-art","pointer-events":"none"});
    const d=el("defs"),grad=el("linearGradient",{id:uid+"g",x1:"0",y1:"0",x2:"1",y2:"1"});
    grad.append(el("stop",{offset:"0%","stop-color":entry.light}),el("stop",{offset:"50%","stop-color":entry.color}),el("stop",{offset:"100%","stop-color":"#192b40"}));
    const clip=el("clipPath",{id:uid+"c"});clip.append(el("polygon",{points:points[shape]||points.SQ}));d.append(grad,clip);root.append(d);
    const g=el("g",{"clip-path":"url(#"+uid+"c)"});
    const rect=(x,y,w,h,fill,extra={})=>g.append(el("rect",{x,y,width:w,height:h,fill,...extra}));
    const line=(a,b,c,d,color="#ffffff",width=2)=>g.append(el("path",{d:"M"+a+" "+b+"L"+c+" "+d,stroke:color,"stroke-width":width,"stroke-linecap":"round"}));
    const poly=(p,fill,stroke="#ffffff")=>g.append(el("polygon",{points:p,fill,stroke,"stroke-width":"1.5","stroke-linejoin":"round"}));
    const circle=(x,y,r,fill)=>g.append(el("circle",{cx:x,cy:y,r,fill}));
    rect(0,0,64,64,"url(#"+uid+"g)");rect(3,3,58,58,"none",{stroke:entry.light,"stroke-width":2,rx:4});
    poly("5,6 59,6 52,14 12,14","#ffffff22","none");
    if(kind==="RAINBOW") {
      ["#5ad7f5","#77dd88","#ffe27a","#cb98ff"].forEach((c,i)=>rect(7+i*13,13,12,39,c,{rx:2}));
      poly("32,12 51,32 32,52 13,32","#e9faff","#506ca2");poly("32,21 42,32 32,43 22,32","#a6ecff");
    }else if(kind==="SPIKE_TRAP") {
      rect(9,19,46,35,"#293a4a",{stroke:"#b7d6e8","stroke-width":2,rx:4});
      [14,27,40,53].forEach(x=>poly((x-6)+",19 "+x+",2 "+(x+6)+",19","#dce9f2","#547085"));
      [17,32,47].forEach(x=>poly((x-6)+",51 "+x+",62 "+(x+6)+",51","#c2dbe6","#4b6170"));
      circle(32,35,8,"#d94358");line(26,35,38,35,"#fff",2);
    }else if(kind==="CLOUD") {
      [[17,39,12],[29,30,17],[46,38,14],[34,45,13]].forEach(v=>circle(v[0],v[1],v[2],"#edfbff"));
      line(13,54,54,54,"#77b9db",3);line(21,60,47,60,"#b8edff",2);
    }else if(kind==="CHEST") {
      rect(10,27,44,28,"#69401d",{stroke:"#fbd58a","stroke-width":3,rx:4});
      poly("10,28 15,13 48,13 54,28","#98602f","#f7d178");
      [17,46].forEach(x=>rect(x,18,5,36,"#eec06a"));
      rect(27,31,11,16,"#f9da8a",{rx:2});circle(32,38,2.5,"#426c55");
    }else if(kind==="FIREWALL") {
      poly("9,53 18,20 26,29 35,8 44,28 51,21 57,53","#ffb252","#943827");
      poly("18,53 27,31 34,39 42,22 48,53","#ff6234","#ffe0a3");poly("28,53 34,42 41,53","#fff3b0");
    }else if(kind==="ALT_WOOD"||kind==="ALT_RUST") {
      [11,23,35,47].forEach((x,i)=>rect(x,9,10,47,kind==="ALT_WOOD"?(i%2?"#78471f":"#b78b4f"):(i%2?"#755345":"#b78868"),{stroke:entry.light,"stroke-width":1,rx:1}));
      rect(8,18,48,5,"#3b3025");rect(8,45,48,5,"#3b3025");rect(40,27,14,11,entry.light,{rx:2});
      [16,46].forEach(x=>{circle(x,20,2,"#e7d39f");circle(x,47,2,"#e7d39f")});
    }else if(kind==="GRASS_D") {
      [11,23,35,47].forEach(x=>{line(x,53,x+5,17,"#b9ec8c",3);line(x+5,28,x+14,20,"#81bc72",2)});
      poly("7,50 17,41 28,52 42,42 57,50 57,59 7,59","#367549","#b7ed93");
    }else if(kind==="ICE_D") {
      poly("32,6 54,24 53,45 32,59 11,45 10,23","#c2f2ff","#eaffff");
      poly("32,15 45,32 32,49 18,32","#79c9f5","#ffffff");
      line(11,23,53,45,"#fff",2);line(52,24,11,45,"#fff",2);
    }else if(kind==="SAND_D") {
      poly("10,45 21,19 45,19 55,45 44,57 19,56","#e4aa60","#ffe6b0");
      poly("32,24 45,40 32,51 19,40","#ad773d","#fbe0a5");
      circle(32,40,4,"#fff2b9");
    }
    root.append(g,el("polygon",{points:points[shape]||points.SQ,fill:"none",stroke:entry.light,"stroke-width":2,"vector-effect":"non-scaling-stroke"}));
    return root;
  }
  // RPG source scene is authoritative: only preview original level placements.
  // No sampled substitutions, no invented Rainbow / Cloud in stages 1–160.
  function candidates(stage, kind=chosen) {
    const entry = map.get(kind);
    if(!stage || !entry) return [];
    const source = "res://" + entry.scene;
    return stage.bricks.filter(b=>b.sourceScene === source && !b.suppressedByWorldBoss)
      .map(b=>b.id);
  }
  function refresh(stage) {
    if(!stage){sampleStage=-1;sampleIds=new Set();return;}
    if(stage.id===sampleStage)return;
    sampleStage=stage.id;sampleIds=new Set(candidates(stage));
  }
  function decorateBrick(group,brick,dy) {
    if(!enabled||!currentStage)return;
    refresh(currentStage);
    if(!sampleIds.has(brick.id))return;
    const g=el("g",{class:"rpg-preview-on-stage",transform:"translate("+brick.x+" "+(1720-brick.y-brick.h+dy)+") scale("+(brick.w/64)+" "+(brick.h/64)+")","pointer-events":"none"});
    g.append(artwork(chosen,brick.shape));group.append(g);
  }
  function updateStatus(){
    const out=document.getElementById("rpg-preview-status");
    if(!out)return;
    refresh(typeof currentStage!=="undefined"?currentStage:null);
    const t=map.get(chosen);
    out.textContent=enabled
      ? t.name+" — "+t.status+": "+sampleIds.size+
        (sampleIds.size === 0 ? " original placements in this stage. No substitute bricks inserted." :
        " exact source placement(s)"+(currentStage?" in stage "+currentStage.id:"")+
        ". HP, collider and stage positions unchanged.")
      : "Original stage view restored. Select a brick to preview only at its actual RPG positions.";
  }
  function choose(kind, activate=true){
    chosen=kind;
    sampleStage=-1; // switch preview type even when stage ID is unchanged
    // A prototype must never appear inside the recovered campaign by default.
    if (activate) enabled=true;
    document.getElementById("rpg-preview-enabled").checked=enabled;
    document.querySelectorAll(".rpg-brick-option").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.kind===kind)));
    const info=map.get(kind),d=document.getElementById("rpg-preview-detail");
    d.replaceChildren();
    const head=document.createElement("strong");head.textContent=info.name+" · "+info.status;
    const p=document.createElement("p");p.textContent=info.description;
    const source=document.createElement("small");source.textContent="RPG reference: "+info.scene+" | Artwork: original SVG prototype";
    d.append(head,p,source);
    if(typeof playtest!=="undefined"&&playtest.active)playtest.stop();
    if(currentStage)render();updateStatus();
  }
  function init(){
    const list=document.getElementById("rpg-brick-library");if(!list)return;
    for(const t of library){
      const b=document.createElement("button");b.type="button";b.className="rpg-brick-option";b.dataset.kind=t.id;
      const icon=el("svg",{width:48,height:48,viewBox:"0 0 64 64","aria-hidden":"true"});icon.append(artwork(t.id));b.append(icon);
      const text=document.createElement("span");
      const title=document.createElement("strong");title.textContent=t.name;
      const small=document.createElement("small");small.textContent=t.status;
      text.append(title,small);b.append(text);
      b.addEventListener("click",()=>choose(t.id));list.append(b);
    }
    document.getElementById("rpg-preview-enabled").addEventListener("change",e=>{
      enabled=e.target.checked;if(currentStage)render();updateStatus();
    });
    document.getElementById("rpg-preview-clear").addEventListener("click",()=>{
      enabled=false;document.getElementById("rpg-preview-enabled").checked=false;
      if(currentStage)render();updateStatus();
    });
    choose("RAINBOW",false);
  }
  window.RpgBrickLab={library,artwork,decorateBrick,refresh,status:updateStatus,candidates,select:choose,
    getSelected:()=>chosen,isEnabled:()=>enabled};
  init();
})();