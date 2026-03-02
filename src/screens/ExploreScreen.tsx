import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { AREAS, CREATURES, ITEMS } from '../gameData';
import { getPlayerLevel, calcPassiveGold } from '../gameLogic';
import { BottomNav } from '../components/BottomNav';
import { CreatureSprite } from '../components/CreatureSprite';
import type { ExpeditionTier } from '../types';

const TIER_INFO: Record<ExpeditionTier, { label: string; duration: string; emoji: string; durationMs: number }> = {
  quick:     { label: 'Quick',     duration: '15 min', emoji: '⚡', durationMs: 15 * 60 * 1000 },
  standard:  { label: 'Standard',  duration: '1 hr',   emoji: '🌤️', durationMs: 60 * 60 * 1000 },
  long:      { label: 'Long',      duration: '4 hr',   emoji: '🌙', durationMs: 4 * 60 * 60 * 1000 },
  overnight: { label: 'Overnight', duration: '8 hr',   emoji: '⭐', durationMs: 8 * 60 * 60 * 1000 },
};

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'Ready!';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m left` : `${hrs}h left`;
}

export function ExploreScreen() {
  const { state, activeCreature, dispatch } = useGame();
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [expedCreature, setExpedCreature] = useState<Record<string, string>>({}); // areaId → creatureUid
  const [now, setNow] = useState(Date.now());

  // Refresh countdown timers every 10 s
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const playerLevel = getPlayerLevel(state.creatures);
  const activeExpeditions = state.expeditions.filter((e) => !e.collected);

  // Creatures available for expedition: alive and not already on one
  const expeditionEligible = state.creatures.filter(
    (c) => c.currentHp > 0 && !activeExpeditions.some((e) => e.creatureUid === c.uid),
  );

  // For each area, the active expedition (if any)
  function getAreaExpedition(areaId: string) {
    return activeExpeditions.find((e) => e.areaId === areaId);
  }

  // Passive gold rate display
  const passiveRate = calcPassiveGold(state.creatures);

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-title">🗺️ Explore</span>
        <span style={{ fontSize: 7, color: 'var(--type-electric)' }}>
          📈 +{passiveRate}g/hr passive
        </span>
      </div>

      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Active expeditions */}
        {activeExpeditions.length > 0 && (
          <div className="card">
            <div className="section-title">🧭 Active Expeditions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {activeExpeditions.map((exp) => {
                const cre = state.creatures.find((c) => c.uid === exp.creatureUid);
                const area = AREAS.find((a) => a.id === exp.areaId);
                const endTime = exp.startTime + exp.durationMs;
                const isDone = now >= endTime;
                const msLeft = Math.max(0, endTime - now);
                const pct = Math.min(100, ((now - exp.startTime) / exp.durationMs) * 100);

                return (
                  <div key={exp.uid} className="expedition-active-card">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {cre && (
                        <div style={{ flexShrink: 0 }}>
                          <CreatureSprite creatureId={cre.templateId} size={38} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 2 }}>
                          {cre?.nickname ?? '?'}
                          <span style={{ fontSize: 6, color: 'var(--text-muted)', marginLeft: 6 }}>
                            → {area?.name ?? '?'} ({TIER_INFO[exp.tier].emoji} {TIER_INFO[exp.tier].label})
                          </span>
                        </div>
                        <div className="expedition-progress-track">
                          <div
                            className="expedition-progress-fill"
                            style={{
                              width: `${pct}%`,
                              background: isDone ? 'var(--success)' : 'var(--accent)',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 6, color: isDone ? 'var(--success)' : 'var(--text-muted)', marginTop: 3 }}>
                          {isDone ? '✓ Ready to collect!' : formatTimeLeft(msLeft)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                        {isDone ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => dispatch({ type: 'COLLECT_EXPEDITION', expeditionUid: exp.uid })}
                          >
                            Collect!
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => dispatch({ type: 'CANCEL_EXPEDITION', expeditionUid: exp.uid })}
                          >
                            Recall
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trainer summary */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🧢</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, marginBottom: 2 }}>{state.playerName}</div>
            <div style={{ fontSize: 7, color: 'var(--text-dim)' }}>
              Trainer Lv.{playerLevel} · {state.creatures.length} creature{state.creatures.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--type-electric)', fontSize: 8 }}>💰 {state.gold}g</div>
            <div style={{ fontSize: 6, color: 'var(--text-muted)' }}>+{passiveRate}g/hr idle</div>
          </div>
        </div>

        {/* Low HP warning */}
        {activeCreature && activeCreature.currentHp < activeCreature.maxHp * 0.3 && activeCreature.currentHp > 0 && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 7,
            color: 'var(--warning)',
          }}>
            ⚠️ {activeCreature.nickname}'s HP is low — heal before battling.
          </div>
        )}

        {/* Area list */}
        <div className="section-title" style={{ marginBottom: 0 }}>🌍 Areas</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AREAS.map((area) => {
            const isUnlocked = state.unlockedAreas.includes(area.id) || playerLevel >= area.unlockLevel;
            const isExpanded = expandedArea === area.id && isUnlocked;
            const areaExp = getAreaExpedition(area.id);
            const previewCreatures = area.creatures.slice(0, 3).map((id) => CREATURES[id]);

            // Which creature to use for expedition in this area
            const defaultExpedCreature = expedCreature[area.id] ?? expeditionEligible[0]?.uid ?? '';
            const chosenExpedCreature = state.creatures.find((c) => c.uid === defaultExpedCreature)
              ?? expeditionEligible[0];

            const canBattle = !!(
              activeCreature &&
              activeCreature.currentHp > 0 &&
              !activeExpeditions.some((e) => e.creatureUid === activeCreature.uid)
            );
            const canQuickBattle = canBattle && (activeCreature?.care.energy ?? 0) >= 20;

            return (
              <div
                key={area.id}
                className={`area-card ${!isUnlocked ? 'locked' : ''} ${isExpanded ? 'expanded' : ''}`}
                style={{ padding: 0 }}
              >
                {/* Clickable header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    cursor: isUnlocked ? 'pointer' : 'default',
                  }}
                  onClick={() => isUnlocked && setExpandedArea(isExpanded ? null : area.id)}
                >
                  <span className="area-emoji">{area.emoji}</span>
                  <div className="area-info" style={{ flex: 1 }}>
                    <div className="area-name">
                      {area.name}
                      {!isUnlocked && (
                        <span style={{ marginLeft: 6, fontSize: 6, color: 'var(--text-muted)' }}>
                          🔒 Req. Trainer Lv.{area.unlockLevel}
                        </span>
                      )}
                    </div>
                    <div className="area-level">Lv. {area.levelRange[0]}–{area.levelRange[1]}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      {previewCreatures.map((c) => (
                        <CreatureSprite key={c.id} creatureId={c.id} size={24} style={{ display: 'inline-block' }} />
                      ))}
                      {areaExp && (
                        <span style={{ fontSize: 6, color: 'var(--accent)', marginLeft: 4 }}>
                          🧭 {state.creatures.find((c) => c.uid === areaExp.creatureUid)?.nickname ?? '?'} away
                        </span>
                      )}
                    </div>
                  </div>
                  {isUnlocked && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  )}
                </div>

                {/* Expanded action panel */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>

                    {/* Battle actions */}
                    <div>
                      <div style={{ fontSize: 7, color: 'var(--text-muted)', marginBottom: 6 }}>⚔️ Battle</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => dispatch({ type: 'START_EXPLORE_BATTLE', areaId: area.id })}
                          disabled={!canBattle}
                          title="Fight a wild creature manually"
                        >
                          ⚔️ Battle
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => dispatch({ type: 'QUICK_BATTLE', areaId: area.id })}
                          disabled={!canQuickBattle}
                          title="Auto-resolve a fight. Costs energy, smaller rewards."
                        >
                          ⚡ Quick Battle
                        </button>
                      </div>
                      {activeCreature && !canBattle && (
                        <div style={{ fontSize: 6, color: 'var(--warning)', marginTop: 4 }}>
                          {activeCreature.currentHp <= 0
                            ? '⚠️ Active creature is fainted — heal first.'
                            : '⚠️ Active creature is on expedition — recall or switch.'}
                        </div>
                      )}
                      {canBattle && !canQuickBattle && (
                        <div style={{ fontSize: 6, color: 'var(--type-electric)', marginTop: 4 }}>
                          ⚡ Quick Battle needs ≥20 energy. Let them rest.
                        </div>
                      )}
                    </div>

                    {/* Expedition */}
                    <div>
                      <div style={{ fontSize: 7, color: 'var(--text-muted)', marginBottom: 6 }}>
                        🧭 Expedition
                        {areaExp && (
                          <span style={{ color: 'var(--accent)', marginLeft: 6 }}>
                            (already active in this area)
                          </span>
                        )}
                      </div>

                      {expeditionEligible.length === 0 ? (
                        <div style={{ fontSize: 7, color: 'var(--text-dim)' }}>
                          No creatures available — all are fainted or on expedition.
                        </div>
                      ) : (
                        <>
                          {/* Creature select */}
                          {expeditionEligible.length > 1 && (
                            <select
                              value={defaultExpedCreature}
                              onChange={(e) => setExpedCreature((prev) => ({ ...prev, [area.id]: e.target.value }))}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                marginBottom: 8,
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text)',
                                fontSize: 'var(--font-size-xs)',
                              }}
                            >
                              {expeditionEligible.map((c) => (
                                <option key={c.uid} value={c.uid}>
                                  {c.nickname} (Lv.{c.level})
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Tier buttons */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                            {(Object.entries(TIER_INFO) as [ExpeditionTier, typeof TIER_INFO[ExpeditionTier]][]).map(
                              ([tier, info]) => (
                                <button
                                  key={tier}
                                  className="btn btn-secondary expedition-tier-btn"
                                  disabled={!chosenExpedCreature}
                                  onClick={() => {
                                    if (chosenExpedCreature) {
                                      dispatch({
                                        type: 'START_EXPEDITION',
                                        creatureUid: chosenExpedCreature.uid,
                                        areaId: area.id,
                                        tier,
                                      });
                                    }
                                  }}
                                >
                                  {info.emoji} {info.label}
                                  <span style={{ fontSize: 6, color: 'var(--text-muted)', display: 'block' }}>
                                    {info.duration}
                                  </span>
                                </button>
                              ),
                            )}
                          </div>

                          {/* Area item drops preview */}
                          {area.itemDrops.length > 0 && (
                            <div style={{ marginTop: 6, fontSize: 6, color: 'var(--text-muted)' }}>
                              Possible finds:{' '}
                              {area.itemDrops.slice(0, 4).map((id) => ITEMS[id]?.emoji ?? '?').join(' ')}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="card">
          <div className="section-title">❓ How It Works</div>
          <div style={{ fontSize: 7, color: 'var(--text-dim)', lineHeight: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <p>⚔️ <strong>Battle</strong> — Fight wild creatures for the best EXP and catch opportunities.</p>
            <p>⚡ <strong>Quick Battle</strong> — Auto-resolve instantly. Costs energy, smaller rewards.</p>
            <p>🧭 <strong>Expedition</strong> — Send a creature away for passive gold, EXP &amp; items.</p>
            <p>📈 <strong>Passive income</strong> — Your party earns gold while idle based on level &amp; happiness.</p>
            <p>💡 Better care stats = better expedition loot and more passive income.</p>
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
