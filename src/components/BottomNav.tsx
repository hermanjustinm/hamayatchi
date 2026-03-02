import { useGame } from '../GameContext';
import type { GameScreen } from '../types';

const NAV_ITEMS: { screen: GameScreen; icon: string; label: string }[] = [
  { screen: 'home',       icon: '🏠', label: 'Home' },
  { screen: 'explore',    icon: '🗺️', label: 'Explore' },
  { screen: 'collection', icon: '📦', label: 'Party' },
  { screen: 'shop',       icon: '🛒', label: 'Shop' },
];

export function BottomNav() {
  const { state, dispatch } = useGame();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.screen}
          className={`nav-btn ${state.currentScreen === item.screen ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'CHANGE_SCREEN', screen: item.screen })}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
