import { useState, useCallback, useMemo } from 'react';
import { ShoppingCart, PackageOpen, Printer, Plus, X } from 'lucide-react';
import Scanner from './components/Scanner';
import Cart from './components/Cart';
import Receipt from './components/Receipt';
import type { Product, CartItem } from './types';

// Initial Mock product database
const INITIAL_DB: Record<string, Product> = {
  '123456789': { barcode: '123456789', name: 'Cybernetic Enhancer', price: 299.99 },
  '987654321': { barcode: '987654321', name: 'Neon Plasma Core', price: 149.50 },
  '111222333': { barcode: '111222333', name: 'Quantum Processor', price: 899.00 },
  '555444333': { barcode: '555444333', name: 'Holo-Projector Matrix', price: 125.75 },
};

function App() {
  const [, setProductDB] = useState<Record<string, Product>>(INITIAL_DB);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // State for unknown product modal
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.barcode === product.barcode);
      if (existing) {
        return prev.map(item => 
          item.barcode === product.barcode ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotification(`Added ${product.name}`, 'success');
  }, [showNotification]);

  const handleScan = useCallback(async (barcode: string) => {
    // 1. If it's already in the DB, just add it
    setProductDB(currentDB => {
      if (currentDB[barcode]) {
        addToCart(currentDB[barcode]);
        return currentDB;
      }
      
      // 2. Not in DB. Let's try OpenFoodFacts first to pre-fill the name
      fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
        .then(res => res.json())
        .then(data => {
          setPendingBarcode(barcode);
          setNewProductPrice(''); // Always require the user to enter the actual price
          if (data.status === 1 && data.product && data.product.product_name) {
            setNewProductName(data.product.product_name);
          } else {
            setNewProductName('');
          }
        })
        .catch(() => {
           // API failed, prompt the user with empty fields
           setPendingBarcode(barcode);
           setNewProductName('');
           setNewProductPrice('');
        });
        
      return currentDB;
    });
  }, [addToCart]);

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingBarcode || !newProductName || !newProductPrice) return;
    
    const price = parseFloat(newProductPrice);
    if (isNaN(price)) {
      showNotification('Please enter a valid price', 'error');
      return;
    }

    const newProduct: Product = {
      barcode: pendingBarcode,
      name: newProductName,
      price: price
    };

    setProductDB(prev => ({ ...prev, [pendingBarcode]: newProduct }));
    addToCart(newProduct);
    setPendingBarcode(null);
  };

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
    window.print();
  };

  const receiptDate = useMemo(() => new Date(), [cartItems]);
  const receiptNumber = useMemo(() => `NEXUS-${Math.floor(Math.random() * 1000000)}`, [cartItems]);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', position: 'relative' }}>
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

      {/* New Product Modal */}
      {pendingBarcode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Add New Product</h3>
              <button onClick={() => setPendingBarcode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveNewProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Barcode</label>
                <input type="text" className="glass-input" value={pendingBarcode} disabled style={{ opacity: 0.7 }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Actual Product Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. Parle-G Biscuits"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Actual Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="glass-input" 
                  placeholder="e.g. 10.00"
                  value={newProductPrice}
                  onChange={e => setNewProductPrice(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="glass-button primary" style={{ marginTop: '10px' }}>
                <Plus size={18} /> Save & Add to Cart
              </button>
            </form>
          </div>
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
              Test known barcodes: 123456789, 987654321, 111222333, 555444333
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

