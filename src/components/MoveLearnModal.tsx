import { useGame } from '../GameContext';
import { MOVES } from '../gameData';
import { CreatureSprite } from './CreatureSprite';
import type { OwnedCreature } from '../types';

interface Props {
  pending: { creatureUid: string; moveId: string };
  creature: OwnedCreature;
}

const TYPE_COLORS: Record<string, string> = {
  fire: '#ff6b35',
  water: '#4fc3f7',
  grass: '#66bb6a',
  electric: '#ffd54f',
  shadow: '#b39ddb',
  normal: '#9e9e9e',
};

export function MoveLearnModal({ pending, creature }: Props) {
  const { dispatch } = useGame();
  const newMove = MOVES[pending.moveId];
  if (!newMove) return null;

  const canAutoLearn = creature.moves.length < 4;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-title">⚡ New Move Available!</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <CreatureSprite creatureId={creature.templateId} size={60} />
          <div>
            <div style={{ fontSize: 9, marginBottom: 3 }}>{creature.nickname}</div>
            <div style={{ fontSize: 7, color: 'var(--text-muted)' }}>Lv. {creature.level}</div>
          </div>
        </div>

        <div style={{ fontSize: 7, color: 'var(--text-dim)', marginBottom: 10 }}>
          {canAutoLearn
            ? `${creature.nickname} wants to learn a new move!`
            : `${creature.nickname} wants to learn ${newMove.name}, but already knows 4 moves. Choose one to forget:`}
        </div>

        {/* New move card */}
        <div className="move-learn-card" style={{ borderColor: TYPE_COLORS[newMove.type] ?? '#555' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 'bold' }}>{newMove.name}</div>
            <span className={`type-badge type-${newMove.type}`} style={{ fontSize: 6 }}>{newMove.type}</span>
          </div>
          <div style={{ fontSize: 6, color: 'var(--text-dim)', marginBottom: 4, lineHeight: 1.6 }}>
            {newMove.description}
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 6, color: 'var(--text-muted)' }}>
            <span>PWR {newMove.power}</span>
            <span>ACC {newMove.accuracy}%</span>
            <span>PP {newMove.maxPp}</span>
            <span style={{ textTransform: 'capitalize' }}>{newMove.category}</span>
          </div>
        </div>

        {canAutoLearn ? (
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 14 }}
            onClick={() =>
              dispatch({
                type: 'LEARN_MOVE',
                creatureUid: creature.uid,
                moveId: newMove.id,
                replaceMoveId: null,
              })
            }
          >
            ✓ Learn {newMove.name}!
          </button>
        ) : (
          <>
            <div className="section-title" style={{ marginTop: 12 }}>Current Moves — choose one to forget:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {creature.moves.map((m) => (
                <button
                  key={m.id}
                  className="move-replace-btn"
                  onClick={() =>
                    dispatch({
                      type: 'LEARN_MOVE',
                      creatureUid: creature.uid,
                      moveId: newMove.id,
                      replaceMoveId: m.id,
                    })
                  }
                >
                  <span className={`type-badge type-${m.type}`} style={{ fontSize: 5 }}>{m.type}</span>
                  <span style={{ flex: 1 }}>{m.name}</span>
                  <span style={{ fontSize: 6, color: 'var(--text-muted)' }}>
                    PWR {m.power} · PP {m.pp}/{m.maxPp}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="btn btn-secondary btn-block"
              style={{ marginTop: 10 }}
              onClick={() => dispatch({ type: 'SKIP_MOVE_LEARN' })}
            >
              Don't Learn {newMove.name}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
