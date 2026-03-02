import type { CreatureTemplate, Move, Item, Area } from './types';

// ─── MOVES ───────────────────────────────────────────────────────────────────
export const MOVES: Record<string, Move> = {
  // Normal
  tackle: {
    id: 'tackle', name: 'Tackle', type: 'normal', power: 40, accuracy: 100,
    pp: 35, maxPp: 35, category: 'physical',
    description: 'A straightforward tackle with full body weight.',
  },
  scratch: {
    id: 'scratch', name: 'Scratch', type: 'normal', power: 40, accuracy: 100,
    pp: 35, maxPp: 35, category: 'physical',
    description: 'Rakes the foe with sharp claws.',
  },
  bite: {
    id: 'bite', name: 'Bite', type: 'normal', power: 60, accuracy: 100,
    pp: 25, maxPp: 25, category: 'physical',
    description: 'A vicious bite that may cause flinching.',
  },
  slam: {
    id: 'slam', name: 'Slam', type: 'normal', power: 80, accuracy: 75,
    pp: 20, maxPp: 20, category: 'physical',
    description: 'Slams the foe with a long tail or vines.',
  },

  // Fire
  ember: {
    id: 'ember', name: 'Ember', type: 'fire', power: 40, accuracy: 100,
    pp: 25, maxPp: 25, category: 'special',
    statusEffect: { type: 'burn', chance: 10 },
    description: 'A weak fire attack. May cause a burn.',
  },
  flameburst: {
    id: 'flameburst', name: 'Flame Burst', type: 'fire', power: 70, accuracy: 100,
    pp: 15, maxPp: 15, category: 'special',
    description: 'An explosive burst of fire that scorches the area.',
  },
  firespin: {
    id: 'firespin', name: 'Fire Spin', type: 'fire', power: 35, accuracy: 85,
    pp: 15, maxPp: 15, category: 'special',
    description: 'Traps the foe inside a whirling inferno.',
  },
  inferno: {
    id: 'inferno', name: 'Inferno', type: 'fire', power: 100, accuracy: 85,
    pp: 5, maxPp: 5, category: 'special',
    statusEffect: { type: 'burn', chance: 100 },
    description: 'A roaring inferno. Always causes a burn.',
  },

  // Water
  watergun: {
    id: 'watergun', name: 'Water Gun', type: 'water', power: 40, accuracy: 100,
    pp: 25, maxPp: 25, category: 'special',
    description: 'Fires a stream of water at the foe.',
  },
  bubblebeam: {
    id: 'bubblebeam', name: 'Bubble Beam', type: 'water', power: 65, accuracy: 100,
    pp: 20, maxPp: 20, category: 'special',
    description: 'A forceful beam of bubbles.',
  },
  surf: {
    id: 'surf', name: 'Surf', type: 'water', power: 90, accuracy: 100,
    pp: 15, maxPp: 15, category: 'special',
    description: 'A massive wave crashes over the foe.',
  },
  hydropump: {
    id: 'hydropump', name: 'Hydro Pump', type: 'water', power: 110, accuracy: 80,
    pp: 5, maxPp: 5, category: 'special',
    description: 'An overwhelming torrent of water. Devastatingly powerful.',
  },

  // Grass
  vinewhip: {
    id: 'vinewhip', name: 'Vine Whip', type: 'grass', power: 45, accuracy: 100,
    pp: 25, maxPp: 25, category: 'physical',
    description: 'Strikes the foe with slender vines.',
  },
  razorleaf: {
    id: 'razorleaf', name: 'Razor Leaf', type: 'grass', power: 55, accuracy: 95,
    pp: 25, maxPp: 25, category: 'physical',
    description: 'Launches sharp-edged leaves at the foe.',
  },
  solarbeam: {
    id: 'solarbeam', name: 'Solar Beam', type: 'grass', power: 120, accuracy: 100,
    pp: 10, maxPp: 10, category: 'special',
    description: 'Absorbs sunlight then fires a massive beam.',
  },
  leafstorm: {
    id: 'leafstorm', name: 'Leaf Storm', type: 'grass', power: 130, accuracy: 90,
    pp: 5, maxPp: 5, category: 'special',
    description: 'A fierce storm of razor-sharp leaves.',
  },

  // Electric
  thundershock: {
    id: 'thundershock', name: 'Thundershock', type: 'electric', power: 40, accuracy: 100,
    pp: 30, maxPp: 30, category: 'special',
    statusEffect: { type: 'paralyze', chance: 10 },
    description: 'A jolting thunderbolt. May paralyze.',
  },
  thunderbolt: {
    id: 'thunderbolt', name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100,
    pp: 15, maxPp: 15, category: 'special',
    statusEffect: { type: 'paralyze', chance: 10 },
    description: 'A strong electric attack. May paralyze.',
  },
  thunder: {
    id: 'thunder', name: 'Thunder', type: 'electric', power: 110, accuracy: 70,
    pp: 10, maxPp: 10, category: 'special',
    statusEffect: { type: 'paralyze', chance: 30 },
    description: 'A massive thunderbolt from the sky. May paralyze.',
  },
  wildcharge: {
    id: 'wildcharge', name: 'Wild Charge', type: 'electric', power: 90, accuracy: 100,
    pp: 15, maxPp: 15, category: 'physical',
    description: 'Recklessly charges with electricity. Deals some recoil.',
  },

  // Shadow
  shadowclaw: {
    id: 'shadowclaw', name: 'Shadow Claw', type: 'shadow', power: 70, accuracy: 100,
    pp: 15, maxPp: 15, category: 'physical',
    description: 'Rakes with a shadowy claw. High critical-hit ratio.',
  },
  darkpulse: {
    id: 'darkpulse', name: 'Dark Pulse', type: 'shadow', power: 80, accuracy: 100,
    pp: 15, maxPp: 15, category: 'special',
    description: 'Fires a wave of dark energy from the heart.',
  },
  nightshade: {
    id: 'nightshade', name: 'Night Shade', type: 'shadow', power: 50, accuracy: 100,
    pp: 15, maxPp: 15, category: 'special',
    description: 'Creates a sinister illusion that deals fixed damage.',
  },
  shadowforce: {
    id: 'shadowforce', name: 'Shadow Force', type: 'shadow', power: 120, accuracy: 100,
    pp: 5, maxPp: 5, category: 'physical',
    description: 'Strikes from another dimension. Unstoppable.',
  },
};

