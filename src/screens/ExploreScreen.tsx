import { useGame } from '../GameContext';
import { AREAS, CREATURES } from '../gameData';
import { getPlayerLevel } from '../gameLogic';
import { BottomNav } from '../components/BottomNav';

export function ExploreScreen() {
  const { state, activeCreature, dispatch } = useGame();

  const playerLevel = getPlayerLevel(state.creatures);

  function handleExplore(areaId: string) {
    if (!activeCreature) {
      dispatch({ type: 'ADD_NOTIF', text: 'You need an active creature to explore!', notifType: 'error' });
      return;
    }
    if (activeCreature.currentHp <= 0) {
      dispatch({ type: 'ADD_NOTIF', text: 'Your active creature has fainted! Heal first.', notifType: 'error' });
      return;
    }
    dispatch({ type: 'START_EXPLORE_BATTLE', areaId });
  }

  const activeName = activeCreature
    ? `${activeCreature.nickname} (Lv.${activeCreature.level})`
    : 'None';

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-title">🗺️ Explore</span>
        <span style={{ fontSize: 7, color: 'var(--text-muted)' }}>Lead: {activeName}</span>
      </div>

      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Player level */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🧢</span>
          <div>
            <div style={{ fontSize: 9, marginBottom: 4 }}>{state.playerName}'s Team</div>
            <div style={{ fontSize: 7, color: 'var(--text-dim)' }}>
              Trainer Level: {playerLevel} | {state.creatures.length} creature{state.creatures.length !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 7, color: 'var(--success)', marginTop: 2 }}>
              💰 {state.gold}g
            </div>
          </div>
        </div>

        {/* Warning if active creature is hurt */}
        {activeCreature && activeCreature.currentHp < activeCreature.maxHp * 0.3 && activeCreature.currentHp > 0 && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 7,
            color: 'var(--warning)',
          }}>
            ⚠️ {activeCreature.nickname}'s HP is low! Consider healing before battling.
          </div>
        )}

        {/* Area List */}
        <div className="section-title">🌍 Areas</div>
        <div className="area-list">
          {AREAS.map((area) => {
            const isUnlocked = state.unlockedAreas.includes(area.id) || playerLevel >= area.unlockLevel;
            const isLocked = !isUnlocked;
            const recommendedStr = `Lv. ${area.levelRange[0]}–${area.levelRange[1]}`;

            // Show creature previews
            const previewCreatures = area.creatures.slice(0, 3).map((id) => CREATURES[id]);

            return (
              <div
                key={area.id}
                className={`area-card ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && handleExplore(area.id)}
              >
                <span className="area-emoji">{area.emoji}</span>
                <div className="area-info">
                  <div className="area-name">
                    {area.name}
                    {isLocked && (
                      <span style={{ marginLeft: 6, fontSize: 6, color: 'var(--text-muted)' }}>
                        🔒 Req. Lv.{area.unlockLevel}
                      </span>
                    )}
                  </div>
                  <div className="area-desc">{area.description}</div>
                  <div className="area-level">
                    Recommended: {recommendedStr}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {previewCreatures.map((c) => (
                      <span key={c.id} title={c.name} style={{ fontSize: 16 }}>
                        {c.emoji}
                      </span>
                    ))}
                    <span style={{ fontSize: 6, color: 'var(--text-muted)', alignSelf: 'center' }}>
                      + more
                    </span>
                  </div>
                </div>
                {!isLocked && <span className="area-arrow">→</span>}
              </div>
            );
          })}
        </div>

        {/* How to play */}
        <div className="card">
          <div className="section-title">❓ How It Works</div>
          <div style={{ fontSize: 7, color: 'var(--text-dim)', lineHeight: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p>1. Pick an area and encounter a wild creature.</p>
            <p>2. Battle it to gain EXP and gold, or catch it!</p>
            <p>3. Lower the enemy's HP before throwing a ball.</p>
            <p>4. Unlock new areas by leveling up your creatures.</p>
            <p>5. Shadow Realm unlocks at Trainer Level 15.</p>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
