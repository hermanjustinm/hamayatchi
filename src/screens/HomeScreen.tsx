import { useState } from 'react';
import { useGame } from '../GameContext';
import { CREATURES, ITEMS } from '../gameData';
import { getMood, getMoodEmoji, calcExpToNext } from '../gameLogic';
import { StatBar, HpBar, ExpBar } from '../components/StatBar';
import { BottomNav } from '../components/BottomNav';

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

          <div className="creature-sprite-wrap">
            <span
              className="creature-sprite"
              style={{
                filter: `drop-shadow(0 0 12px ${
                  { fire: '#ff6b35', water: '#4fc3f7', grass: '#66bb6a',
                    electric: '#ffd54f', shadow: '#b39ddb', normal: '#9e9e9e' }[template.type]
                }40)`,
              }}
            >
              {template.emoji}
            </span>
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

          {/* HP */}
          <HpBar current={activeCreature.currentHp} max={activeCreature.maxHp} />

          {/* EXP */}
          <div style={{ marginTop: 6 }}>
            <ExpBar current={activeCreature.exp} toNext={expToNext} level={activeCreature.level} />
          </div>

          {/* Status */}
          {activeCreature.statusEffect && (
            <div style={{ marginTop: 8, fontSize: 7, color: 'var(--warning)' }}>
              ⚠️ {activeCreature.nickname} is {activeCreature.statusEffect}ed!
            </div>
          )}

          {/* HP warning */}
          {hpPct < 0.25 && activeCreature.currentHp > 0 && (
            <div style={{ fontSize: 7, color: 'var(--danger)', marginTop: 6 }}>
              ⚠️ HP is low! Use a Potion or visit the shop.
            </div>
          )}
          {activeCreature.currentHp === 0 && (
            <div style={{ fontSize: 7, color: 'var(--danger)', marginTop: 6 }}>
              💀 Fainted! Use a Revive.
            </div>
          )}
        </div>

        {/* Care Stats */}
        <div className="card">
          <div className="section-title">Care Stats</div>
          <div className="care-hunger">
            <StatBar label="🍎 Hunger" value={activeCreature.care.hunger} className="care-hunger" />
          </div>
          <div className="care-happiness">
            <StatBar label="💖 Happy" value={activeCreature.care.happiness} className="care-happiness" />
          </div>
          <div className="care-energy">
            <StatBar label="⚡ Energy" value={activeCreature.care.energy} className="care-energy" />
          </div>
          <div className="care-health">
            <StatBar label="🌿 Health" value={activeCreature.care.health} className="care-health" />
          </div>
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
            </button>

            {/* Sleep */}
            <button
              className="care-btn"
              onClick={() => dispatch({ type: 'PUT_TO_SLEEP', creatureUid: activeCreature.uid })}
              disabled={activeCreature.currentHp === 0}
            >
              <span className="care-icon">😴</span>
              Sleep
            </button>

            {/* Heal at clinic */}
            <button
              className="care-btn"
              onClick={() => {
                const cost = Math.ceil(activeCreature.maxHp * 0.5);
                if (state.gold < cost) {
                  dispatch({ type: 'ADD_NOTIF', text: `Clinic costs ${cost}g. Not enough gold!`, notifType: 'error' });
                  return;
                }
                dispatch({ type: 'USE_ITEM_ON_CREATURE', itemId: 'revive', creatureUid: activeCreature.uid });
                // Deduct gold manually via a hacky approach — we'll use BUY/USE pattern
                dispatch({ type: 'ADD_NOTIF', text: `${activeCreature.nickname} was healed at the clinic!`, notifType: 'success' });
              }}
              disabled={activeCreature.currentHp === activeCreature.maxHp && activeCreature.statusEffect === null}
            >
              <span className="care-icon">🏥</span>
              Clinic
            </button>
          </div>

          {/* Use bag items */}
          {state.inventory.some((e) => {
            const item = ITEMS[e.itemId];
            return item && item.type === 'medicine' && e.quantity > 0 && item.effect.health;
          }) && (
            <div style={{ marginTop: 12 }}>
              <div className="section-title">Use Medicine</div>
              <div className="feed-item-list">
                {state.inventory
                  .filter((e) => {
                    const item = ITEMS[e.itemId];
                    return item && item.type === 'medicine' && e.quantity > 0 && item.effect.health;
                  })
                  .map((entry) => {
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

        {/* Description */}
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
