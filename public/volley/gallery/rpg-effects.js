"use strict";
/**
 * Recovered source mechanics only (no reference art, stage mutations or saves).
 * Source: Godot Spike_Traps/enemy_spike_trap_2x_2.gd and
 * Vortex/{Rock1_Vortex,Ice1_Vortex,Black1_vortex} scripts.
 * Time is in foreground seconds, independent of ball physics fast-forward.
 */
(function (root) {
  const SPIKE_START_DELAY = .1;
  const SPIKE_REARM = 10;
  const SPIKE_SHOW = .2;
  const SPIKE_HIDE = .2;
  const VORTEX_ABSORB = .4;
  const clamp = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  function vortexCycle(scene) {
    if (typeof scene === "string" && scene.includes("/Black1_vortex/"))
      return {active:4, inactive:2.5};
    if (typeof scene === "string" && scene.includes("/Ice1_Vortex/"))
      return {active:3, inactive:3};
    return {active:2, inactive:4}; // Rock1_Vortex
  }
  function vortexActive(scene,elapsed) {
    const cycle=vortexCycle(scene);
    const period=cycle.active+cycle.inactive;
    return ((elapsed % period)+period)%period < cycle.active;
  }
  function spikeArmed(cooldown,elapsed) {
    return elapsed >= SPIKE_START_DELAY && cooldown <= 0;
  }
  function spikeVisualStrength(cooldown,elapsed) {
    if(elapsed < SPIKE_START_DELAY)return 0;
    if(cooldown <= 0)return clamp((elapsed - SPIKE_START_DELAY)/SPIKE_SHOW,0,1);
    if(cooldown > SPIKE_REARM-SPIKE_HIDE)
      return clamp((cooldown-(SPIKE_REARM-SPIKE_HIDE))/SPIKE_HIDE,0,1);
    if(cooldown < SPIKE_SHOW)return clamp(1-cooldown/SPIKE_SHOW,0,1);
    return 0;
  }
  const rules={SPIKE_START_DELAY,SPIKE_REARM,SPIKE_SHOW,SPIKE_HIDE,
    VORTEX_ABSORB,vortexCycle,vortexActive,spikeArmed,spikeVisualStrength};
  if(typeof module === "object" && module.exports)module.exports=rules;
  else root.RpgSourceEffects=rules;
})(globalThis);
