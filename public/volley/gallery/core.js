"use strict";
const gallery = window.VolleyGallery.catalog;
const stages = gallery.stages,
  $ = (id) => document.getElementById(id),
  NS = "http://www.w3.org/2000/svg";
const worldNames = [
  "",
  "Mystery Forest",
  "Venom Wilds",
  "Aqua Vortex",
  "Desert Spirits",
  "Ice Grave",
  "Tormented Souls",
  "Moon Light",
  "Infernal Gates",
  "Final Eclipse",
];
const regular = new Set(["GRASS", "SAND", "ICE", "BLACK", "BLOCKER", "SLIDER"]);
const descriptions = {
  SUICIDE:
    "10 direct hits. On destruction, four lethal beams target its row and column. Bosses are excluded.",
  DYNAMITE:
    "10 direct hits. Destroys the linked bomb stones in the same group.",
  PROTECTOR:
    "Casts its authored protection amount on nearby BLACK-role enemies at the end of a volley.",
  ICE_FREEZE:
    "Freezes nearby ICE-role enemies until their freeze is broken or cleared.",
  TORCH:
    "Ignites touching balls. Authored moving torches wait three idle seconds and slide for one second within their range.",
  ROTATING:
    "Turns to a random 30-degree angle after a volley. Sprite and swept collider rotate together.",
  BURN: "Consumes its authored number of touching balls, then goes out. Remaining charges survive Pause / Resume.",
  BOSS: "The world boss waits beyond the formation. Break every skull lock before damaging it. Remaining objectives must still be cleared.",
  BOSS_GUARD: "Skull lock protecting the boss. Break all locks to expose it: 2 in worlds 1-3, 3 in worlds 4-6, 4 in worlds 7-9.",
  VORTEX: "Periodic capture area; captured balls are removed.",
  TELEPORT: "Paired portal. The stage contains two portals.",
  SPIKE_TRAP: "Removes a ball when active; has a cooldown.",
  SLIDER: "Moves during board descent according to its authored displacement.",
  BONUS_BALLS: "A hit counter grants extra balls.",
  BONUS_DAMAGE: "A hit counter raises attack for this run.",
};
let current = 1,
  selected = null,
  currentStage = null;
