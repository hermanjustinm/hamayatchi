import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  GameState,
  OwnedCreature,
  BattleState,
  BattleLogEntry,
  GameNotification,
  GameScreen,
} from './types';
import { CREATURES, ITEMS, AREAS } from './gameData';
import {
  createCreatureFromTemplate,
  createWildCreature,
  calcDamage,
  calcCatchSuccess,
  calcExpGain,
  applyExpGain,
  applyTimeTick,
  checkEvolution,
  evolveCreature,
  getMood,
  getPlayerLevel,
  pickEnemyMove,
  applyStatusDamage,
  isParalyzed,
  generateUid,
  getEffectivenessLabel,
} from './gameLogic';

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const SAVE_KEY = 'hamayatchi_v1';

const DEFAULT_INVENTORY = [
  { itemId: 'berry', quantity: 5 },
  { itemId: 'medicine', quantity: 2 },
  { itemId: 'lureball', quantity: 3 },
];

function makeInitialState(): GameState {
  return {
    version: 1,
    playerName: '',
    currentScreen: 'start',
    day: 1,
    gold: 150,
    creatures: [],
    activeCreatureId: null,
    inventory: DEFAULT_INVENTORY,
    battle: null,
    lastTickTime: Date.now(),
    notifications: [],
    stats: {
      battlesWon: 0,
      battlesLost: 0,
      creaturesEvolved: 0,
      creaturesCollected: 0,
      totalDaysPlayed: 0,
    },
    unlockedAreas: ['volcanic_cave', 'ocean_shore', 'verdant_forest'],
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as GameState;
      return { ...makeInitialState(), ...saved };
    }
  } catch {
    // ignore
  }
  return makeInitialState();
}

