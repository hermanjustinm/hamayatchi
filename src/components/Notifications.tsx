import { useGame } from '../GameContext';

export function Notifications() {
  const { state, dispatch } = useGame();

  if (state.notifications.length === 0) return null;

  return (
    <div className="notif-container">
      {state.notifications.map((n) => (
        <div
          key={n.id}
          className={`notif ${n.type}`}
          onClick={() => dispatch({ type: 'DISMISS_NOTIF', id: n.id })}
        >
          <span style={{ flex: 1 }}>{n.text}</span>
          <span style={{ opacity: 0.6, fontSize: '10px', cursor: 'pointer' }}>✕</span>
        </div>
      ))}
    </div>
  );
}
