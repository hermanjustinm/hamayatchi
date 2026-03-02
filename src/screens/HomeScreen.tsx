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

  const medicineItems = state.inventory.filter((e) => {
    const item = ITEMS[e.itemId];
    return item && item.type === 'medicine' && (item.effect.health ?? 0) > 0 && e.quantity > 0;
  });

  // Calculate clinic cost
  const hpMissing = activeCreature.maxHp - activeCreature.currentHp;
  const statusPenalty = activeCreature.statusEffect ? 30 : 0;
  const clinicCost = Math.max(20, Math.ceil(hpMissing * 0.5) + statusPenalty);
  const clinicFull = activeCreature.currentHp === activeCreature.maxHp && activeCreature.statusEffect === null;

  const TYPE_GLOW: Record<string, string> = {
    fire: '#ff6b3540',
    water: '#4fc3f740',
    grass: '#66bb6a40',
    electric: '#ffd54f40',
    shadow: '#b39ddb40',
    normal: '#9e9e9e30',
  };

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

          {/* SVG Sprite */}
          <div
            className="creature-sprite-wrap"
            style={{
              filter: `drop-shadow(0 0 18px ${TYPE_GLOW[template.type] ?? '#ffffff20'})`,
            }}
          >
            <CreatureSprite
              creatureId={activeCreature.templateId}
              size={120}
              className="creature-sprite"
            />
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
                onClick={() => setShowFeedMenu((v) => !v)}
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
                          dispatch({
                            type: 'FEED_CREATURE',
                            creatureUid: activeCreature.uid,
                            itemId: entry.itemId,
                          });
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
              onClick={() =>
                dispatch({ type: 'PLAY_WITH_CREATURE', creatureUid: activeCreature.uid })
              }
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
              onClick={() =>
                dispatch({ type: 'PUT_TO_SLEEP', creatureUid: activeCreature.uid })
              }
              disabled={activeCreature.currentHp === 0}
            >
              <span className="care-icon">😴</span>
              Sleep
            </button>

            {/* Clinic — proper heal with gold cost */}
            <button
              className="care-btn"
              onClick={() =>
                dispatch({ type: 'HEAL_AT_CLINIC', creatureUid: activeCreature.uid })
              }
              disabled={clinicFull}
            >
              <span className="care-icon">🏥</span>
              Clinic
              <span style={{ fontSize: 6, color: clinicFull ? 'var(--success)' : 'var(--type-electric)' }}>
                {clinicFull ? '✓ Full' : `${clinicCost}g`}
              </span>
            </button>
          </div>

          {/* Use medicine from bag */}
          {medicineItems.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="section-title">Use Medicine</div>
              <div className="feed-item-list">
                {medicineItems.map((entry) => {
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
            </div>
          )}
        </div>

        {/* Pokédex entry */}
        <div className="card">
          <div className="section-title">📖 Pokédex</div>
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