function saveState(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────
type GameAction =
  | { type: 'SET_PLAYER_NAME'; name: string }
  | { type: 'SELECT_STARTER'; templateId: string }
  | { type: 'CHANGE_SCREEN'; screen: GameScreen }
  | { type: 'FEED_CREATURE'; creatureUid: string; itemId: string }
  | { type: 'PLAY_WITH_CREATURE'; creatureUid: string }
  | { type: 'PUT_TO_SLEEP'; creatureUid: string }
  | { type: 'START_EXPLORE_BATTLE'; areaId: string }
  | { type: 'BATTLE_MOVE'; moveId: string }
  | { type: 'BATTLE_USE_ITEM'; itemId: string }
  | { type: 'CATCH_CREATURE'; itemId: string }
  | { type: 'FLEE_BATTLE' }
  | { type: 'BUY_ITEM'; itemId: string; qty: number }
  | { type: 'USE_ITEM_ON_CREATURE'; itemId: string; creatureUid: string }
  | { type: 'SET_ACTIVE_CREATURE'; creatureUid: string }
  | { type: 'NICKNAME_CREATURE'; creatureUid: string; nickname: string }
  | { type: 'TOGGLE_FAVORITE'; creatureUid: string }
  | { type: 'APPLY_EVOLUTION'; creatureUid: string }
  | { type: 'TICK' }
  | { type: 'ADD_NOTIF'; text: string; notifType: GameNotification['type'] }
  | { type: 'DISMISS_NOTIF'; id: string }
  | { type: 'RESET_GAME' };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function addNotif(
  state: GameState,
  text: string,
  type: GameNotification['type'] = 'info',
): GameState {
  const notif: GameNotification = { id: generateUid(), text, type };
  return { ...state, notifications: [...state.notifications.slice(-4), notif] };
}

function updateCreature(
  creatures: OwnedCreature[],
  uid: string,
  updater: (c: OwnedCreature) => OwnedCreature,
): OwnedCreature[] {
  return creatures.map((c) => (c.uid === uid ? updater(c) : c));
}

function getItem(itemId: string) {
  return ITEMS[itemId];
}

function removeInventory(
  inventory: GameState['inventory'],
  itemId: string,
  qty = 1,
): GameState['inventory'] {
  return inventory
    .map((e) => (e.itemId === itemId ? { ...e, quantity: e.quantity - qty } : e))
    .filter((e) => e.quantity > 0);
}

function addInventory(
  inventory: GameState['inventory'],
  itemId: string,
  qty = 1,
): GameState['inventory'] {
  const existing = inventory.find((e) => e.itemId === itemId);
  if (existing) {
    return inventory.map((e) => (e.itemId === itemId ? { ...e, quantity: e.quantity + qty } : e));
  }
  return [...inventory, { itemId, quantity: qty }];
}

function logBattle(state: GameState, entry: BattleLogEntry): GameState {
  if (!state.battle) return state;
  const log = [...state.battle.log, entry].slice(-6);
  return { ...state, battle: { ...state.battle, log } };
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER_NAME': {
      return { ...state, playerName: action.name, currentScreen: 'starter' };
    }

    case 'SELECT_STARTER': {
      const template = CREATURES[action.templateId];
      const creature = createCreatureFromTemplate(template, 5, true, state.day);
      return {
        ...state,
        creatures: [creature],
        activeCreatureId: creature.uid,
        currentScreen: 'home',
        stats: { ...state.stats, creaturesCollected: 1 },
      };
    }

    case 'CHANGE_SCREEN': {
      return { ...state, currentScreen: action.screen };
    }

    case 'FEED_CREATURE': {
      const entry = state.inventory.find((e) => e.itemId === action.itemId);
      if (!entry || entry.quantity <= 0) return state;

      const item = getItem(action.itemId);
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;

      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        care: {
          hunger: Math.min(100, c.care.hunger + (item.effect.hunger ?? 0)),
          happiness: Math.min(100, c.care.happiness + (item.effect.happiness ?? 0)),
          energy: Math.min(100, c.care.energy + (item.effect.energy ?? 0)),
          health: Math.min(100, c.care.health + (item.effect.health ?? 0)),
        },
      }));

      let s = {
        ...state,
        creatures: updatedCreatures,
        inventory: removeInventory(state.inventory, action.itemId),
        stats: { ...state.stats },
      };
      s = addNotif(s, `${creature.nickname} ate the ${item.name}! 🍽️`, 'success');
      return s;
    }

    case 'PLAY_WITH_CREATURE': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;
      if (creature.care.energy < 15) {
        return addNotif(state, `${creature.nickname} is too tired to play! 😴`, 'warning');
      }
      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        care: {
          ...c.care,
          happiness: Math.min(100, c.care.happiness + 15),
          energy: Math.max(0, c.care.energy - 20),
        },
      }));
      let s = { ...state, creatures: updatedCreatures };
      s = addNotif(s, `${creature.nickname} had a great time playing! 🎮`, 'success');
      return s;
    }

    case 'PUT_TO_SLEEP': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;
      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        care: { ...c.care, energy: 100 },
      }));
      let s = { ...state, creatures: updatedCreatures };
      s = addNotif(s, `${creature.nickname} is resting... Energy restored! 😴`, 'info');
      return s;
    }

    case 'START_EXPLORE_BATTLE': {
      const area = AREAS.find((a) => a.id === action.areaId);
      if (!area) return state;

      const activeCreature = state.creatures.find((c) => c.uid === state.activeCreatureId);
      if (!activeCreature || activeCreature.currentHp <= 0) {
        return addNotif(state, 'Your active creature has fainted! Heal first.', 'error');
      }

      const playerLevel = getPlayerLevel(state.creatures);
      const [minLvl, maxLvl] = area.levelRange;
      const boundedMin = Math.max(minLvl, playerLevel - 3);
      const boundedMax = Math.min(maxLvl, playerLevel + 3);
      const wildLevel =
        boundedMin >= boundedMax
          ? boundedMin
          : Math.floor(Math.random() * (boundedMax - boundedMin + 1)) + boundedMin;

      const wildTemplateId = area.creatures[Math.floor(Math.random() * area.creatures.length)];
      const wildCreature = createWildCreature(wildTemplateId, wildLevel);

      const battle: BattleState = {
        enemyCreature: wildCreature,
        playerCreatureId: activeCreature.uid,
        isWild: true,
        areaId: action.areaId,
        phase: 'selecting',
        log: [
          {
            text: `A wild ${wildCreature.nickname} (Lv. ${wildCreature.level}) appeared!`,
            type: 'system',
          },
        ],
        result: 'ongoing',
        expGained: 0,
        goldGained: 0,
        turnCount: 0,
      };

      return { ...state, battle, currentScreen: 'battle' };
    }

    case 'BATTLE_MOVE': {
      if (!state.battle || state.battle.phase !== 'selecting') return state;

      const playerCreature = state.creatures.find(
        (c) => c.uid === state.battle!.playerCreatureId,
      );
      if (!playerCreature) return state;

      const move = playerCreature.moves.find((m) => m.id === action.moveId);
      if (!move || move.pp <= 0) return state;

      // Consume PP
      let updatedCreatures = updateCreature(state.creatures, playerCreature.uid, (c) => ({
        ...c,
        moves: c.moves.map((m) => (m.id === move.id ? { ...m, pp: m.pp - 1 } : m)),
      }));

      let { enemyCreature } = state.battle;
      let logEntries: BattleLogEntry[] = [];
      let expGained = state.battle.expGained;
      let goldGained = state.battle.goldGained;

      // ─── Player attacks ───────────────────────────────────────────────────
      const freshPlayer = updatedCreatures.find((c) => c.uid === playerCreature.uid)!;

      // Check paralysis
      if (isParalyzed(freshPlayer)) {
        logEntries.push({ text: `${freshPlayer.nickname} is paralyzed and can't move!`, type: 'effect' });
      } else {
        const dmgResult = calcDamage(freshPlayer, enemyCreature, move);
        if (dmgResult.missed) {
          logEntries.push({ text: `${freshPlayer.nickname} used ${move.name}... but it missed!`, type: 'damage' });
        } else {
          enemyCreature = { ...enemyCreature, currentHp: Math.max(0, enemyCreature.currentHp - dmgResult.damage) };
          logEntries.push({
            text: `${freshPlayer.nickname} used ${move.name}! (−${dmgResult.damage} HP)${dmgResult.isCrit ? ' Critical hit!' : ''}`,
            type: 'damage',
          });
          const effectLabel = getEffectivenessLabel(dmgResult.effectiveness);
          if (effectLabel) logEntries.push({ text: effectLabel, type: 'effect' });

          // Status effect application
          if (move.statusEffect && Math.random() * 100 < move.statusEffect.chance && !enemyCreature.statusEffect) {
            enemyCreature = { ...enemyCreature, statusEffect: move.statusEffect.type };
            logEntries.push({ text: `Wild ${enemyCreature.nickname} is now ${move.statusEffect.type}ed!`, type: 'effect' });
          }
        }
      }

      // ─── Check enemy faint ────────────────────────────────────────────────
      if (enemyCreature.currentHp <= 0) {
        expGained = calcExpGain(enemyCreature.level, true);
        goldGained = Math.floor(enemyCreature.level * 10 + Math.random() * 20);
        logEntries.push({ text: `Wild ${enemyCreature.nickname} fainted!`, type: 'system' });
        logEntries.push({ text: `Gained ${expGained} EXP and ${goldGained} gold!`, type: 'exp' });

        // Apply EXP
        const { creature: leveled, levelsGained } = applyExpGain(freshPlayer, expGained);
        updatedCreatures = updatedCreatures.map((c) => (c.uid === leveled.uid ? leveled : c));
        if (levelsGained > 0) {
          logEntries.push({ text: `${leveled.nickname} reached Level ${leveled.level}!`, type: 'exp' });
        }

        const newState: GameState = {
          ...state,
          creatures: updatedCreatures,
          gold: state.gold + goldGained,
          battle: {
            ...state.battle,
            enemyCreature,
            phase: 'end',
            result: 'win',
            log: [...state.battle.log, ...logEntries],
            expGained,
            goldGained,
            turnCount: state.battle.turnCount + 1,
          },
          stats: { ...state.stats, battlesWon: state.stats.battlesWon + 1 },
        };
        return newState;
      }

      // ─── Enemy attacks ────────────────────────────────────────────────────
      // Apply burn damage to enemy
      const burnResult = applyStatusDamage(enemyCreature);
      if (burnResult.log) {
        enemyCreature = burnResult.creature;
        logEntries.push({ text: burnResult.log, type: 'effect' });
      }

      let currentPlayer = updatedCreatures.find((c) => c.uid === playerCreature.uid)!;

      if (isParalyzed(enemyCreature)) {
        logEntries.push({ text: `Wild ${enemyCreature.nickname} is paralyzed and can't move!`, type: 'effect' });
      } else {
        const enemyMove = pickEnemyMove(enemyCreature, currentPlayer);
        enemyCreature = {
          ...enemyCreature,
          moves: enemyCreature.moves.map((m) => (m.id === enemyMove.id ? { ...m, pp: m.pp - 1 } : m)),
        };

        const eDmg = calcDamage(enemyCreature, currentPlayer, enemyMove);
        if (eDmg.missed) {
          logEntries.push({ text: `Wild ${enemyCreature.nickname} used ${enemyMove.name}... but it missed!`, type: 'damage' });
        } else {
          currentPlayer = {
            ...currentPlayer,
            currentHp: Math.max(0, currentPlayer.currentHp - eDmg.damage),
          };
          updatedCreatures = updatedCreatures.map((c) => (c.uid === currentPlayer.uid ? currentPlayer : c));
          logEntries.push({
            text: `Wild ${enemyCreature.nickname} used ${enemyMove.name}! (−${eDmg.damage} HP)${eDmg.isCrit ? ' Critical hit!' : ''}`,
            type: 'damage',
          });
          const effectLabel = getEffectivenessLabel(eDmg.effectiveness);
          if (effectLabel) logEntries.push({ text: effectLabel, type: 'effect' });

          // Status from enemy move
          if (enemyMove.statusEffect && Math.random() * 100 < enemyMove.statusEffect.chance && !currentPlayer.statusEffect) {
            const updatedWithStatus = { ...currentPlayer, statusEffect: enemyMove.statusEffect.type };
            updatedCreatures = updatedCreatures.map((c) => (c.uid === currentPlayer.uid ? updatedWithStatus : c));
            logEntries.push({ text: `${currentPlayer.nickname} is now ${enemyMove.statusEffect.type}ed!`, type: 'effect' });
          }
        }
      }

      // Apply burn to player
      const playerBurnResult = applyStatusDamage(currentPlayer);
      if (playerBurnResult.log) {
        updatedCreatures = updatedCreatures.map((c) =>
          c.uid === currentPlayer.uid ? playerBurnResult.creature : c,
        );
        logEntries.push({ text: playerBurnResult.log, type: 'effect' });
        currentPlayer = playerBurnResult.creature;
      }

      // ─── Check player faint ───────────────────────────────────────────────
      if (currentPlayer.currentHp <= 0) {
        logEntries.push({ text: `${currentPlayer.nickname} fainted!`, type: 'system' });
        const newState: GameState = {
          ...state,
          creatures: updatedCreatures,
          battle: {
            ...state.battle,
            enemyCreature,
            phase: 'end',
            result: 'lose',
            log: [...state.battle.log, ...logEntries],
            expGained: 0,
            goldGained: 0,
            turnCount: state.battle.turnCount + 1,
          },
          stats: { ...state.stats, battlesLost: state.stats.battlesLost + 1 },
        };
        return newState;
      }

      return {
        ...state,
        creatures: updatedCreatures,
        battle: {
          ...state.battle,
          enemyCreature,
          log: [...state.battle.log, ...logEntries],
          phase: 'selecting',
          turnCount: state.battle.turnCount + 1,
        },
      };
    }

    case 'BATTLE_USE_ITEM': {
      if (!state.battle || state.battle.phase !== 'selecting') return state;

      const itemEntry = state.inventory.find((e) => e.itemId === action.itemId);
      if (!itemEntry || itemEntry.quantity <= 0) return state;

      const item = getItem(action.itemId);
      if (item.type !== 'medicine' || !item.effect.hp) return state;

      const playerCreature = state.creatures.find(
        (c) => c.uid === state.battle!.playerCreatureId,
      );
      if (!playerCreature) return state;

      const healAmount = item.effect.hp;
      const updatedCreatures = updateCreature(state.creatures, playerCreature.uid, (c) => ({
        ...c,
        currentHp: Math.min(c.maxHp, c.currentHp + healAmount),
      }));

      return {
        ...state,
        creatures: updatedCreatures,
        inventory: removeInventory(state.inventory, action.itemId),
        battle: {
          ...state.battle,
          log: [
            ...state.battle.log,
            { text: `Used ${item.name}! ${playerCreature.nickname} recovered ${healAmount} HP.`, type: 'info' },
          ],
        },
      };
    }

    case 'CATCH_CREATURE': {
      if (!state.battle || !state.battle.isWild || state.battle.phase !== 'selecting') return state;

      const itemEntry = state.inventory.find((e) => e.itemId === action.itemId);
      if (!itemEntry || itemEntry.quantity <= 0) {
        return addNotif(state, `You don't have any ${getItem(action.itemId).name}!`, 'error');
      }

      const item = getItem(action.itemId);
      const catchMult = item.effect.catchMultiplier ?? 1;
      const { enemyCreature } = state.battle;

      const success = calcCatchSuccess(enemyCreature, catchMult);

      let s = { ...state, inventory: removeInventory(state.inventory, action.itemId) };

      if (success) {
        const caught: OwnedCreature = {
          ...enemyCreature,
          uid: generateUid(),
          care: { hunger: 70, happiness: 70, energy: 80, health: 100 },
          isFavorite: false,
          caughtDay: state.day,
          isStarter: false,
        };
        s = {
          ...s,
          creatures: [...s.creatures, caught],
          stats: { ...s.stats, creaturesCollected: s.stats.creaturesCollected + 1 },
          battle: {
            ...s.battle!,
            phase: 'end',
            result: 'catch',
            log: [
              ...s.battle!.log,
              { text: `Gotcha! ${caught.nickname} was caught!`, type: 'catch' as const },
            ],
          },
        };
      } else {
        // Enemy counter-attacks after failed catch
        const playerCreature = s.creatures.find((c) => c.uid === s.battle!.playerCreatureId);
        let updatedCreatures = s.creatures;
        const newLog = [...s.battle!.log, { text: `Oh no! ${enemyCreature.nickname} broke free!`, type: 'system' as const }];

        if (playerCreature) {
          const counterMove = pickEnemyMove(enemyCreature, playerCreature);
          const dmg = calcDamage(enemyCreature, playerCreature, counterMove);
          if (!dmg.missed) {
            updatedCreatures = updateCreature(s.creatures, playerCreature.uid, (c) => ({
              ...c,
              currentHp: Math.max(0, c.currentHp - dmg.damage),
            }));
            newLog.push({ text: `Wild ${enemyCreature.nickname} used ${counterMove.name}! (−${dmg.damage} HP)`, type: 'damage' });
          }
        }

        s = { ...s, creatures: updatedCreatures, battle: { ...s.battle!, log: newLog } };
      }

      return s;
    }

    case 'FLEE_BATTLE': {
      return {
        ...state,
        battle: null,
        currentScreen: 'explore',
      };
    }

    case 'BUY_ITEM': {
      const item = getItem(action.itemId);
      const totalCost = item.cost * action.qty;
      if (state.gold < totalCost) {
        return addNotif(state, `Not enough gold! Need ${totalCost}g.`, 'error');
      }
      let s = {
        ...state,
        gold: state.gold - totalCost,
        inventory: addInventory(state.inventory, action.itemId, action.qty),
      };
      s = addNotif(s, `Bought ${action.qty}× ${item.name} for ${totalCost}g!`, 'success');
      return s;
    }

    case 'USE_ITEM_ON_CREATURE': {
      const itemEntry = state.inventory.find((e) => e.itemId === action.itemId);
      if (!itemEntry || itemEntry.quantity <= 0) return state;

      const item = getItem(action.itemId);
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;

      if (item.type === 'ball') {
        return addNotif(state, "Can't use balls outside of battle!", 'warning');
      }

      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        currentHp: item.effect.hp
          ? Math.min(c.maxHp, c.currentHp + item.effect.hp)
          : c.currentHp,
        care: {
          hunger: Math.min(100, c.care.hunger + (item.effect.hunger ?? 0)),
          happiness: Math.min(100, c.care.happiness + (item.effect.happiness ?? 0)),
          energy: Math.min(100, c.care.energy + (item.effect.energy ?? 0)),
          health: Math.min(100, c.care.health + (item.effect.health ?? 0)),
        },
      }));

      let s = {
        ...state,
        creatures: updatedCreatures,
        inventory: removeInventory(state.inventory, action.itemId),
      };
      s = addNotif(s, `Used ${item.name} on ${creature.nickname}!`, 'success');
      return s;
    }

    case 'SET_ACTIVE_CREATURE': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;
      return { ...state, activeCreatureId: action.creatureUid };
    }

    case 'NICKNAME_CREATURE': {
      const trimmed = action.nickname.trim().slice(0, 12);
      if (!trimmed) return state;
      return {
        ...state,
        creatures: updateCreature(state.creatures, action.creatureUid, (c) => ({
          ...c,
          nickname: trimmed,
        })),
      };
    }

    case 'TOGGLE_FAVORITE': {
      return {
        ...state,
        creatures: updateCreature(state.creatures, action.creatureUid, (c) => ({
          ...c,
          isFavorite: !c.isFavorite,
        })),
      };
    }

    case 'APPLY_EVOLUTION': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;

      const evolved = evolveCreature(creature);
      const updatedCreatures = state.creatures.map((c) => (c.uid === action.creatureUid ? evolved : c));
      let s = {
        ...state,
        creatures: updatedCreatures,
        stats: { ...state.stats, creaturesEvolved: state.stats.creaturesEvolved + 1 },
      };
      s = addNotif(s, `✨ ${creature.nickname} evolved into ${evolved.nickname}!`, 'success');
      return s;
    }

    case 'TICK': {
      const now = Date.now();
      const minutesPassed = (now - state.lastTickTime) / 60000;
      if (minutesPassed < 1) return state; // Don't tick if less than a minute has passed

      const updatedCreatures = state.creatures.map((c) =>
        applyTimeTick(c, minutesPassed),
      );

      // Unlock areas based on player level
      const playerLevel = getPlayerLevel(updatedCreatures);
      const newUnlocked = [...state.unlockedAreas];
      if (playerLevel >= 8 && !newUnlocked.includes('thunder_peak')) newUnlocked.push('thunder_peak');
      if (playerLevel >= 15 && !newUnlocked.includes('shadow_realm')) newUnlocked.push('shadow_realm');

      return {
        ...state,
        creatures: updatedCreatures,
        lastTickTime: now,
        unlockedAreas: newUnlocked,
      };
    }

    case 'ADD_NOTIF': {
      return addNotif(state, action.text, action.notifType);
    }

    case 'DISMISS_NOTIF': {
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    }

    case 'RESET_GAME': {
      localStorage.removeItem(SAVE_KEY);
      return makeInitialState();
    }

    default:
      return state;
  }
}

