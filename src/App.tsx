import { useState, useCallback, useMemo } from 'react';
import { ShoppingCart, PackageOpen, Printer } from 'lucide-react';
import Scanner from './components/Scanner';
import Cart from './components/Cart';
import Receipt from './components/Receipt';
import type { Product, CartItem } from './types';

// Mock product database
const MOCK_DB: Record<string, Product> = {
  '123456789': { barcode: '123456789', name: 'Cybernetic Enhancer', price: 299.99 },
  '987654321': { barcode: '987654321', name: 'Neon Plasma Core', price: 149.50 },
  '111222333': { barcode: '111222333', name: 'Quantum Processor', price: 899.00 },
  '555444333': { barcode: '555444333', name: 'Holo-Projector Matrix', price: 125.75 },
};

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScan = useCallback((barcode: string) => {
    const product = MOCK_DB[barcode];
    
    if (product) {
      setCartItems(prev => {
        const existing = prev.find(item => item.barcode === barcode);
        if (existing) {
          return prev.map(item => 
            item.barcode === barcode ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      showNotification(`Added ${product.name}`, 'success');
    } else {
      // Mock unknown product for testing
      const newProduct: Product = {
        barcode,
        name: `Unknown Product (${barcode})`,
        price: Math.floor(Math.random() * 100) + 0.99
      };
      
      setCartItems(prev => [...prev, { ...newProduct, quantity: 1 }]);
      showNotification(`Added ${newProduct.name}`, 'success');
    }
  }, []);

  const handleUpdateQuantity = useCallback((barcode: string, delta: number) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.barcode === barcode) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((barcode: string) => {
    setCartItems(prev => prev.filter(item => item.barcode !== barcode));
  }, []);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification("Cart is empty", "error");
      return;
    }
    
    // Trigger print dialog
    window.print();
    
    // Optional: clear cart after some time or prompt
    // setCartItems([]);
  };

  const receiptDate = useMemo(() => new Date(), [cartItems]);
  const receiptNumber = useMemo(() => `NEXUS-${Math.floor(Math.random() * 1000000)}`, [cartItems]);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: notification.type === 'success' ? 'var(--success)' : 'var(--danger)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      <header style={{ maxWidth: '1200px', margin: '0 auto 40px', textAlign: 'center' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '2.5rem' }}>
          <PackageOpen size={40} color="var(--text-accent)" />
          Nexus POS System
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Futuristic Billing & Checkout Experience</p>
      </header>

      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Left Column: Scanner */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Scanner onScan={handleScan} />
          
          <div className="glass-panel animate-fade-in" style={{ flexGrow: 1 }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} />
              Quick Actions
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Test barcodes: 123456789, 987654321, 111222333, 555444333
            </p>
            <button 
              className="glass-button primary" 
              style={{ width: '100%', padding: '16px', fontSize: '1.2rem', marginTop: 'auto' }}
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              <Printer size={24} />
              Print Receipt & Checkout
            </button>
          </div>
        </section>

        {/* Right Column: Cart */}
        <section style={{ height: '600px' }}>
          <Cart 
            items={cartItems} 
            onUpdateQuantity={handleUpdateQuantity} 
            onRemoveItem={handleRemoveItem} 
          />
        </section>
      </main>

      {/* Hidden Receipt for Printing */}
      {cartItems.length > 0 && (
        <Receipt 
          items={cartItems} 
          date={receiptDate}
          receiptNumber={receiptNumber}
        />
      )}
    </div>
  );
}

export default App;
