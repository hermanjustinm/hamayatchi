import { GameProvider, useGame } from './GameContext';
import { Notifications } from './components/Notifications';
import { MoveLearnModal } from './components/MoveLearnModal';
import { StartScreen } from './screens/StartScreen';
import { HomeScreen } from './screens/HomeScreen';
import { BattleScreen } from './screens/BattleScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { ShopScreen } from './screens/ShopScreen';
import { ExploreScreen } from './screens/ExploreScreen';

function GameRouter() {
  const { state } = useGame();
  const { currentScreen } = state;

  // Resolve the first pending move learn if one exists
  const firstPending = state.pendingMoveLearn[0] ?? null;
  const pendingCreature = firstPending
    ? state.creatures.find((c) => c.uid === firstPending.creatureUid) ?? null
    : null;

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

      {/* Move learn modal — rendered as a floating overlay over any screen */}
      {firstPending && pendingCreature && currentScreen !== 'battle' && (
        <MoveLearnModal pending={firstPending} creature={pendingCreature} />
      )}
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
