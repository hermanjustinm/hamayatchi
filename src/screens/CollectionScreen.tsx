import { useState } from 'react';
import { useGame } from '../GameContext';
import { CREATURES } from '../gameData';
import { getMood, getMoodEmoji, calcExpToNext } from '../gameLogic';
import { HpBar, StatBar, ExpBar } from '../components/StatBar';
import { BottomNav } from '../components/BottomNav';
import { CreatureSprite } from '../components/CreatureSprite';
import type { OwnedCreature } from '../types';

export function CollectionScreen() {
  const { state, dispatch } = useGame();
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  const selectedCreature = selectedUid
    ? state.creatures.find((c) => c.uid === selectedUid) ?? null
    : null;

  function handleSelect(c: OwnedCreature) {
    setSelectedUid(c.uid);
    setEditNickname(false);
  }

  function handleSetActive(uid: string) {
    dispatch({ type: 'SET_ACTIVE_CREATURE', creatureUid: uid });
    dispatch({ type: 'ADD_NOTIF', text: 'Active creature changed!', notifType: 'info' });
  }

  if (selectedCreature) {
    const template = CREATURES[selectedCreature.templateId];
    const mood = getMood(selectedCreature.care);
    const expToNext = calcExpToNext(selectedCreature.level);

    return (
      <div className="screen">
        <div className="screen-header">
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUid(null)}>
            ← Back
          </button>
          <span className="screen-title" style={{ fontSize: 10 }}>{selectedCreature.nickname}</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              dispatch({ type: 'TOGGLE_FAVORITE', creatureUid: selectedCreature.uid });
            }}
          >
            {selectedCreature.isFavorite ? '⭐' : '☆'}
          </button>
        </div>

        <div className="creature-detail">
          {/* Header */}
          <div className="detail-header">
            <CreatureSprite creatureId={selectedCreature.templateId} size={100} className="creature-sprite" />
            {editNickname ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  value={nicknameInput}
                  maxLength={12}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  style={{ width: 120, textAlign: 'center' }}
                  autoFocus
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    dispatch({ type: 'NICKNAME_CREATURE', creatureUid: selectedCreature.uid, nickname: nicknameInput });
                    setEditNickname(false);
                  }}
                >
                  ✓
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditNickname(false)}>✕</button>
              </div>
            ) : (
              <div
                className="detail-name"
                style={{ cursor: 'pointer' }}
                onClick={() => { setEditNickname(true); setNicknameInput(selectedCreature.nickname); }}
                title="Click to rename"
              >
                {selectedCreature.nickname} ✏️
              </div>
            )}
            <div style={{ fontSize: 7, color: 'var(--text-muted)' }}>
              {selectedCreature.nickname !== template.name ? template.name + ' · ' : ''}
              Caught day {selectedCreature.caughtDay}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className={`type-badge type-${template.type}`}>{template.type}</span>
              <span className={`pill rarity-${template.rarity}`}>{template.rarity}</span>
            </div>
            <span style={{ fontSize: 24 }}>{getMoodEmoji(mood)}</span>
          </div>

          {/* HP and EXP */}
          <div className="card">
            <HpBar current={selectedCreature.currentHp} max={selectedCreature.maxHp} />
            <div style={{ marginTop: 8 }}>
              <ExpBar current={selectedCreature.exp} toNext={expToNext} level={selectedCreature.level} />
            </div>
            {selectedCreature.statusEffect && (
              <div style={{ marginTop: 8, fontSize: 7, color: 'var(--warning)' }}>
                Status: {selectedCreature.statusEffect}
              </div>
            )}
          </div>

          {/* Care Stats */}
          <div className="card">
            <div className="section-title">Care</div>
            <StatBar label="🍎 Hunger" value={selectedCreature.care.hunger} className="care-hunger" />
            <StatBar label="💖 Happy" value={selectedCreature.care.happiness} className="care-happiness" />
            <StatBar label="⚡ Energy" value={selectedCreature.care.energy} className="care-energy" />
            <StatBar label="🌿 Health" value={selectedCreature.care.health} className="care-health" />
          </div>

          {/* Battle Stats */}
          <div className="card">
            <div className="section-title">Battle Stats</div>
            <div className="stat-grid">
              <div className="stat-item">
                <div className="label">ATK</div>
                <div className="value">{selectedCreature.attack}</div>
              </div>
              <div className="stat-item">
                <div className="label">DEF</div>
                <div className="value">{selectedCreature.defense}</div>
              </div>
              <div className="stat-item">
                <div className="label">SPD</div>
                <div className="value">{selectedCreature.speed}</div>
              </div>
              <div className="stat-item">
                <div className="label">MAX HP</div>
                <div className="value">{selectedCreature.maxHp}</div>
              </div>
            </div>
          </div>

          {/* Moves */}
          <div className="card">
            <div className="section-title">Moves</div>
            <div className="moves-section">
              {selectedCreature.moves.map((move) => (
                <div key={move.id} className={`move-chip ${move.type}`}>
                  <div>
                    <div style={{ fontSize: 8 }}>{move.name}</div>
                    <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{move.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 7, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span>PWR {move.power}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>PP {move.pp}/{move.maxPp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <p style={{ fontSize: 7, color: 'var(--text-dim)', lineHeight: 2 }}>{template.description}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.activeCreatureId !== selectedCreature.uid && (
              <button
                className="btn btn-primary btn-block"
                onClick={() => handleSetActive(selectedCreature.uid)}
                disabled={selectedCreature.currentHp === 0}
              >
                ⚡ Set as Active
              </button>
            )}
            {state.activeCreatureId === selectedCreature.uid && (
              <div style={{ textAlign: 'center', fontSize: 7, color: 'var(--accent)', padding: '8px 0' }}>
                ✓ Currently Active Creature
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-title">📦 Party</span>
        <span style={{ fontSize: 7, color: 'var(--text-muted)' }}>{state.creatures.length} creatures</span>
      </div>

      <div className="screen-body">
        {state.creatures.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            No creatures yet! Go explore to find some.
          </div>
        ) : (
          <div className="collection-grid">
            {state.creatures.map((c) => {
              const tmpl = CREATURES[c.templateId];
              const hpPct = (c.currentHp / c.maxHp) * 100;
              const hpColor = hpPct > 50 ? 'var(--hp-high)' : hpPct > 20 ? 'var(--hp-mid)' : 'var(--hp-low)';
              const isActive = c.uid === state.activeCreatureId;

              return (
                <div
                  key={c.uid}
                  className={`coll-card ${isActive ? 'active-creature' : ''} ${c.currentHp === 0 ? 'fainted' : ''}`}
                  onClick={() => handleSelect(c)}
                >
                  {c.isFavorite && <span className="fav-star">⭐</span>}
                  <CreatureSprite creatureId={c.templateId} size={52} />
                  <div className="coll-name">{c.nickname}</div>
                  <div className="coll-level">Lv. {c.level}</div>
                  <div className={`type-badge type-${tmpl.type}`} style={{ fontSize: 6 }}>
                    {tmpl.type}
                  </div>
                  <div className="coll-hp-mini">
                    <div
                      className="coll-hp-mini-fill"
                      style={{ width: `${hpPct}%`, background: hpColor }}
                    />
                  </div>
                  {c.currentHp === 0 && (
                    <div style={{ fontSize: 6, color: 'var(--danger)' }}>FAINTED</div>
                  )}
                  {isActive && (
                    <div style={{ fontSize: 6, color: 'var(--accent)' }}>ACTIVE</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats summary */}
        {state.creatures.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-title">📊 Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 7, color: 'var(--text-dim)' }}>
              <div>Battles Won: {state.stats.battlesWon}</div>
              <div>Battles Lost: {state.stats.battlesLost}</div>
              <div>Creatures Collected: {state.stats.creaturesCollected}</div>
              <div>Evolutions: {state.stats.creaturesEvolved}</div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
