import { useState } from 'react';
import { useGame } from '../GameContext';
import { CREATURES, ITEMS } from '../gameData';
import { calcExpToNext } from '../gameLogic';
import { CreatureSprite } from '../components/CreatureSprite';

export function BattleScreen() {
  const { state, dispatch } = useGame();
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [showCatchMenu, setShowCatchMenu] = useState(false);

  const { battle } = state;

  // If no battle is active, just render nothing — CHANGE_SCREEN from App handles routing
  if (!battle) return null;

  const playerCreature = state.creatures.find((c) => c.uid === battle.playerCreatureId);
  if (!playerCreature) return null;

  const { enemyCreature } = battle;
  const playerTemplate = CREATURES[playerCreature.templateId];
  const enemyTemplate  = CREATURES[enemyCreature.templateId];

  const playerHpPct = Math.max(0, (playerCreature.currentHp / playerCreature.maxHp) * 100);
  const enemyHpPct  = Math.max(0, (enemyCreature.currentHp  / enemyCreature.maxHp)  * 100);
  const hpClass = (pct: number) => (pct > 50 ? 'high' : pct > 20 ? 'mid' : 'low');

  const isSelecting = battle.phase === 'selecting';
  const isOver      = battle.phase === 'end';

  // Items usable in battle
  const potions = state.inventory.filter((e) => {
    const item = ITEMS[e.itemId];
    return item && item.type === 'medicine' && (item.effect.hp ?? 0) > 0 && e.quantity > 0;
  });
  const balls = state.inventory.filter((e) => {
    const item = ITEMS[e.itemId];
    return item && item.type === 'ball' && e.quantity > 0;
  });

  const TYPE_GLOW: Record<string, string> = {
    fire: '#ff6b3550', water: '#4fc3f750', grass: '#66bb6a50',
    electric: '#ffd54f50', shadow: '#b39ddb50', normal: '#9e9e9e30',
  };

  return (
    <div className="battle-screen">
      {/* ── ARENA ─────────────────────────────────────────────────── */}
      <div className="battle-arena">

        {/* Enemy zone */}
        <div className="battle-enemy-zone">
          <div className="battle-name-row" style={{ alignSelf: 'flex-end', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>WILD</span>
            <span style={{ fontSize: 10 }}>{enemyCreature.nickname}</span>
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>Lv.{enemyCreature.level}</span>
            <span className={`type-badge type-${enemyTemplate.type}`}>{enemyTemplate.type}</span>
            {enemyCreature.statusEffect && (
              <span style={{ fontSize: 9 }}>
                {enemyCreature.statusEffect === 'burn' ? '🔥' : '⚡'}
              </span>
            )}
          </div>
          <div className="battle-hp-bar" style={{ flexDirection: 'row-reverse' }}>
            <div className="battle-hp-track" style={{ flex: 1 }}>
              <div
                className={`battle-hp-fill hp-fill ${hpClass(enemyHpPct)}`}
                style={{ width: `${enemyHpPct}%` }}
              />
            </div>
            <span style={{ fontSize: 7, color: 'var(--text-dim)', width: 52, textAlign: 'right' }}>
              {enemyCreature.currentHp}/{enemyCreature.maxHp}
            </span>
          </div>
          <div
            className="battle-sprite-enemy"
            style={{ filter: `drop-shadow(0 0 14px ${TYPE_GLOW[enemyTemplate.type] ?? ''})` }}
          >
            <CreatureSprite
              creatureId={enemyCreature.templateId}
              size={100}
              flipX
              style={{ animation: 'float 2.5s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* VS divider */}
        <div style={{ textAlign: 'center', fontSize: 7, color: 'var(--text-muted)', padding: '2px 0' }}>
          ⚔️ VS ⚔️
        </div>

        {/* Player zone */}
        <div className="battle-player-zone">
          <div
            className="battle-sprite-player"
            style={{ filter: `drop-shadow(0 0 14px ${TYPE_GLOW[playerTemplate.type] ?? ''})` }}
          >
            <CreatureSprite
              creatureId={playerCreature.templateId}
              size={80}
              style={{ animation: 'float 3s ease-in-out infinite 0.4s' }}
            />
          </div>
          <div className="battle-name-row" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10 }}>{playerCreature.nickname}</span>
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>Lv.{playerCreature.level}</span>
            {playerCreature.statusEffect && (
              <span style={{ fontSize: 9 }}>
                {playerCreature.statusEffect === 'burn' ? '🔥' : '⚡'}
              </span>
            )}
          </div>
          <div className="battle-hp-bar">
            <div className="battle-hp-track" style={{ flex: 1 }}>
              <div
                className={`battle-hp-fill hp-fill ${hpClass(playerHpPct)}`}
                style={{ width: `${playerHpPct}%` }}
              />
            </div>
            <span style={{ fontSize: 7, color: 'var(--text-dim)', width: 52 }}>
              {playerCreature.currentHp}/{playerCreature.maxHp}
            </span>
          </div>
          {/* EXP bar */}
          <div style={{ width: '100%', marginTop: 4 }}>
            <div style={{
              height: 4,
              background: 'var(--bg-primary)',
              borderRadius: 999,
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                height: '100%',
                width: `${(playerCreature.exp / calcExpToNext(playerCreature.level)) * 100}%`,
                background: 'var(--accent)',
                borderRadius: 999,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── BATTLE LOG ────────────────────────────────────────────── */}
      <div className="battle-log">
        {battle.log.length === 0 && (
          <div className="log-entry system">What will {playerCreature.nickname} do?</div>
        )}
        {battle.log.map((entry, i) => (
          <div key={i} className={`log-entry ${entry.type}`}>{entry.text}</div>
        ))}
      </div>

      {/* ── ACTIONS ───────────────────────────────────────────────── */}
      <div className="battle-actions">
        {!isOver && (
          <>
            {/* Move grid */}
            <div className="move-grid">
              {playerCreature.moves.map((move) => (
                <button
                  key={move.id}
                  className={`move-btn ${move.type}`}
                  disabled={!isSelecting || move.pp <= 0}
                  onClick={() => {
                    setShowItemMenu(false);
                    setShowCatchMenu(false);
                    dispatch({ type: 'BATTLE_MOVE', moveId: move.id });
                  }}
                >
                  <span className="move-name">{move.name}</span>
                  <span className="move-pp">PP {move.pp}/{move.maxPp}</span>
                </button>
              ))}
            </div>

            {/* Extra actions */}
            <div className="battle-extra-actions">

              {/* Item / Potion */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm btn-block"
                  disabled={!isSelecting || potions.length === 0}
                  onClick={() => { setShowCatchMenu(false); setShowItemMenu((v) => !v); }}
                >
                  💊 Item {potions.length === 0 ? '—' : `(${potions.reduce((a, e) => a + e.quantity, 0)})`}
                </button>
                {showItemMenu && (
                  <div style={{
                    position: 'absolute',
                    bottom: '110%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: 8,
                    zIndex: 60,
                  }}>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 6 }}>Use on {playerCreature.nickname}:</div>
                    {potions.map((entry) => {
                      const item = ITEMS[entry.itemId];
                      return (
                        <button
                          key={entry.itemId}
                          className="feed-item-btn"
                          style={{ width: '100%', marginBottom: 4 }}
                          onClick={() => {
                            dispatch({ type: 'BATTLE_USE_ITEM', itemId: entry.itemId });
                            setShowItemMenu(false);
                          }}
                        >
                          {item.emoji} {item.name}
                          <span style={{ color: 'var(--success)', fontSize: 6 }}>+{item.effect.hp} HP</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 6 }}>×{entry.quantity}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Catch */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-success btn-sm btn-block"
                  disabled={!isSelecting || !battle.isWild || balls.length === 0}
                  onClick={() => { setShowItemMenu(false); setShowCatchMenu((v) => !v); }}
                >
                  🔴 Catch {balls.length === 0 ? '—' : ''}
                </button>
                {showCatchMenu && balls.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '110%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: 8,
                    zIndex: 60,
                  }}>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 6 }}>Choose a ball:</div>
                    {balls.map((entry) => {
                      const item = ITEMS[entry.itemId];
                      const mult = item.effect.catchMultiplier ?? 1;
                      return (
                        <button
                          key={entry.itemId}
                          className="feed-item-btn"
                          style={{ width: '100%', marginBottom: 4 }}
                          onClick={() => {
                            dispatch({ type: 'CATCH_CREATURE', itemId: entry.itemId });
                            setShowCatchMenu(false);
                          }}
                        >
                          {item.emoji} {item.name}
                          <span style={{ color: 'var(--info)', fontSize: 6 }}>{mult}× rate</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 6 }}>×{entry.quantity}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Flee */}
              <button
                className="btn btn-danger btn-sm"
                disabled={!isSelecting}
                onClick={() => dispatch({ type: 'FLEE_BATTLE' })}
              >
                🏃 Run
              </button>
            </div>
          </>
        )}

        {/* ── BATTLE RESULT ───────────────────────────────────────── */}
        {isOver && (
          <div className="battle-result">
            <div className="battle-result-icon">
              {battle.result === 'win'   && '🏆'}
              {battle.result === 'lose'  && '💀'}
              {battle.result === 'flee'  && '🏃'}
              {battle.result === 'catch' && '🎉'}
            </div>
            <div className="battle-result-title">
              {battle.result === 'win'   && 'Victory!'}
              {battle.result === 'lose'  && 'Defeated…'}
              {battle.result === 'flee'  && 'Got away safely!'}
              {battle.result === 'catch' && `Caught ${enemyCreature.nickname}!`}
            </div>

            {battle.result === 'win' && (
              <div style={{
                display: 'flex', gap: 12, fontSize: 8, color: 'var(--text-dim)',
                alignItems: 'center',
              }}>
                <span>+{battle.expGained} EXP</span>
                <span style={{ color: 'var(--type-electric)' }}>+{battle.goldGained}g 💰</span>
              </div>
            )}

            {battle.result === 'catch' && (
              <div style={{ fontSize: 8, color: 'var(--text-dim)', textAlign: 'center' }}>
                <CreatureSprite creatureId={enemyCreature.templateId} size={60} style={{ marginBottom: 4 }} />
                <div>{enemyCreature.nickname} added to your party!</div>
              </div>
            )}

            {battle.result === 'lose' && (
              <div style={{ fontSize: 7, color: 'var(--text-muted)', textAlign: 'center' }}>
                Your creature fainted. Head to the Clinic to heal up.
              </div>
            )}

            {/* Last few log lines as summary */}
            <div className="battle-log" style={{ width: '100%', maxHeight: 72 }}>
              {battle.log.slice(-4).map((entry, i) => (
                <div key={i} className={`log-entry ${entry.type}`}>{entry.text}</div>
              ))}
            </div>

            {/* Continue — CHANGE_SCREEN clears battle state in the reducer */}
            <button
              className="btn btn-primary btn-lg"
              onClick={() =>
                dispatch({
                  type: 'CHANGE_SCREEN',
                  screen: battle.result === 'catch' ? 'collection' : 'explore',
                })
              }
            >
              Continue →
            </button>

            {battle.result === 'lose' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch({ type: 'CHANGE_SCREEN', screen: 'home' })}
              >
                Go to Home
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
