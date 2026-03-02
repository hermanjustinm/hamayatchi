import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  GameState,
  OwnedCreature,
  BattleState,
  BattleLogEntry,
  GameNotification,
  GameScreen,
  PendingMoveLearn,
  DailyQuest,
  QuestType,
  Expedition,
  ExpeditionTier,
} from './types';
import { CREATURES, ITEMS, AREAS, MOVES } from './gameData';
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
  calcMaxHp,
  calcStat,
  getCareBattleModifier,
  checkNewLevelUpMoves,
  generateDailyQuests,
  updateQuestProgress,
  calcExpeditionReward,
  calcPassiveGold,
} from './gameLogic';

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const SAVE_KEY = 'hamayatchi_v2';

const DEFAULT_INVENTORY = [
  { itemId: 'berry', quantity: 5 },
  { itemId: 'medicine', quantity: 2 },
  { itemId: 'lureball', quantity: 3 },
  { itemId: 'ether', quantity: 1 },
  { itemId: 'bitterberry', quantity: 2 },
];

function makeInitialState(): GameState {
  return {
    version: 2,
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
    seenCreatures: [],
    pendingMoveLearn: [],
    dailyQuests: [],
    questDate: '',
    expeditions: [],
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<GameState>;
      return {
        ...makeInitialState(),
        ...saved,
        // Ensure new fields exist even in old saves
        seenCreatures: saved.seenCreatures ?? [],
        pendingMoveLearn: saved.pendingMoveLearn ?? [],
        dailyQuests: saved.dailyQuests ?? [],
        questDate: saved.questDate ?? '',
        expeditions: saved.expeditions ?? [],
      };
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
  | { type: 'LEARN_MOVE'; creatureUid: string; moveId: string; replaceMoveId: string | null }
  | { type: 'SKIP_MOVE_LEARN' }
  | { type: 'CLAIM_QUEST_REWARD'; questId: string }
  | { type: 'SELL_ITEM'; itemId: string; qty: number }
  | { type: 'HEAL_PARTY_AT_CLINIC' }
  | { type: 'START_EXPEDITION'; creatureUid: string; areaId: string; tier: ExpeditionTier }
  | { type: 'COLLECT_EXPEDITION'; expeditionUid: string }
  | { type: 'CANCEL_EXPEDITION'; expeditionUid: string }
  | { type: 'QUICK_BATTLE'; areaId: string }
  | { type: 'TICK' }
  | { type: 'ADD_NOTIF'; text: string; notifType: GameNotification['type'] }
  | { type: 'DISMISS_NOTIF'; id: string }
  | { type: 'HEAL_AT_CLINIC'; creatureUid: string }
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

function advanceQuests(state: GameState, type: QuestType, increment = 1): GameState {
  if (state.dailyQuests.length === 0) return state;
  return { ...state, dailyQuests: updateQuestProgress(state.dailyQuests, type, increment) };
}

function addSeen(state: GameState, templateId: string): GameState {
  if (state.seenCreatures.includes(templateId)) return state;
  return { ...state, seenCreatures: [...state.seenCreatures, templateId] };
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
        seenCreatures: [template.id],
        stats: { ...state.stats, creaturesCollected: 1 },
      };
    }

    case 'CHANGE_SCREEN': {
      let updatedCreatures = state.creatures;
      // Restore PP when leaving a completed battle (win or catch) as a reward
      if (
        state.battle &&
        action.screen !== 'battle' &&
        (state.battle.result === 'win' || state.battle.result === 'catch')
      ) {
        updatedCreatures = updateCreature(state.creatures, state.battle.playerCreatureId, (c) => ({
          ...c,
          moves: c.moves.map((m) => ({ ...m, pp: m.maxPp })),
        }));
      }
      return {
        ...state,
        currentScreen: action.screen,
        creatures: updatedCreatures,
        battle: action.screen !== 'battle' ? null : state.battle,
      };
    }

    case 'HEAL_AT_CLINIC': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;

      if (creature.currentHp === creature.maxHp && creature.statusEffect === null) {
        return addNotif(state, `${creature.nickname} is already at full health!`, 'info');
      }

      const hpMissing = creature.maxHp - creature.currentHp;
      const statusPenalty = creature.statusEffect ? 30 : 0;
      const cost = Math.max(20, Math.ceil(hpMissing * 0.5) + statusPenalty);

      if (state.gold < cost) {
        return addNotif(state, `Clinic costs ${cost}g — not enough gold!`, 'error');
      }

      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        currentHp: c.maxHp,
        statusEffect: null,
        moves: c.moves.map((m) => ({ ...m, pp: m.maxPp })), // restore PP
        care: { ...c.care, health: 100 },
      }));

      return addNotif(
        { ...state, creatures: updatedCreatures, gold: state.gold - cost },
        `${creature.nickname} fully healed + PP restored! (−${cost}g)`,
        'success',
      );
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
      s = advanceQuests(s, 'feed');
      s = addNotif(s, `${creature.nickname} ate the ${item.name}!`, 'success');
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
      s = advanceQuests(s, 'play');
      s = addNotif(s, `${creature.nickname} had a great time playing! 🎮`, 'success');
      return s;
    }

    case 'PUT_TO_SLEEP': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;
      if (creature.currentHp <= 0) {
        return addNotif(state, `${creature.nickname} is fainted! Use a Revive first.`, 'error');
      }
      // Restore energy + HP proportional to how healthy the creature is
      const hpRestore = Math.max(5, Math.floor(creature.maxHp * 0.20 * (creature.care.health / 100)));
      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        currentHp: Math.min(c.maxHp, c.currentHp + hpRestore),
        care: { ...c.care, energy: 100 },
      }));
      let s = { ...state, creatures: updatedCreatures };
      s = addNotif(s, `${creature.nickname} rested! Energy full, +${hpRestore} HP recovered. 😴`, 'info');
      return s;
    }

    case 'START_EXPLORE_BATTLE': {
      const area = AREAS.find((a) => a.id === action.areaId);
      if (!area) return state;

      const activeCreature = state.creatures.find((c) => c.uid === state.activeCreatureId);
      if (!activeCreature || activeCreature.currentHp <= 0) {
        return addNotif(state, 'Your active creature has fainted! Heal first.', 'error');
      }
      // Can't manually battle while on expedition
      if (state.expeditions.some((e) => e.creatureUid === activeCreature.uid && !e.collected)) {
        return addNotif(state, `${activeCreature.nickname} is on an expedition! Switch active creature or recall them.`, 'warning');
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

      // Track seen creature
      const s = addSeen(state, wildTemplateId);
      return { ...s, battle, currentScreen: 'battle' };
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
      const careMod = getCareBattleModifier(freshPlayer.care);

      if (isParalyzed(freshPlayer)) {
        logEntries.push({ text: `${freshPlayer.nickname} is paralyzed and can't move!`, type: 'effect' });
      } else if (careMod.skipChance > 0 && Math.random() < careMod.skipChance) {
        logEntries.push({ text: `${freshPlayer.nickname} is too exhausted to attack!`, type: 'effect' });
      } else {
        const dmgResult = calcDamage(freshPlayer, enemyCreature, move);
        const finalDamage = Math.max(1, Math.floor(dmgResult.damage * careMod.attackMod));

        if (dmgResult.missed) {
          logEntries.push({ text: `${freshPlayer.nickname} used ${move.name}... but it missed!`, type: 'damage' });
        } else {
          enemyCreature = { ...enemyCreature, currentHp: Math.max(0, enemyCreature.currentHp - finalDamage) };
          logEntries.push({
            text: `${freshPlayer.nickname} used ${move.name}! (−${finalDamage} HP)${dmgResult.isCrit ? ' Critical hit!' : ''}`,
            type: 'damage',
          });
          const effectLabel = getEffectivenessLabel(dmgResult.effectiveness);
          if (effectLabel) logEntries.push({ text: effectLabel, type: 'effect' });

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

        const { creature: leveled, levelsGained } = applyExpGain(freshPlayer, expGained);
        updatedCreatures = updatedCreatures.map((c) => (c.uid === leveled.uid ? leveled : c));
        if (levelsGained > 0) {
          logEntries.push({ text: `${leveled.nickname} reached Level ${leveled.level}!`, type: 'exp' });
        }

        // Check for new level-up moves
        let newPendingMoves: PendingMoveLearn[] = [...state.pendingMoveLearn];
        if (levelsGained > 0) {
          const alreadyPendingIds = new Set(
            state.pendingMoveLearn
              .filter((p) => p.creatureUid === leveled.uid)
              .map((p) => p.moveId),
          );
          const newMoveIds = checkNewLevelUpMoves(leveled).filter(
            (id) => !alreadyPendingIds.has(id),
          );
          newPendingMoves = [
            ...newPendingMoves,
            ...newMoveIds.map((moveId) => ({ creatureUid: leveled.uid, moveId })),
          ];
        }

        let newState: GameState = {
          ...state,
          creatures: updatedCreatures,
          gold: state.gold + goldGained,
          pendingMoveLearn: newPendingMoves,
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
        newState = advanceQuests(newState, 'battle_win');
        return newState;
      }

      // ─── Enemy attacks ────────────────────────────────────────────────────
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
        // Apply player's defense care modifier (sick player takes more damage)
        const finalEDmg = Math.max(1, Math.floor(eDmg.damage / careMod.defenseMod));

        if (eDmg.missed) {
          logEntries.push({ text: `Wild ${enemyCreature.nickname} used ${enemyMove.name}... but it missed!`, type: 'damage' });
        } else {
          currentPlayer = {
            ...currentPlayer,
            currentHp: Math.max(0, currentPlayer.currentHp - finalEDmg),
          };
          updatedCreatures = updatedCreatures.map((c) => (c.uid === currentPlayer.uid ? currentPlayer : c));
          logEntries.push({
            text: `Wild ${enemyCreature.nickname} used ${enemyMove.name}! (−${finalEDmg} HP)${eDmg.isCrit ? ' Critical hit!' : ''}`,
            type: 'damage',
          });
          const effectLabel = getEffectivenessLabel(eDmg.effectiveness);
          if (effectLabel) logEntries.push({ text: effectLabel, type: 'effect' });

          if (enemyMove.statusEffect && Math.random() * 100 < enemyMove.statusEffect.chance && !currentPlayer.statusEffect) {
            const updatedWithStatus = { ...currentPlayer, statusEffect: enemyMove.statusEffect.type };
            updatedCreatures = updatedCreatures.map((c) => (c.uid === currentPlayer.uid ? updatedWithStatus : c));
            logEntries.push({ text: `${currentPlayer.nickname} is now ${enemyMove.statusEffect.type}ed!`, type: 'effect' });
          }
        }
      }

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
        return {
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

      const battle = state.battle!;
      let s: GameState = {
        ...state,
        creatures: updatedCreatures,
        inventory: removeInventory(state.inventory, action.itemId),
        battle: {
          ...battle,
          log: [
            ...battle.log,
            { text: `Used ${item.name}! ${playerCreature.nickname} recovered ${healAmount} HP.`, type: 'info' as const },
          ],
        },
      };
      s = advanceQuests(s, 'use_potion');
      return s;
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
          seenCreatures: s.seenCreatures.includes(enemyCreature.templateId)
            ? s.seenCreatures
            : [...s.seenCreatures, enemyCreature.templateId],
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
        s = advanceQuests(s, 'catch');
      } else {
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
      // Partial PP restore on flee — enough to keep going, not a free reward
      let updatedCreatures = state.creatures;
      if (state.battle) {
        updatedCreatures = updateCreature(state.creatures, state.battle.playerCreatureId, (c) => ({
          ...c,
          moves: c.moves.map((m) => ({ ...m, pp: Math.min(m.maxPp, m.pp + Math.ceil(m.maxPp * 0.3)) })),
        }));
      }
      return { ...state, battle: null, currentScreen: 'explore', creatures: updatedCreatures };
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

      // ── Rare Candy: grant one level ──
      if (item.effect.levelUp) {
        if (creature.level >= 50) {
          return addNotif(state, `${creature.nickname} is already at max level!`, 'warning');
        }
        const tmpl = CREATURES[creature.templateId];
        const newLevel = creature.level + 1;
        const newMaxHp = calcMaxHp(tmpl.baseStats.hp, newLevel);
        const hpIncrease = newMaxHp - creature.maxHp;
        const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
          ...c,
          level: newLevel,
          maxHp: newMaxHp,
          currentHp: Math.min(newMaxHp, c.currentHp + hpIncrease),
          attack: calcStat(tmpl.baseStats.attack, newLevel),
          defense: calcStat(tmpl.baseStats.defense, newLevel),
          speed: calcStat(tmpl.baseStats.speed, newLevel),
        }));

        // Check for new level-up moves after the candy
        const updatedCreature = updatedCreatures.find((c) => c.uid === action.creatureUid)!;
        const alreadyPendingIds = new Set(
          state.pendingMoveLearn.filter((p) => p.creatureUid === updatedCreature.uid).map((p) => p.moveId),
        );
        const newMoveIds = checkNewLevelUpMoves(updatedCreature).filter((id) => !alreadyPendingIds.has(id));
        const newPending = [
          ...state.pendingMoveLearn,
          ...newMoveIds.map((moveId) => ({ creatureUid: updatedCreature.uid, moveId })),
        ];

        let s = {
          ...state,
          creatures: updatedCreatures,
          inventory: removeInventory(state.inventory, action.itemId),
          pendingMoveLearn: newPending,
        };
        s = addNotif(s, `${creature.nickname} leveled up to Lv. ${newLevel}! 🍭`, 'success');
        return s;
      }

      // ── Revive-only items (Bitter Berry, etc.) ──
      if (item.effect.onlyFainted) {
        if (creature.currentHp > 0) {
          return addNotif(state, `${creature.nickname} isn't fainted!`, 'warning');
        }
        const reviveHp = item.effect.revivePercent !== undefined
          ? Math.max(1, Math.floor(creature.maxHp * item.effect.revivePercent / 100))
          : 1;
        const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
          ...c,
          currentHp: reviveHp,
          statusEffect: null,
          care: {
            ...c.care,
            health: Math.min(100, c.care.health + (item.effect.health ?? 0)),
          },
        }));
        let s = {
          ...state,
          creatures: updatedCreatures,
          inventory: removeInventory(state.inventory, action.itemId),
        };
        s = addNotif(s, `${creature.nickname} revived to ${reviveHp} HP! 🍋`, 'success');
        return s;
      }

      // ── HP-only items shouldn't be wasted on healthy creatures ──
      if (item.effect.hp && !item.effect.health && !item.effect.cureStatus && !item.effect.restorePp) {
        if (creature.currentHp >= creature.maxHp) {
          return addNotif(state, `${creature.nickname} is already at full HP!`, 'info');
        }
      }

      // ── Standard item application ──
      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        currentHp: item.effect.hp ? Math.min(c.maxHp, c.currentHp + item.effect.hp) : c.currentHp,
        statusEffect: item.effect.cureStatus ? null : c.statusEffect,
        moves: item.effect.restorePp ? c.moves.map((m) => ({ ...m, pp: m.maxPp })) : c.moves,
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

    case 'LEARN_MOVE': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;
      if (!MOVES[action.moveId]) return state;

      const newMove = { ...MOVES[action.moveId] };
      let updatedMoves = creature.moves.slice();

      if (action.replaceMoveId === null) {
        // Auto-learn (creature has < 4 moves)
        updatedMoves = [...updatedMoves, newMove];
      } else {
        // Replace chosen move
        updatedMoves = updatedMoves.map((m) => (m.id === action.replaceMoveId ? newMove : m));
      }

      const updatedCreatures = updateCreature(state.creatures, action.creatureUid, (c) => ({
        ...c,
        moves: updatedMoves,
      }));

      // Remove first pending entry (the one just resolved)
      const newPending = state.pendingMoveLearn.slice(1);

      let s = { ...state, creatures: updatedCreatures, pendingMoveLearn: newPending };
      s = addNotif(s, `${creature.nickname} learned ${newMove.name}!`, 'success');
      return s;
    }

    case 'SKIP_MOVE_LEARN': {
      return { ...state, pendingMoveLearn: state.pendingMoveLearn.slice(1) };
    }

    case 'CLAIM_QUEST_REWARD': {
      const quest = state.dailyQuests.find((q) => q.id === action.questId);
      if (!quest || !quest.completed || quest.claimed) return state;

      let s = {
        ...state,
        dailyQuests: state.dailyQuests.map((q) =>
          q.id === action.questId ? { ...q, claimed: true } : q,
        ),
        gold: state.gold + (quest.reward.gold ?? 0),
      };

      if (quest.reward.itemId) {
        s = { ...s, inventory: addInventory(s.inventory, quest.reward.itemId, quest.reward.qty ?? 1) };
      }

      const rewardStr = quest.reward.gold
        ? `${quest.reward.gold}g`
        : `${quest.reward.qty}× ${ITEMS[quest.reward.itemId!]?.name ?? '?'}`;
      s = addNotif(s, `Quest complete! Reward: ${rewardStr} 🏆`, 'success');
      return s;
    }

    case 'SELL_ITEM': {
      const itemEntry = state.inventory.find((e) => e.itemId === action.itemId);
      if (!itemEntry || itemEntry.quantity < action.qty) return state;
      const item = getItem(action.itemId);
      const sellPrice = Math.max(1, Math.floor(item.cost * 0.5)) * action.qty;
      let s: GameState = {
        ...state,
        gold: state.gold + sellPrice,
        inventory: removeInventory(state.inventory, action.itemId, action.qty),
      };
      s = addNotif(s, `Sold ${action.qty}× ${item.name} for ${sellPrice}g`, 'success');
      return s;
    }

    case 'START_EXPEDITION': {
      const creature = state.creatures.find((c) => c.uid === action.creatureUid);
      if (!creature) return state;
      if (creature.currentHp <= 0) {
        return addNotif(state, `${creature.nickname} is fainted and can't go on an expedition!`, 'error');
      }
      if (state.expeditions.some((e) => e.creatureUid === action.creatureUid && !e.collected)) {
        return addNotif(state, `${creature.nickname} is already on an expedition!`, 'error');
      }
      const durations: Record<ExpeditionTier, number> = {
        quick:     15 * 60 * 1000,
        standard:  60 * 60 * 1000,
        long:      4 * 60 * 60 * 1000,
        overnight: 8 * 60 * 60 * 1000,
      };
      const expedition: Expedition = {
        uid: generateUid(),
        creatureUid: action.creatureUid,
        areaId: action.areaId,
        startTime: Date.now(),
        durationMs: durations[action.tier],
        tier: action.tier,
        collected: false,
      };
      const tierLabels: Record<ExpeditionTier, string> = {
        quick: '15-min', standard: '1-hr', long: '4-hr', overnight: '8-hr',
      };
      return addNotif(
        { ...state, expeditions: [...state.expeditions, expedition] },
        `${creature.nickname} set off on a ${tierLabels[action.tier]} expedition! 🧭`,
        'info',
      );
    }

    case 'COLLECT_EXPEDITION': {
      const expedition = state.expeditions.find((e) => e.uid === action.expeditionUid);
      if (!expedition || expedition.collected) return state;
      if (Date.now() < expedition.startTime + expedition.durationMs) {
        return addNotif(state, "They're not back yet! Check the timer.", 'warning');
      }

      const creature = state.creatures.find((c) => c.uid === expedition.creatureUid);
      if (!creature) return state;

      const area = AREAS.find((a) => a.id === expedition.areaId);
      if (!area) return state;

      const reward = calcExpeditionReward(creature, area, expedition.tier);

      // Apply EXP
      const { creature: leveled, levelsGained } = applyExpGain(creature, reward.exp);
      // Expedition drains hunger/energy slightly, but makes creature happy to be back
      const returnedCreature: OwnedCreature = {
        ...leveled,
        care: {
          ...leveled.care,
          hunger:    Math.max(0, leveled.care.hunger - 15),
          energy:    Math.max(0, leveled.care.energy - 12),
          happiness: Math.min(100, leveled.care.happiness + 8),
        },
      };
      let updatedCreatures = state.creatures.map((c) =>
        c.uid === expedition.creatureUid ? returnedCreature : c,
      );

      // Add item rewards
      let updatedInventory = state.inventory;
      for (const { itemId, qty } of reward.items) {
        updatedInventory = addInventory(updatedInventory, itemId, qty);
      }

      // Check level-up moves
      let newPendingMoves = [...state.pendingMoveLearn];
      if (levelsGained > 0) {
        const alreadyIds = new Set(
          state.pendingMoveLearn.filter((p) => p.creatureUid === leveled.uid).map((p) => p.moveId),
        );
        const newIds = checkNewLevelUpMoves(leveled).filter((id) => !alreadyIds.has(id));
        newPendingMoves = [...newPendingMoves, ...newIds.map((moveId) => ({ creatureUid: leveled.uid, moveId }))];
      }

      let s: GameState = {
        ...state,
        creatures: updatedCreatures,
        gold: state.gold + reward.gold,
        inventory: updatedInventory,
        pendingMoveLearn: newPendingMoves,
        expeditions: state.expeditions.map((e) =>
          e.uid === expedition.uid ? { ...e, collected: true } : e,
        ),
      };

      if (levelsGained > 0) {
        s = addNotif(s, `${leveled.nickname} leveled up to Lv.${leveled.level}! 🎉`, 'success');
      }

      const itemsStr = reward.items.length > 0
        ? ` Found: ${reward.items.map((i) => `${i.qty}× ${ITEMS[i.itemId]?.name ?? '?'}`).join(', ')}!`
        : '';
      s = addNotif(s, `${reward.message} +${reward.gold}g, +${reward.exp} EXP.${itemsStr}`, 'success');
      s = advanceQuests(s, 'expedition_complete');
      return s;
    }

    case 'CANCEL_EXPEDITION': {
      const expedition = state.expeditions.find((e) => e.uid === action.expeditionUid);
      if (!expedition || expedition.collected) return state;
      const creature = state.creatures.find((c) => c.uid === expedition.creatureUid);
      return addNotif(
        { ...state, expeditions: state.expeditions.filter((e) => e.uid !== expedition.uid) },
        `${creature?.nickname ?? 'Creature'} recalled from expedition — no reward.`,
        'info',
      );
    }

    case 'QUICK_BATTLE': {
      const area = AREAS.find((a) => a.id === action.areaId);
      if (!area) return state;

      const activeCreature = state.creatures.find((c) => c.uid === state.activeCreatureId);
      if (!activeCreature || activeCreature.currentHp <= 0) {
        return addNotif(state, 'Need a healthy active creature to quick battle!', 'error');
      }
      if (activeCreature.care.energy < 20) {
        return addNotif(state, `${activeCreature.nickname} is too tired for a quick battle! Let them rest.`, 'warning');
      }
      if (state.expeditions.some((e) => e.creatureUid === activeCreature.uid && !e.collected)) {
        return addNotif(state, `${activeCreature.nickname} is on an expedition!`, 'warning');
      }

      // Success chance: 60% base, ±4% per level vs area midpoint
      const areaAvgLevel = (area.levelRange[0] + area.levelRange[1]) / 2;
      const levelAdv = activeCreature.level - areaAvgLevel;
      const successChance = Math.max(0.25, Math.min(0.90, 0.60 + levelAdv * 0.04));
      const won = Math.random() < successChance;

      const goldGain = won ? Math.floor(area.levelRange[1] * 9 + Math.random() * 25) : 0;
      const baseExp = calcExpGain(Math.floor(areaAvgLevel), true);
      const expGain = won ? baseExp : Math.floor(baseExp * 0.2);

      // HP cost: 10–25% on win, 25–45% on loss
      const hpCostPct = won ? 0.10 + Math.random() * 0.15 : 0.25 + Math.random() * 0.20;
      const hpCost = Math.max(1, Math.floor(activeCreature.maxHp * hpCostPct));
      const energyCost = 20 + Math.floor(Math.random() * 10);

      const { creature: leveled, levelsGained } = applyExpGain(activeCreature, expGain);
      const updatedActive: OwnedCreature = {
        ...leveled,
        currentHp: Math.max(1, leveled.currentHp - hpCost),
        care: { ...leveled.care, energy: Math.max(0, leveled.care.energy - energyCost) },
      };
      let updatedCreatures = state.creatures.map((c) =>
        c.uid === activeCreature.uid ? updatedActive : c,
      );

      let s: GameState = {
        ...state,
        creatures: updatedCreatures,
        gold: state.gold + goldGain,
        stats: {
          ...state.stats,
          battlesWon:  won ? state.stats.battlesWon + 1  : state.stats.battlesWon,
          battlesLost: won ? state.stats.battlesLost     : state.stats.battlesLost + 1,
        },
      };

      // Level-up moves from quick battle
      if (levelsGained > 0) {
        const alreadyIds = new Set(
          state.pendingMoveLearn.filter((p) => p.creatureUid === leveled.uid).map((p) => p.moveId),
        );
        const newIds = checkNewLevelUpMoves(leveled).filter((id) => !alreadyIds.has(id));
        s = { ...s, pendingMoveLearn: [...s.pendingMoveLearn, ...newIds.map((moveId) => ({ creatureUid: leveled.uid, moveId }))] };
        s = addNotif(s, `${leveled.nickname} leveled up to Lv.${leveled.level}! 🎉`, 'success');
      }

      const result = won
        ? `⚡ Quick Battle: Won! +${goldGain}g, +${expGain} EXP (−${hpCost} HP)`
        : `💀 Quick Battle: Lost! +${expGain} EXP (−${hpCost} HP)`;
      s = addNotif(s, result, won ? 'success' : 'warning');
      if (won) {
        s = advanceQuests(s, 'battle_win');
        s = advanceQuests(s, 'quick_battle');
      }
      return s;
    }

    case 'HEAL_PARTY_AT_CLINIC': {
      const needsHealing = state.creatures.filter(
        (c) => c.currentHp < c.maxHp || c.statusEffect !== null,
      );
      if (needsHealing.length === 0) {
        return addNotif(state, 'Your whole party is already healthy!', 'info');
      }

      const totalCost = needsHealing.reduce((sum, c) => {
        const hpMissing = c.maxHp - c.currentHp;
        const statusPenalty = c.statusEffect ? 30 : 0;
        return sum + Math.max(20, Math.ceil(hpMissing * 0.5) + statusPenalty);
      }, 0);

      if (state.gold < totalCost) {
        return addNotif(state, `Party heal costs ${totalCost}g — not enough gold!`, 'error');
      }

      const updatedCreatures = state.creatures.map((c) => ({
        ...c,
        currentHp: c.maxHp,
        statusEffect: null as typeof c.statusEffect,
        moves: c.moves.map((m) => ({ ...m, pp: m.maxPp })),
        care: { ...c.care, health: 100 },
      }));

      let s: GameState = { ...state, creatures: updatedCreatures, gold: state.gold - totalCost };
      s = addNotif(s, `Whole party healed + PP restored! (−${totalCost}g)`, 'success');
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

      const updatedCreatures = minutesPassed >= 1
        ? state.creatures.map((c) => applyTimeTick(c, minutesPassed))
        : state.creatures;

      const playerLevel = getPlayerLevel(updatedCreatures);
      const newUnlocked = [...state.unlockedAreas];
      if (playerLevel >= 8 && !newUnlocked.includes('thunder_peak')) newUnlocked.push('thunder_peak');
      if (playerLevel >= 15 && !newUnlocked.includes('shadow_realm')) newUnlocked.push('shadow_realm');

      // Refresh daily quests if the calendar day changed
      const today = new Date().toDateString();
      const newQuests = today !== state.questDate ? generateDailyQuests(today) : state.dailyQuests;
      const newQuestDate = today !== state.questDate ? today : state.questDate;

      // Passive gold from happy party members — scales with level and happiness
      const passiveGoldRate = calcPassiveGold(updatedCreatures); // g per hour
      const passiveGold = minutesPassed >= 1
        ? Math.floor(passiveGoldRate * minutesPassed / 60)
        : 0;

      // Emergency bailout: if all creatures are fainted AND near-broke, give 30g
      const allFainted =
        updatedCreatures.length > 0 && updatedCreatures.every((c) => c.currentHp <= 0);
      const emergencyGold = allFainted && state.gold + passiveGold < 20 ? 30 : 0;

      // Prune very old collected expeditions (keep last 10 max)
      const activeExpeditions = state.expeditions.filter((e) => !e.collected);
      const recentCollected = state.expeditions.filter((e) => e.collected).slice(-5);
      const prunedExpeditions = [...activeExpeditions, ...recentCollected];

      let nextState: GameState = {
        ...state,
        creatures: updatedCreatures,
        gold: state.gold + passiveGold + emergencyGold,
        lastTickTime: minutesPassed >= 1 ? now : state.lastTickTime,
        unlockedAreas: newUnlocked,
        dailyQuests: newQuests,
        questDate: newQuestDate,
        expeditions: prunedExpeditions,
      };

      if (emergencyGold > 0) {
        nextState = addNotif(
          nextState,
          `A kind traveler took pity and gave you ${emergencyGold}g! Use the clinic to revive your creatures.`,
          'info',
        );
      }

      return nextState;
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

// Post-reducer: auto-check for evolution
function withEvolutionCheck(state: GameState): GameState {
  let s = state;
  for (const creature of s.creatures) {
    const newTemplateId = checkEvolution(creature);
    if (newTemplateId) {
      const evolved = evolveCreature(creature);
      s = {
        ...s,
        creatures: s.creatures.map((c) => (c.uid === creature.uid ? evolved : c)),
        // Clear pending moves for this creature — evolution replaces the moveset
        pendingMoveLearn: s.pendingMoveLearn.filter((p) => p.creatureUid !== creature.uid),
        stats: { ...s.stats, creaturesEvolved: s.stats.creaturesEvolved + 1 },
        notifications: [
          ...s.notifications.slice(-3),
          {
            id: generateUid(),
            text: `✨ ${creature.nickname} evolved into ${evolved.nickname}!`,
            type: 'success' as const,
          },
        ],
      };
    }
  }
  return s;
}

function wrappedReducer(state: GameState, action: GameAction): GameState {
  let next = gameReducer(state, action);

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
    dispatch({ type: 'TICK' }); // immediate tick on mount to refresh quests
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

export function useDispatch() {
  return useGame().dispatch;
}

// Re-export action type for use in components
export type { GameAction };
