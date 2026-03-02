import { useState } from 'react';
import { useGame } from '../GameContext';
import { CREATURES, STARTER_IDS } from '../gameData';

export function StartScreen() {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState<'title' | 'name' | 'starter'>('title');
  const [name, setName] = useState('');
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null);

  const hasSave = state.creatures.length > 0;

  if (hasSave && state.currentScreen === 'start') {
    // Game already started — go directly to home
    dispatch({ type: 'CHANGE_SCREEN', screen: 'home' });
    return null;
  }

  function handleContinue() {
    if (phase === 'title') {
      setPhase('name');
    } else if (phase === 'name') {
      const trimmed = name.trim();
      if (!trimmed) return;
      setPhase('starter');
    } else if (phase === 'starter' && selectedStarter) {
      dispatch({ type: 'SET_PLAYER_NAME', name: name.trim() });
      dispatch({ type: 'SELECT_STARTER', templateId: selectedStarter });
    }
  }

  return (
    <div className="start-screen">
      {phase === 'title' && (
        <>
          <div className="mascot-display">🌟</div>
          <div className="game-logo">HAMAYATCHI</div>
          <p className="game-subtitle">Collect · Care · Battle</p>
          <p style={{ fontSize: 8, color: 'var(--text-muted)', maxWidth: 280, textAlign: 'center', lineHeight: 2 }}>
            Raise your creatures, battle wild ones, and build the ultimate team!
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setPhase('name')}>
            ▶ New Game
          </button>
        </>
      )}

      {phase === 'name' && (
        <>
          <div className="mascot-display" style={{ fontSize: 64 }}>🎮</div>
          <p className="game-subtitle">What's your name, Trainer?</p>
          <input
            type="text"
            placeholder="Enter name..."
            value={name}
            maxLength={12}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            style={{ width: '100%', maxWidth: 280, textAlign: 'center', fontSize: 12 }}
            autoFocus
          />
          <button
            className="btn btn-primary btn-lg"
            disabled={!name.trim()}
            onClick={handleContinue}
            style={{ maxWidth: 280 }}
          >
            Continue →
          </button>
        </>
      )}

      {phase === 'starter' && (
        <>
          <p className="game-subtitle">Choose your starter!</p>
          <div className="starter-grid" style={{ width: '100%', maxWidth: 360 }}>
            {STARTER_IDS.map((id) => {
              const template = CREATURES[id];
              return (
                <div
                  key={id}
                  className={`starter-card ${selectedStarter === id ? 'selected' : ''}`}
                  onClick={() => setSelectedStarter(id)}
                >
                  <span className="starter-emoji">{template.emoji}</span>
                  <div className="starter-name">{template.name}</div>
                  <div className={`type-badge type-${template.type}`}>{template.type}</div>
                  <p style={{ fontSize: 6, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.8 }}>
                    {template.description}
                  </p>
                </div>
              );
            })}
          </div>
          {selectedStarter && (
            <div style={{ fontSize: 8, color: 'var(--text-dim)', textAlign: 'center' }}>
              You chose {CREATURES[selectedStarter].name}!
            </div>
          )}
          <button
            className="btn btn-primary btn-lg"
            disabled={!selectedStarter}
            onClick={handleContinue}
            style={{ maxWidth: 280 }}
          >
            Start Adventure! 🌟
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setPhase('name')}>
            ← Back
          </button>
        </>
      )}
    </div>
  );
}
