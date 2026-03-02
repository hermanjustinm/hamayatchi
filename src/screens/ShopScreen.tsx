import { useGame } from '../GameContext';
import { ITEMS } from '../gameData';
import { BottomNav } from '../components/BottomNav';

const SHOP_CATEGORIES = [
  {
    label: '🍎 Food',
    ids: ['berry', 'superberry', 'candy'],
  },
  {
    label: '💊 Medicine',
    ids: ['medicine', 'potion', 'superpotion', 'revive'],
  },
  {
    label: '🔴 Poké Balls',
    ids: ['lureball', 'superball', 'ultraball'],
  },
];

export function ShopScreen() {
  const { state, dispatch } = useGame();

  function getInventoryQty(itemId: string): number {
    return state.inventory.find((e) => e.itemId === itemId)?.quantity ?? 0;
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-title">🛒 Shop</span>
        <span className="gold-display" style={{ color: 'var(--type-electric)', fontSize: 8 }}>
          💰 {state.gold}g
        </span>
      </div>

      <div className="screen-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {SHOP_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="section-title">{cat.label}</div>
            <div className="shop-grid">
              {cat.ids.map((id) => {
                const item = ITEMS[id];
                const qty = getInventoryQty(id);
                const canAfford = state.gold >= item.cost;

                return (
                  <div key={id} className="shop-item">
                    <div className="shop-emoji">{item.emoji}</div>
                    <div className="shop-info">
                      <div className="shop-name">{item.name}</div>
                      <div className="shop-desc">{item.description}</div>
                      <div className="shop-price">💰 {item.cost}g each</div>
                      {qty > 0 && (
                        <div style={{ fontSize: 6, color: 'var(--text-muted)', marginTop: 2 }}>
                          In bag: {qty}
                        </div>
                      )}
                    </div>
                    <div className="shop-buy-area">
                      <button
                        className={`btn btn-primary btn-sm ${!canAfford ? 'btn-disabled' : ''}`}
                        disabled={!canAfford}
                        onClick={() => dispatch({ type: 'BUY_ITEM', itemId: id, qty: 1 })}
                      >
                        Buy ×1
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={state.gold < item.cost * 3}
                        onClick={() => dispatch({ type: 'BUY_ITEM', itemId: id, qty: 3 })}
                      >
                        ×3 ({item.cost * 3}g)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Inventory Summary */}
        <div className="card">
          <div className="section-title">🎒 Your Bag</div>
          {state.inventory.length === 0 ? (
            <div style={{ fontSize: 7, color: 'var(--text-muted)' }}>Your bag is empty.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {state.inventory.map((entry) => {
                const item = ITEMS[entry.itemId];
                if (!item) return null;
                return (
                  <div
                    key={entry.itemId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      padding: '8px 10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 7,
                      color: 'var(--text-dim)',
                      minWidth: 60,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{item.emoji}</span>
                    <span>{item.name}</span>
                    <span style={{ color: 'var(--text)', fontSize: 8 }}>×{entry.quantity}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="card">
          <div className="section-title">💡 Tips</div>
          <div style={{ fontSize: 7, color: 'var(--text-dim)', lineHeight: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p>• Earn gold by winning battles in the Explore tab.</p>
            <p>• Lower an enemy's HP before using a Lure Ball for better catch rates.</p>
            <p>• Keep your creature's Hunger and Health high to avoid penalties.</p>
            <p>• Use Super Balls or Ultra Balls for rare Shadow-type creatures.</p>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