// Post-reducer: auto-check for evolution after state changes
function withEvolutionCheck(state: GameState): GameState {
  // Only check active creature for simplicity (or all creatures)
  let s = state;
  for (const creature of s.creatures) {
    const newTemplateId = checkEvolution(creature);
    if (newTemplateId) {
      // Trigger evolution automatically
      const evolved = evolveCreature(creature);
      s = {
        ...s,
        creatures: s.creatures.map((c) => (c.uid === creature.uid ? evolved : c)),
        stats: { ...s.stats, creaturesEvolved: s.stats.creaturesEvolved + 1 },
        notifications: [
          ...s.notifications.slice(-3),
          { id: generateUid(), text: `✨ ${creature.nickname} evolved into ${evolved.nickname}!`, type: 'success' as const },
        ],
      };
    }
  }
  return s;
}

function wrappedReducer(state: GameState, action: GameAction): GameState {
  let next = gameReducer(state, action);

  // Auto-save and check evolutions on most actions
  if (action.type !== 'TICK' && action.type !== 'ADD_NOTIF' && action.type !== 'DISMISS_NOTIF') {
    next = withEvolutionCheck(next);
  }

  saveState(next);
  return next;
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  activeCreature: OwnedCreature | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wrappedReducer, undefined, loadState);

  const activeCreature =
    state.creatures.find((c) => c.uid === state.activeCreatureId) ?? null;

  // Time tick every 30 seconds
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 30_000);
    dispatch({ type: 'TICK' }); // immediate tick on mount
    return () => clearInterval(id);
  }, []);

  // Auto-dismiss notifications after 3.5 seconds
  useEffect(() => {
    if (state.notifications.length === 0) return;
    const latest = state.notifications[state.notifications.length - 1];
    const timer = setTimeout(
      () => dispatch({ type: 'DISMISS_NOTIF', id: latest.id }),
      3500,
    );
    return () => clearTimeout(timer);
  }, [state.notifications]);

  return (
    <GameContext.Provider value={{ state, dispatch, activeCreature }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

// Convenience hook
export function useDispatch() {
  return useGame().dispatch;
}
