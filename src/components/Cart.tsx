import type { CartItem } from '../types';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (barcode: string, delta: number) => void;
  onRemoveItem: (barcode: string) => void;
}

export default function Cart({ items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ marginBottom: '20px' }}>Current Bill</h2>
      
      <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            No items scanned yet.
          </p>
        ) : (
          items.map(item => (
            <div key={item.barcode} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ₹{item.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '2px' }}>
                  <button 
                    onClick={() => onUpdateQuantity(item.barcode, -1)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.barcode, 1)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <div style={{ width: '70px', textAlign: 'right', fontWeight: 600 }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
                
                <button 
                  onClick={() => onRemoveItem(item.barcode)}
                  style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div style={{ 
        borderTop: '1px solid var(--glass-border)', 
        paddingTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Total:</span>
        <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
          ₹{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
