import { useState } from 'react';
import { useGame } from '../GameContext';
import { CREATURES, ITEMS } from '../gameData';
import { calcExpToNext } from '../gameLogic';

export function BattleScreen() {
  const { state, dispatch } = useGame();
  const [showItemMenu, setShowItemMenu] = useState(false);

  const { battle } = state;
  if (!battle) {
    dispatch({ type: 'CHANGE_SCREEN', screen: 'home' });
    return null;
  }

  const playerCreature = state.creatures.find((c) => c.uid === battle.playerCreatureId);
  const { enemyCreature } = battle;

  if (!playerCreature) {
    dispatch({ type: 'CHANGE_SCREEN', screen: 'home' });
    return null;
  }

  const playerTemplate = CREATURES[playerCreature.templateId];
  const enemyTemplate = CREATURES[enemyCreature.templateId];

  const playerHpPct = Math.max(0, (playerCreature.currentHp / playerCreature.maxHp) * 100);
  const enemyHpPct = Math.max(0, (enemyCreature.currentHp / enemyCreature.maxHp) * 100);
  const playerHpLevel = playerHpPct > 50 ? 'high' : playerHpPct > 20 ? 'mid' : 'low';
  const enemyHpLevel = enemyHpPct > 50 ? 'high' : enemyHpPct > 20 ? 'mid' : 'low';

  const battleItems = state.inventory.filter((e) => {
    const item = ITEMS[e.itemId];
    return item && item.type === 'medicine' && item.effect.hp && e.quantity > 0;
  });

  const catchItems = state.inventory.filter((e) => {
    const item = ITEMS[e.itemId];
    return item && item.type === 'ball' && e.quantity > 0;
  });

  const isSelecting = battle.phase === 'selecting';
  const isOver = battle.phase === 'end';

  function handleContinue() {
    dispatch({ type: 'CHANGE_SCREEN', screen: battle?.result === 'catch' ? 'collection' : 'explore' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dispatch as any)({ type: 'CLEAR_BATTLE' });
    // Reset battle in state
    dispatch({ type: 'CHANGE_SCREEN', screen: 'explore' });
  }

  return (
    <div className="battle-screen">
      {/* Arena */}
      <div className="battle-arena">

        {/* Enemy Zone */}
        <div className="battle-enemy-zone">
          <div className="battle-name-row" style={{ alignSelf: 'flex-end' }}>
            <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>WILD</span>
            <span style={{ fontSize: 10 }}>{enemyCreature.nickname}</span>
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>Lv.{enemyCreature.level}</span>
            <span className={`type-badge type-${enemyTemplate.type}`}>{enemyTemplate.type}</span>
            {enemyCreature.statusEffect && (
              <span style={{ fontSize: 7, color: 'var(--warning)' }}>
                {enemyCreature.statusEffect === 'burn' ? '🔥' : '⚡'}
              </span>
            )}
          </div>
          <div className="battle-hp-bar" style={{ flexDirection: 'row-reverse' }}>
            <div className="battle-hp-track" style={{ flex: 1 }}>
              <div
                className={`battle-hp-fill hp-fill ${enemyHpLevel}`}
                style={{ width: `${enemyHpPct}%` }}
              />
            </div>
            <span style={{ fontSize: 7, color: 'var(--text-dim)', width: 50, textAlign: 'right' }}>
              {enemyCreature.currentHp}/{enemyCreature.maxHp}
            </span>
          </div>
          <div className="battle-sprite-enemy">{enemyTemplate.emoji}</div>
        </div>

        {/* VS divider */}
        <div style={{ textAlign: 'center', fontSize: 7, color: 'var(--text-muted)', padding: '4px 0' }}>
          ⚔️ VS ⚔️
        </div>

        {/* Player Zone */}
        <div className="battle-player-zone">
          <div className="battle-sprite-player">{playerTemplate.emoji}</div>
          <div className="battle-name-row">
            <span style={{ fontSize: 10 }}>{playerCreature.nickname}</span>
            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>Lv.{playerCreature.level}</span>
            {playerCreature.statusEffect && (
              <span style={{ fontSize: 7, color: 'var(--warning)' }}>
                {playerCreature.statusEffect === 'burn' ? '🔥' : '⚡'}
              </span>
            )}
          </div>
          <div className="battle-hp-bar">
            <div className="battle-hp-track" style={{ flex: 1 }}>
              <div
                className={`battle-hp-fill hp-fill ${playerHpLevel}`}
                style={{ width: `${playerHpPct}%` }}
              />
            </div>
            <span style={{ fontSize: 7, color: 'var(--text-dim)', width: 50 }}>
              {playerCreature.currentHp}/{playerCreature.maxHp}
            </span>
          </div>
          {/* EXP bar */}
          <div style={{ width: '100%', marginTop: 4 }}>
            <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(playerCreature.exp / calcExpToNext(playerCreature.level)) * 100}%`,
                  background: 'var(--accent)',
                  borderRadius: 999,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="battle-log">
        {battle.log.map((entry, i) => (
          <div key={i} className={`log-entry ${entry.type}`}>
            {entry.text}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="battle-actions">
        {!isOver && (
          <>
            {/* Move buttons */}
            <div className="move-grid">
              {playerCreature.moves.map((move) => (
                <button
                  key={move.id}
                  className={`move-btn ${move.type}`}
                  disabled={!isSelecting || move.pp <= 0}
                  onClick={() => {
                    setShowItemMenu(false);
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
              {/* Items */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm btn-block"
                  disabled={!isSelecting || battleItems.length === 0}
                  onClick={() => setShowItemMenu((v) => !v)}
                >
                  💊 Item
                </button>
                {showItemMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: 8,
                      zIndex: 50,
                      marginBottom: 4,
                    }}
                  >
                    {battleItems.map((entry) => {
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
                          <span style={{ color: 'var(--text-muted)', fontSize: 6 }}>×{entry.quantity}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Catch */}
              <div style={{ position: 'relative' }}>
                {catchItems.length > 0 ? (
                  <div>
                    <button
                      className="btn btn-success btn-sm btn-block"
                      disabled={!isSelecting || !battle.isWild}
                      onClick={() => dispatch({ type: 'CATCH_CREATURE', itemId: catchItems[0].itemId })}
                    >
                      {ITEMS[catchItems[0].itemId].emoji} Catch
                    </button>
                    {catchItems.length > 1 && (
                      <div style={{ fontSize: 6, color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
                        {catchItems.length} types
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm btn-block"
                    disabled
                  >
                    🔴 Catch
                  </button>
                )}
              </div>

              {/* Run */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => dispatch({ type: 'FLEE_BATTLE' })}
                disabled={!isSelecting}
              >
                🏃 Run
              </button>
            </div>
          </>
        )}

        {isOver && (
          <div className="battle-result">
            <div className="battle-result-icon">
              {battle.result === 'win' && '🏆'}
              {battle.result === 'lose' && '💀'}
              {battle.result === 'flee' && '🏃'}
              {battle.result === 'catch' && '🎉'}
            </div>
            <div className="battle-result-title">
              {battle.result === 'win' && 'Victory!'}
              {battle.result === 'lose' && 'Defeated...'}
              {battle.result === 'flee' && 'Escaped!'}
              {battle.result === 'catch' && 'Caught!'}
            </div>
            {battle.result === 'win' && (
              <div style={{ fontSize: 8, color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <span>+{battle.expGained} EXP</span>
                <span style={{ color: 'var(--type-electric)' }}>+{battle.goldGained} gold 💰</span>
              </div>
            )}
            {battle.result === 'catch' && (
              <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>
                {battle.enemyCreature.nickname} added to your party!
              </div>
            )}
            {battle.result === 'lose' && (
              <div style={{ fontSize: 7, color: 'var(--text-muted)' }}>
                Head to the clinic to heal up.
              </div>
            )}
            <div className="battle-log" style={{ width: '100%', maxHeight: 80 }}>
              {battle.log.slice(-4).map((entry, i) => (
                <div key={i} className={`log-entry ${entry.type}`}>{entry.text}</div>
              ))}
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => dispatch({ type: 'CHANGE_SCREEN', screen: 'explore' })}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
