import type { CreatureTemplate, OwnedCreature, Move, ElementType, CareStats } from './types';
import { CREATURES, MOVES } from './gameData';

// ─── ID GENERATION ───────────────────────────────────────────────────────────
export function generateUid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// ─── STAT CALCULATIONS ───────────────────────────────────────────────────────
export function calcMaxHp(baseHp: number, level: number): number {
  return Math.floor((2 * baseHp * level) / 100 + level + 10);
}

export function calcStat(base: number, level: number): number {
  return Math.floor((2 * base * level) / 100 + 5);
}

export function calcExpToNext(level: number): number {
  return level * 100;
}

// ─── CREATURE CREATION ───────────────────────────────────────────────────────
export function createCreatureFromTemplate(
  template: CreatureTemplate,
  level: number,
  isStarter: boolean,
  day: number,
): OwnedCreature {
  const maxHp = calcMaxHp(template.baseStats.hp, level);
  const learnedMoveIds = template.learnset.slice(0, 4);
  const moves: Move[] = learnedMoveIds.map((id) => ({ ...MOVES[id] }));

  return {
    uid: generateUid(),
    templateId: template.id,
    nickname: template.name,
    level,
    exp: 0,
    currentHp: maxHp,
    maxHp,
    attack: calcStat(template.baseStats.attack, level),
    defense: calcStat(template.baseStats.defense, level),
    speed: calcStat(template.baseStats.speed, level),
    moves,
    care: { hunger: 80, happiness: 80, energy: 100, health: 100 },
    statusEffect: null,
    isFavorite: false,
    caughtDay: day,
    isStarter,
  };
}

export function createWildCreature(templateId: string, level: number): OwnedCreature {
  return createCreatureFromTemplate(CREATURES[templateId], level, false, 0);
}

// ─── TYPE EFFECTIVENESS ──────────────────────────────────────────────────────
const TYPE_CHART: Record<ElementType, Partial<Record<ElementType, number>>> = {
  fire:     { grass: 2, fire: 0.5, water: 0.5, electric: 1, shadow: 1, normal: 1 },
  water:    { fire: 2, water: 0.5, grass: 0.5, electric: 1, shadow: 1, normal: 1 },
  grass:    { water: 2, grass: 0.5, fire: 0.5, electric: 1, shadow: 1, normal: 1 },
  electric: { water: 2, grass: 1, fire: 1, electric: 0.5, shadow: 1, normal: 1 },
  shadow:   { normal: 2, shadow: 0.5, fire: 1, water: 1, grass: 1, electric: 1 },
  normal:   { fire: 1, water: 1, grass: 1, electric: 1, shadow: 0.5, normal: 1 },
};

export function getTypeEffectiveness(moveType: ElementType, targetType: ElementType): number {
  return TYPE_CHART[moveType]?.[targetType] ?? 1;
}

export function getEffectivenessLabel(mult: number): string {
  if (mult >= 2) return "It's super effective!";
  if (mult <= 0.5) return "It's not very effective...";
  return '';
}

// ─── DAMAGE CALCULATION ──────────────────────────────────────────────────────
export interface DamageResult {
  damage: number;
  effectiveness: number;
  isCrit: boolean;
  missed: boolean;
}

export function calcDamage(
  attacker: OwnedCreature,
  defender: OwnedCreature,
  move: Move,
): DamageResult {
  // Accuracy check
  if (Math.random() * 100 > move.accuracy) {
    return { damage: 0, effectiveness: 1, isCrit: false, missed: true };
  }

  const defenderTemplate = CREATURES[defender.templateId];
  const effectiveness = getTypeEffectiveness(move.type, defenderTemplate.type);
  const isCrit = Math.random() < 0.0625;
  const critMultiplier = isCrit ? 1.5 : 1;
  const randomFactor = 0.85 + Math.random() * 0.15;

  // Paralysis halves speed but we handle that separately
  // Status burn: already applied to HP each turn

  const attackStat = attacker.attack;
  const defenseStat = defender.defense;

  const damage = Math.max(
    1,
    Math.floor(
      (((2 * attacker.level) / 5 + 2) * move.power * (attackStat / defenseStat)) / 50 +
        2 * effectiveness * critMultiplier * randomFactor,
    ),
  );

  return { damage, effectiveness, isCrit, missed: false };
}

// ─── CATCH CALCULATION ───────────────────────────────────────────────────────
export function calcCatchSuccess(creature: OwnedCreature, catchMultiplier: number): boolean {
  const template = CREATURES[creature.templateId];
  const hpRatio = creature.currentHp / creature.maxHp;
  const rate = ((3 - 2 * hpRatio) * template.catchRate * catchMultiplier) / 3;
  return Math.random() < rate / 255;
}

// ─── EXP / LEVELING ──────────────────────────────────────────────────────────
export interface LevelUpResult {
  creature: OwnedCreature;
  levelsGained: number;
}

