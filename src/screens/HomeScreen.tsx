import { useState } from 'react';
import { useGame } from '../GameContext';
import { CREATURES, ITEMS } from '../gameData';
import { getMood, getMoodEmoji, calcExpToNext } from '../gameLogic';
import { StatBar, HpBar, ExpBar } from '../components/StatBar';
import { BottomNav } from '../components/BottomNav';
import { CreatureSprite } from '../components/CreatureSprite';

export function HomeScreen() {
  const { state, activeCreature, dispatch } = useGame();
  const [showFeedMenu, setShowFeedMenu] = useState(false);
  const [showBagMenu, setShowBagMenu] = useState(false);
  const [showQuests, setShowQuests] = useState(true);

  if (!activeCreature) {
    return (
      <div className="screen">
        <div className="empty-state">
          <span className="empty-icon">😕</span>
          No active creature. Go explore!
        </div>
        <BottomNav />
      </div>
    );
  }

  const template = CREATURES[activeCreature.templateId];
  const mood = getMood(activeCreature.care);
  const moodEmoji = getMoodEmoji(mood);
  const hpPct = activeCreature.currentHp / activeCreature.maxHp;
  const expToNext = calcExpToNext(activeCreature.level);

  const foodItems = state.inventory.filter((e) => {
    const item = ITEMS[e.itemId];
    return item && item.type === 'food' && e.quantity > 0;
  });

  // All usable bag items (exclude balls — those are battle-only)
  const bagItems = state.inventory.filter((e) => {
    const item = ITEMS[e.itemId];
    return item && item.type !== 'ball' && e.quantity > 0;
  });

  // Calculate clinic cost (single creature)
  const hpMissing = activeCreature.maxHp - activeCreature.currentHp;
  const statusPenalty = activeCreature.statusEffect ? 30 : 0;
  const clinicCost = Math.max(20, Math.ceil(hpMissing * 0.5) + statusPenalty);
  const clinicFull = activeCreature.currentHp === activeCreature.maxHp && activeCreature.statusEffect === null;

  // Party heal cost
  const partyNeedsHealing = state.creatures.filter(
    (c) => c.currentHp < c.maxHp || c.statusEffect !== null,
  );
  const partyHealCost = partyNeedsHealing.reduce((sum, c) => {
    const missing = c.maxHp - c.currentHp;
    const sp = c.statusEffect ? 30 : 0;
    return sum + Math.max(20, Math.ceil(missing * 0.5) + sp);
  }, 0);
  const partyAlreadyFull = partyNeedsHealing.length === 0;

  const TYPE_GLOW: Record<string, string> = {
    fire: '#ff6b3540',
    water: '#4fc3f740',
    grass: '#66bb6a40',
    electric: '#ffd54f40',
    shadow: '#b39ddb40',
    normal: '#9e9e9e30',
  };

  // Care bonus/penalty summary for battle
  const careWarnings: string[] = [];
  if (activeCreature.care.hunger < 20) careWarnings.push('🍎 Hungry (−15% ATK)');
  if (activeCreature.care.energy < 20) careWarnings.push('⚡ Exhausted (may skip turn)');
  if (activeCreature.care.health < 30) careWarnings.push('🌿 Sick (takes more damage)');
  const happyBonus = activeCreature.care.happiness > 70;

  const unclaimedCount = state.dailyQuests.filter((q) => q.completed && !q.claimed).length;

  return (
    <div className="screen">
      {/* Player bar */}
      <div className="player-bar">
        <span>🧢 {state.playerName}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>Day {state.day}</span>
        <span className="gold-display">💰 {state.gold}g</span>
      </div>

      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Creature Card */}
        <div className="creature-card">
          <span className="creature-mood">{moodEmoji}</span>

          <div
            className="creature-sprite-wrap"
            style={{ filter: `drop-shadow(0 0 18px ${TYPE_GLOW[template.type] ?? '#ffffff20'})` }}
          >
            <CreatureSprite creatureId={activeCreature.templateId} size={120} className="creature-sprite" />
          </div>

          <div className="creature-name">{activeCreature.nickname}</div>
          <div className="creature-level" style={{ marginBottom: 6 }}>
            {activeCreature.nickname !== template.name && (
              <span style={{ color: 'var(--text-muted)', fontSize: 7 }}>{template.name} · </span>
            )}
            Lv. {activeCreature.level}
          </div>

          <div className={`type-badge type-${template.type}`} style={{ marginBottom: 12 }}>
            {template.type}
          </div>

          <HpBar current={activeCreature.currentHp} max={activeCreature.maxHp} />

          <div style={{ marginTop: 6 }}>
            <ExpBar current={activeCreature.exp} toNext={expToNext} level={activeCreature.level} />
          </div>

          {activeCreature.statusEffect && (
            <div style={{ marginTop: 8, fontSize: 7, color: 'var(--warning)' }}>
              ⚠️ {activeCreature.nickname} is {activeCreature.statusEffect}ed!
            </div>
          )}

          {hpPct < 0.25 && activeCreature.currentHp > 0 && (
            <div style={{ fontSize: 7, color: 'var(--danger)', marginTop: 6 }}>
              ⚠️ HP is low — use a Potion or visit the Clinic.
            </div>
          )}
          {activeCreature.currentHp === 0 && (
            <div style={{ fontSize: 7, color: 'var(--danger)', marginTop: 6 }}>
              💀 Fainted! Use a Revive from your bag or heal at the Clinic.
            </div>
          )}

          {/* Battle readiness hints */}
          {(careWarnings.length > 0 || happyBonus) && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {happyBonus && (
                <div style={{ fontSize: 6, color: 'var(--success)' }}>💖 Happy (+10% ATK in battle)</div>
              )}
              {careWarnings.map((w) => (
                <div key={w} style={{ fontSize: 6, color: 'var(--warning)' }}>{w}</div>
              ))}
            </div>
          )}
        </div>

        {/* Care Stats */}
        <div className="card">
          <div className="section-title">Care Stats</div>
          <StatBar label="🍎 Hunger"  value={activeCreature.care.hunger}    className="care-hunger" />
          <StatBar label="💖 Happy"   value={activeCreature.care.happiness}  className="care-happiness" />
          <StatBar label="⚡ Energy"  value={activeCreature.care.energy}     className="care-energy" />
          <StatBar label="🌿 Health"  value={activeCreature.care.health}     className="care-health" />
        </div>

        {/* Care Actions */}
        <div className="card">
          <div className="section-title">Actions</div>
          <div className="care-actions">

            {/* Feed */}
            <div>
              <button
                className="care-btn"
                style={{ width: '100%' }}
                onClick={() => { setShowFeedMenu((v) => !v); setShowBagMenu(false); }}
                disabled={foodItems.length === 0}
              >
                <span className="care-icon">🍽️</span>
                Feed
                {foodItems.length === 0 && (
                  <span style={{ fontSize: 6, color: 'var(--text-muted)' }}>No food</span>
                )}
              </button>
              {showFeedMenu && foodItems.length > 0 && (
                <div className="feed-item-list" style={{ marginTop: 6 }}>
                  {foodItems.map((entry) => {
                    const item = ITEMS[entry.itemId];
                    return (
                      <button
                        key={entry.itemId}
                        className="feed-item-btn"
                        onClick={() => {
                          dispatch({ type: 'FEED_CREATURE', creatureUid: activeCreature.uid, itemId: entry.itemId });
                          setShowFeedMenu(false);
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

            {/* Play */}
            <button
              className="care-btn"
              onClick={() => dispatch({ type: 'PLAY_WITH_CREATURE', creatureUid: activeCreature.uid })}
              disabled={activeCreature.care.energy < 15 || activeCreature.currentHp === 0}
            >
              <span className="care-icon">🎮</span>
              Play
              {activeCreature.care.energy < 15 && (
                <span style={{ fontSize: 6, color: 'var(--type-electric)' }}>Too tired</span>
              )}
            </button>

            {/* Sleep */}
            <button
              className="care-btn"
              onClick={() => dispatch({ type: 'PUT_TO_SLEEP', creatureUid: activeCreature.uid })}
              disabled={activeCreature.currentHp === 0}
            >
              <span className="care-icon">😴</span>
              Sleep
              {activeCreature.currentHp < activeCreature.maxHp && activeCreature.currentHp > 0 && (
                <span style={{ fontSize: 6, color: 'var(--success)' }}>
                  +{Math.max(5, Math.floor(activeCreature.maxHp * 0.20 * (activeCreature.care.health / 100)))} HP
                </span>
              )}
            </button>

            {/* Clinic */}
            <button
              className="care-btn"
              onClick={() => dispatch({ type: 'HEAL_AT_CLINIC', creatureUid: activeCreature.uid })}
              disabled={clinicFull}
            >
              <span className="care-icon">🏥</span>
              Clinic
              <span style={{ fontSize: 6, color: clinicFull ? 'var(--success)' : 'var(--type-electric)' }}>
                {clinicFull ? '✓ Full' : `${clinicCost}g`}
              </span>
            </button>

            {/* Heal Party — only show if multiple creatures */}
            {state.creatures.length > 1 && (
              <button
                className="care-btn"
                style={{ gridColumn: '1 / -1' }}
                onClick={() => dispatch({ type: 'HEAL_PARTY_AT_CLINIC' })}
                disabled={partyAlreadyFull}
              >
                <span className="care-icon">🏥</span>
                Heal Party
                <span style={{ fontSize: 6, color: partyAlreadyFull ? 'var(--success)' : 'var(--type-electric)' }}>
                  {partyAlreadyFull ? '✓ All full' : `${partyHealCost}g`}
                </span>
              </button>
            )}
          </div>

          {/* Bag (non-battle items) */}
          {bagItems.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button
                className="section-title"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center', padding: 0,
                }}
                onClick={() => setShowBagMenu((v) => !v)}
              >
                🎒 Use from Bag {showBagMenu ? '▲' : '▼'}
              </button>
              {showBagMenu && (
                <div className="feed-item-list" style={{ marginTop: 6 }}>
                  {bagItems.map((entry) => {
                    const item = ITEMS[entry.itemId];
                    return (
                      <button
                        key={entry.itemId}
                        className="feed-item-btn"
                        onClick={() =>
                          dispatch({
                            type: 'USE_ITEM_ON_CREATURE',
                            itemId: entry.itemId,
                            creatureUid: activeCreature.uid,
                          })
                        }
                      >
                        {item.emoji} {item.name}
                        <span style={{ color: 'var(--text-muted)', fontSize: 6 }}>×{entry.quantity}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily Quests */}
        {state.dailyQuests.length > 0 && (
          <div className="card">
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 0,
              }}
              onClick={() => setShowQuests((v) => !v)}
            >
              <span className="section-title" style={{ margin: 0 }}>
                📋 Daily Quests
                {unclaimedCount > 0 && (
                  <span style={{
                    marginLeft: 8, background: 'var(--success)', color: '#000',
                    borderRadius: 10, padding: '1px 6px', fontSize: 7,
                  }}>
                    {unclaimedCount} ready!
                  </span>
                )}
              </span>
              <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{showQuests ? '▲' : '▼'}</span>
            </button>

            {showQuests && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {state.dailyQuests.map((quest) => {
                  const pct = Math.min(100, (quest.progress / quest.goal) * 100);
                  const rewardStr = quest.reward.gold
                    ? `${quest.reward.gold}g`
                    : `${quest.reward.qty}× ${ITEMS[quest.reward.itemId!]?.name ?? '?'}`;

                  return (
                    <div key={quest.id} className={`quest-item ${quest.claimed ? 'quest-claimed' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 7 }}>{quest.label}</span>
                        <span style={{ fontSize: 6, color: 'var(--text-muted)' }}>
                          {quest.progress}/{quest.goal}
                        </span>
                      </div>
                      <div className="quest-progress-track">
                        <div
                          className="quest-progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: quest.completed ? 'var(--success)' : 'var(--accent)',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 6, color: 'var(--type-electric)' }}>
                          🏆 {rewardStr}
                        </span>
                        {quest.completed && !quest.claimed && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => dispatch({ type: 'CLAIM_QUEST_REWARD', questId: quest.id })}
                          >
                            Claim!
                          </button>
                        )}
                        {quest.claimed && (
                          <span style={{ fontSize: 6, color: 'var(--success)' }}>✓ Claimed</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pokédex entry */}
        <div className="card">
          <div className="section-title">📖 Entry</div>
          <p style={{ fontSize: 7, color: 'var(--text-dim)', lineHeight: 2 }}>
            {template.description}
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`pill rarity-${template.rarity}`}>{template.rarity}</span>
            <span className="pill">ATK {activeCreature.attack}</span>
            <span className="pill">DEF {activeCreature.defense}</span>
            <span className="pill">SPD {activeCreature.speed}</span>
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
