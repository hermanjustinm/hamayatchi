import { GameProvider, useGame } from './GameContext';
import { Notifications } from './components/Notifications';
import { StartScreen } from './screens/StartScreen';
import { HomeScreen } from './screens/HomeScreen';
import { BattleScreen } from './screens/BattleScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { ShopScreen } from './screens/ShopScreen';
import { ExploreScreen } from './screens/ExploreScreen';

function GameRouter() {
  const { state } = useGame();
  const { currentScreen } = state;

  return (
    <div className="game-shell">
      <Notifications />
      {(currentScreen === 'start' || currentScreen === 'name' || currentScreen === 'starter') && (
        <StartScreen />
      )}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'battle' && <BattleScreen />}
      {currentScreen === 'collection' && <CollectionScreen />}
      {currentScreen === 'shop' && <ShopScreen />}
      {currentScreen === 'explore' && <ExploreScreen />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