// ─── CREATURES ───────────────────────────────────────────────────────────────
export const CREATURES: Record<string, CreatureTemplate> = {
  // === FIRE LINE ===
  embrit: {
    id: 'embrit', name: 'Embrit', type: 'fire', emoji: '🔥',
    baseStats: { hp: 45, attack: 52, defense: 43, speed: 65 },
    learnset: ['scratch', 'ember', 'firespin', 'flameburst'],
    levelUpMoves: [
      { moveId: 'bite', level: 12 },
      { moveId: 'thundershock', level: 20 },
    ],
    evolutionLevel: 16, evolvesTo: 'scorchlet',
    description: 'A tiny ember spirit that dances in the heart of flames.',
    rarity: 'common', catchRate: 45,
  },
  scorchlet: {
    id: 'scorchlet', name: 'Scorchlet', type: 'fire', emoji: '🦊',
    baseStats: { hp: 58, attack: 64, defense: 58, speed: 80 },
    learnset: ['ember', 'flameburst', 'firespin', 'inferno'],
    levelUpMoves: [
      { moveId: 'wildcharge', level: 25 },
      { moveId: 'shadowclaw', level: 35 },
    ],
    evolutionLevel: 36, evolvesTo: 'infernox',
    description: 'A fiery fox that scorches everything in its path.',
    rarity: 'uncommon', catchRate: 45,
  },
  infernox: {
    id: 'infernox', name: 'Infernox', type: 'fire', emoji: '🐉',
    baseStats: { hp: 78, attack: 84, defense: 78, speed: 100 },
    learnset: ['flameburst', 'inferno', 'firespin', 'slam'],
    levelUpMoves: [
      { moveId: 'thunder', level: 42 },
    ],
    description: 'A fearsome fire dragon of ancient legend. Its breath melts steel.',
    rarity: 'rare', catchRate: 45,
  },

  // === WATER LINE ===
  dropkin: {
    id: 'dropkin', name: 'Dropkin', type: 'water', emoji: '💧',
    baseStats: { hp: 44, attack: 48, defense: 65, speed: 43 },
    learnset: ['tackle', 'watergun', 'bubblebeam', 'surf'],
    levelUpMoves: [
      { moveId: 'vinewhip', level: 12 },
      { moveId: 'thundershock', level: 20 },
    ],
    evolutionLevel: 16, evolvesTo: 'waveling',
    description: 'A shy water droplet creature that loves misty mornings.',
    rarity: 'common', catchRate: 45,
  },
  waveling: {
    id: 'waveling', name: 'Waveling', type: 'water', emoji: '🐬',
    baseStats: { hp: 59, attack: 62, defense: 80, speed: 58 },
    learnset: ['watergun', 'bubblebeam', 'surf', 'hydropump'],
    levelUpMoves: [
      { moveId: 'razorleaf', level: 25 },
      { moveId: 'thunderbolt', level: 35 },
    ],
    evolutionLevel: 36, evolvesTo: 'tidalore',
    description: 'An elegant dolphin creature that surfs on ocean currents.',
    rarity: 'uncommon', catchRate: 45,
  },
  tidalore: {
    id: 'tidalore', name: 'Tidalore', type: 'water', emoji: '🌊',
    baseStats: { hp: 79, attack: 83, defense: 100, speed: 78 },
    learnset: ['surf', 'hydropump', 'bubblebeam', 'slam'],
    levelUpMoves: [
      { moveId: 'solarbeam', level: 42 },
    ],
    description: 'The ruler of the deep seas. Its roar summons tidal waves.',
    rarity: 'rare', catchRate: 45,
  },

  // === GRASS LINE ===
  sproutie: {
    id: 'sproutie', name: 'Sproutie', type: 'grass', emoji: '🌱',
    baseStats: { hp: 45, attack: 49, defense: 49, speed: 45 },
    learnset: ['tackle', 'vinewhip', 'razorleaf', 'solarbeam'],
    levelUpMoves: [
      { moveId: 'watergun', level: 12 },
      { moveId: 'bite', level: 20 },
    ],
    evolutionLevel: 16, evolvesTo: 'fernling',
    description: 'A tiny plant spirit that sleeps curled up in flower beds.',
    rarity: 'common', catchRate: 45,
  },
  fernling: {
    id: 'fernling', name: 'Fernling', type: 'grass', emoji: '🦎',
    baseStats: { hp: 60, attack: 62, defense: 63, speed: 60 },
    learnset: ['vinewhip', 'razorleaf', 'solarbeam', 'leafstorm'],
    levelUpMoves: [
      { moveId: 'bubblebeam', level: 25 },
      { moveId: 'shadowclaw', level: 35 },
    ],
    evolutionLevel: 36, evolvesTo: 'verdanox',
    description: 'A leafy lizard creature that can regrow any part of its body.',
    rarity: 'uncommon', catchRate: 45,
  },
  verdanox: {
    id: 'verdanox', name: 'Verdanox', type: 'grass', emoji: '🌳',
    baseStats: { hp: 80, attack: 82, defense: 83, speed: 80 },
    learnset: ['razorleaf', 'solarbeam', 'leafstorm', 'slam'],
    levelUpMoves: [
      { moveId: 'darkpulse', level: 42 },
    ],
    description: 'An ancient forest guardian. It has lived for a thousand years.',
    rarity: 'rare', catchRate: 45,
  },

  // === ELECTRIC LINE ===
  zappet: {
    id: 'zappet', name: 'Zappet', type: 'electric', emoji: '⚡',
    baseStats: { hp: 35, attack: 55, defense: 40, speed: 90 },
    learnset: ['tackle', 'thundershock', 'thunderbolt', 'wildcharge'],
    levelUpMoves: [
      { moveId: 'watergun', level: 12 },
      { moveId: 'bite', level: 20 },
    ],
    evolutionLevel: 16, evolvesTo: 'voltling',
    description: 'A tiny rodent that generates electricity when excited.',
    rarity: 'common', catchRate: 45,
  },
  voltling: {
    id: 'voltling', name: 'Voltling', type: 'electric', emoji: '🐕',
    baseStats: { hp: 45, attack: 65, defense: 55, speed: 100 },
    learnset: ['thundershock', 'thunderbolt', 'wildcharge', 'bite'],
    levelUpMoves: [
      { moveId: 'surf', level: 25 },
      { moveId: 'darkpulse', level: 35 },
    ],
    evolutionLevel: 36, evolvesTo: 'thunderax',
    description: 'An energetic dog that leaves sparks with every bounding step.',
    rarity: 'uncommon', catchRate: 45,
  },
  thunderax: {
    id: 'thunderax', name: 'Thunderax', type: 'electric', emoji: '🦁',
    baseStats: { hp: 65, attack: 90, defense: 75, speed: 115 },
    learnset: ['thunderbolt', 'thunder', 'wildcharge', 'slam'],
    levelUpMoves: [
      { moveId: 'inferno', level: 42 },
    ],
    description: 'A thunder lion. Its roar alone summons lightning storms.',
    rarity: 'rare', catchRate: 45,
  },

  // === SHADOW LINE ===
  dimlit: {
    id: 'dimlit', name: 'Dimlit', type: 'shadow', emoji: '🌑',
    baseStats: { hp: 38, attack: 50, defense: 38, speed: 55 },
    learnset: ['scratch', 'shadowclaw', 'nightshade', 'darkpulse'],
    levelUpMoves: [
      { moveId: 'bite', level: 12 },
      { moveId: 'thundershock', level: 20 },
    ],
    evolutionLevel: 16, evolvesTo: 'gloomling',
    description: 'A mysterious dark kitten that only appears when the lights go out.',
    rarity: 'uncommon', catchRate: 35,
  },
  gloomling: {
    id: 'gloomling', name: 'Gloomling', type: 'shadow', emoji: '🐺',
    baseStats: { hp: 52, attack: 65, defense: 52, speed: 70 },
    learnset: ['shadowclaw', 'darkpulse', 'bite', 'nightshade'],
    levelUpMoves: [
      { moveId: 'ember', level: 25 },
      { moveId: 'thunderbolt', level: 35 },
    ],
    evolutionLevel: 36, evolvesTo: 'voidrex',
    description: 'A shadowy wolf that hunts in perfect darkness without a sound.',
    rarity: 'rare', catchRate: 35,
  },
  voidrex: {
    id: 'voidrex', name: 'Voidrex', type: 'shadow', emoji: '👁️',
    baseStats: { hp: 72, attack: 95, defense: 72, speed: 90 },
    learnset: ['darkpulse', 'shadowforce', 'shadowclaw', 'slam'],
    levelUpMoves: [
      { moveId: 'solarbeam', level: 42 },
    ],
    description: 'A void dragon from another dimension. Extremely rare and powerful.',
    rarity: 'legendary', catchRate: 15,
  },
};