export function applyExpGain(creature: OwnedCreature, expAmount: number): LevelUpResult {
  let { exp, level, maxHp, currentHp } = creature;
  exp += expAmount;
  let levelsGained = 0;

  while (level < 50 && exp >= calcExpToNext(level)) {
    exp -= calcExpToNext(level);
    level++;
    levelsGained++;
  }

  const template = CREATURES[creature.templateId];
  const newMaxHp = calcMaxHp(template.baseStats.hp, level);
  const hpGain = newMaxHp - maxHp;
  currentHp = Math.min(newMaxHp, currentHp + hpGain);

  const updated: OwnedCreature = {
    ...creature,
    level,
    exp,
    maxHp: newMaxHp,
    currentHp,
    attack: calcStat(template.baseStats.attack, level),
    defense: calcStat(template.baseStats.defense, level),
    speed: calcStat(template.baseStats.speed, level),
  };

  return { creature: updated, levelsGained };
}

export function calcExpGain(loserLevel: number, isWild: boolean): number {
  const base = loserLevel * 15;
  return Math.floor(isWild ? base : base * 1.5);
}

// ─── EVOLUTION ───────────────────────────────────────────────────────────────
export function checkEvolution(creature: OwnedCreature): string | null {
  const template = CREATURES[creature.templateId];
  if (template.evolutionLevel && creature.level >= template.evolutionLevel && template.evolvesTo) {
    return template.evolvesTo;
  }
  return null;
}

export function evolveCreature(creature: OwnedCreature): OwnedCreature {
  const currentTemplate = CREATURES[creature.templateId];
  const newTemplateId = currentTemplate.evolvesTo!;
  const newTemplate = CREATURES[newTemplateId];

  const newMaxHp = calcMaxHp(newTemplate.baseStats.hp, creature.level);
  const hpPercent = creature.currentHp / creature.maxHp;
  const newMoves: Move[] = newTemplate.learnset.slice(0, 4).map((id) => ({ ...MOVES[id] }));

  return {
    ...creature,
    templateId: newTemplateId,
    nickname:
      creature.nickname === currentTemplate.name ? newTemplate.name : creature.nickname,
    maxHp: newMaxHp,
    currentHp: Math.max(1, Math.floor(newMaxHp * hpPercent)),
    attack: calcStat(newTemplate.baseStats.attack, creature.level),
    defense: calcStat(newTemplate.baseStats.defense, creature.level),
    speed: calcStat(newTemplate.baseStats.speed, creature.level),
    moves: newMoves,
  };
}

// ─── CARE & TIME ─────────────────────────────────────────────────────────────
export function applyTimeTick(creature: OwnedCreature, minutesPassed: number): OwnedCreature {
  const mins = Math.min(minutesPassed, 1440); // cap at 24 hours
  const hungerLoss = mins * 0.4;
  const happinessLoss = mins * 0.15;
  const energyLoss = mins * 0.25;
  // health decreases faster when hungry
  const healthLoss = creature.care.hunger < 20 ? mins * 0.1 : mins * 0.02;

  return {
    ...creature,
    care: {
      hunger: Math.max(0, creature.care.hunger - hungerLoss),
      happiness: Math.max(0, creature.care.happiness - happinessLoss),
      energy: Math.max(0, creature.care.energy - energyLoss),
      health: Math.max(0, creature.care.health - healthLoss),
    },
  };
}

export function getMood(care: CareStats): 'happy' | 'content' | 'sad' | 'sick' {
  if (care.health < 30) return 'sick';
  if (care.hunger < 20 || care.happiness < 20 || care.energy < 15) return 'sad';
  if (care.happiness > 70 && care.hunger > 60 && care.energy > 50) return 'happy';
  return 'content';
}

export function getMoodEmoji(mood: ReturnType<typeof getMood>): string {
  const map = { happy: '😊', content: '😐', sad: '😢', sick: '🤒' } as const;
  return map[mood];
}

export function getPlayerLevel(creatures: OwnedCreature[]): number {
  if (creatures.length === 0) return 1;
  return Math.max(...creatures.map((c) => c.level));
}

// ─── ENEMY AI ────────────────────────────────────────────────────────────────
export function pickEnemyMove(enemy: OwnedCreature, target: OwnedCreature): Move {
  const targetType = CREATURES[target.templateId].type;
  const validMoves = enemy.moves.filter((m) => m.pp > 0);
  if (validMoves.length === 0) return enemy.moves[0]; // struggle fallback

  // Sort by expected damage (type effectiveness * power)
  const scored = validMoves.map((m) => ({
    move: m,
    score: m.power * getTypeEffectiveness(m.type, targetType),
  }));
  scored.sort((a, b) => b.score - a.score);

  // 60% best move, 40% random
  if (Math.random() < 0.6) return scored[0].move;
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

// ─── BURN / PARALYZE TICK ────────────────────────────────────────────────────
export function applyStatusDamage(creature: OwnedCreature): { creature: OwnedCreature; log: string | null } {
  if (creature.statusEffect === 'burn') {
    const dmg = Math.max(1, Math.floor(creature.maxHp / 8));
    return {
      creature: { ...creature, currentHp: Math.max(0, creature.currentHp - dmg) },
      log: `${creature.nickname} is hurt by its burn! (-${dmg} HP)`,
    };
  }
  return { creature, log: null };
}

export function isParalyzed(creature: OwnedCreature): boolean {
  return creature.statusEffect === 'paralyze' && Math.random() < 0.25;
}
