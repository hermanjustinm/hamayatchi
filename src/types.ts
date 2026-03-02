export type ElementType = 'fire' | 'water' | 'grass' | 'electric' | 'shadow' | 'normal';
export type GameScreen = 'start' | 'name' | 'starter' | 'home' | 'battle' | 'collection' | 'shop' | 'explore';
export type BattlePhase = 'selecting' | 'processing' | 'end';
export type MoveCategory = 'physical' | 'special' | 'status';
export type StatusEffect = 'burn' | 'paralyze' | 'sleep';
export type NotifType = 'success' | 'error' | 'info' | 'warning';
export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type ItemType = 'food' | 'medicine' | 'ball' | 'misc';
export type QuestType = 'feed' | 'play' | 'battle_win' | 'catch' | 'use_potion';

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  accuracy: number;
  pp: number;
  maxPp: number;
  category: MoveCategory;
  statusEffect?: {
    type: StatusEffect;
    chance: number;
  };
  description: string;
}

export interface MoveLearnEntry {
  moveId: string;
  level: number;
}

export interface CreatureTemplate {
  id: string;
  name: string;
  type: ElementType;
  emoji: string;
  baseStats: BaseStats;
  learnset: string[];
  levelUpMoves?: MoveLearnEntry[];
  evolutionLevel?: number;
  evolvesTo?: string;
  description: string;
  rarity: CreatureRarity;
  catchRate: number;
}

export interface CareStats {
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
}

export interface OwnedCreature {
  uid: string;
  templateId: string;
  nickname: string;
  level: number;
  exp: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Move[];
  care: CareStats;
  statusEffect: StatusEffect | null;
  isFavorite: boolean;
  caughtDay: number;
  isStarter: boolean;
}

export interface Item {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: ItemType;
  effect: {
    hunger?: number;
    happiness?: number;
    energy?: number;
    health?: number;
    hp?: number;
    catchMultiplier?: number;
    restorePp?: boolean;
    cureStatus?: boolean;
    levelUp?: boolean;
    onlyFainted?: boolean;   // item can only be used on a fainted creature
    revivePercent?: number;  // revive to X% of maxHp (0-100)
  };
  cost: number;
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export interface BattleLogEntry {
  text: string;
  type: 'info' | 'damage' | 'effect' | 'catch' | 'exp' | 'system';
}

export interface BattleState {
  enemyCreature: OwnedCreature;
  playerCreatureId: string;
  isWild: boolean;
  areaId: string;
  phase: BattlePhase;
  log: BattleLogEntry[];
  result: 'ongoing' | 'win' | 'lose' | 'flee' | 'catch';
  expGained: number;
  goldGained: number;
  turnCount: number;
}

export interface GameNotification {
  id: string;
  text: string;
  type: NotifType;
}

export interface GameStats {
  battlesWon: number;
  battlesLost: number;
  creaturesEvolved: number;
  creaturesCollected: number;
  totalDaysPlayed: number;
}

export interface Area {
  id: string;
  name: string;
  emoji: string;
  description: string;
  levelRange: [number, number];
  creatures: string[];
  unlockLevel: number;
}

export interface DailyQuest {
  id: string;
  label: string;
  type: QuestType;
  goal: number;
  progress: number;
  reward: { gold?: number; itemId?: string; qty?: number };
  completed: boolean;
  claimed: boolean;
}

export interface PendingMoveLearn {
  creatureUid: string;
  moveId: string;
}

export interface GameState {
  version: number;
  playerName: string;
  currentScreen: GameScreen;
  day: number;
  gold: number;
  creatures: OwnedCreature[];
  activeCreatureId: string | null;
  inventory: InventoryEntry[];
  battle: BattleState | null;
  lastTickTime: number;
  notifications: GameNotification[];
  stats: GameStats;
  unlockedAreas: string[];
  seenCreatures: string[];
  pendingMoveLearn: PendingMoveLearn[];
  dailyQuests: DailyQuest[];
  questDate: string;
}