// ─── ITEMS ───────────────────────────────────────────────────────────────────
export const ITEMS: Record<string, Item> = {
  berry: {
    id: 'berry', name: 'Berry', emoji: '🍓',
    description: 'A sweet berry. Restores 30 Hunger.',
    type: 'food', effect: { hunger: 30 }, cost: 10,
  },
  superberry: {
    id: 'superberry', name: 'Super Berry', emoji: '🍇',
    description: 'A plump berry. Restores 60 Hunger & a bit of Happiness.',
    type: 'food', effect: { hunger: 60, happiness: 5 }, cost: 25,
  },
  candy: {
    id: 'candy', name: 'Sweet Candy', emoji: '🍬',
    description: 'A delicious treat! Boosts Happiness by 30.',
    type: 'food', effect: { happiness: 30, hunger: 10 }, cost: 20,
  },
  medicine: {
    id: 'medicine', name: 'Medicine', emoji: '💊',
    description: 'Restores 30 Health when your creature feels sick.',
    type: 'medicine', effect: { health: 30 }, cost: 20,
  },
  potion: {
    id: 'potion', name: 'Potion', emoji: '🧪',
    description: 'Restores 30 HP during battle.',
    type: 'medicine', effect: { hp: 30 }, cost: 20,
  },
  superpotion: {
    id: 'superpotion', name: 'Super Potion', emoji: '✨',
    description: 'Restores 70 HP during battle.',
    type: 'medicine', effect: { hp: 70 }, cost: 50,
  },
  revive: {
    id: 'revive', name: 'Revive', emoji: '💫',
    description: 'Fully heals a fainted creature and restores Health.',
    type: 'medicine', effect: { hp: 9999, health: 100 }, cost: 80,
  },
  lureball: {
    id: 'lureball', name: 'Lure Ball', emoji: '🔴',
    description: 'Throw at a wild creature to try to catch it!',
    type: 'ball', effect: { catchMultiplier: 1.0 }, cost: 30,
  },
  superball: {
    id: 'superball', name: 'Super Ball', emoji: '🔵',
    description: 'A higher-quality ball with a better catch rate.',
    type: 'ball', effect: { catchMultiplier: 1.5 }, cost: 60,
  },
  ultraball: {
    id: 'ultraball', name: 'Ultra Ball', emoji: '🟡',
    description: 'An ultra-quality ball with an even better catch rate.',
    type: 'ball', effect: { catchMultiplier: 2.0 }, cost: 100,
  },
  antidote: {
    id: 'antidote', name: 'Antidote', emoji: '🌿',
    description: 'Cures all status effects (burn, paralyze).',
    type: 'medicine', effect: { cureStatus: true }, cost: 25,
  },
  ether: {
    id: 'ether', name: 'Ether', emoji: '💎',
    description: 'Restores all move PP to max for one creature.',
    type: 'medicine', effect: { restorePp: true }, cost: 45,
  },
  energydrink: {
    id: 'energydrink', name: 'Energy Drink', emoji: '⚡',
    description: 'Restores 80 Energy — great before a long battle session.',
    type: 'food', effect: { energy: 80 }, cost: 18,
  },
  rarecandy: {
    id: 'rarecandy', name: 'Rare Candy', emoji: '🍭',
    description: 'A mysterious candy that grants one immediate level-up.',
    type: 'misc', effect: { levelUp: true }, cost: 200,
  },
  bitterberry: {
    id: 'bitterberry', name: 'Bitter Berry', emoji: '🍋',
    description: 'Revives a fainted creature to 25% HP. Tastes terrible.',
    type: 'medicine', effect: { onlyFainted: true, revivePercent: 25, health: 20 }, cost: 40,
  },
};

// ─── AREAS ───────────────────────────────────────────────────────────────────
export const AREAS: Area[] = [
  {
    id: 'volcanic_cave',
    name: 'Volcanic Cave',
    emoji: '🌋',
    description: 'A scorching cave bubbling with lava. Fire creatures dwell here.',
    levelRange: [3, 12],
    creatures: ['embrit', 'scorchlet'],
    unlockLevel: 1,
  },
  {
    id: 'ocean_shore',
    name: 'Ocean Shore',
    emoji: '🏖️',
    description: 'A sparkling beach where water creatures frolic in the surf.',
    levelRange: [3, 12],
    creatures: ['dropkin', 'waveling'],
    unlockLevel: 1,
  },
  {
    id: 'verdant_forest',
    name: 'Verdant Forest',
    emoji: '🌲',
    description: 'A lush green forest alive with grass creatures.',
    levelRange: [3, 12],
    creatures: ['sproutie', 'fernling'],
    unlockLevel: 1,
  },
  {
    id: 'thunder_peak',
    name: 'Thunder Peak',
    emoji: '⛰️',
    description: 'A mountaintop perpetually struck by lightning. Electric creatures gather here.',
    levelRange: [8, 20],
    creatures: ['zappet', 'voltling'],
    unlockLevel: 8,
  },
  {
    id: 'shadow_realm',
    name: 'Shadow Realm',
    emoji: '🌑',
    description: 'A dark dimension where shadow creatures lurk. Explore with caution.',
    levelRange: [15, 30],
    creatures: ['dimlit', 'gloomling'],
    unlockLevel: 15,
  },
];

export const STARTER_IDS = ['embrit', 'dropkin', 'sproutie'];
