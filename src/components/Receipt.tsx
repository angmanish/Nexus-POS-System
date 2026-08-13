import type { CartItem } from '../types';

interface ReceiptProps {
  items: CartItem[];
  date: Date;
  receiptNumber: string;
}

export default function Receipt({ items, date, receiptNumber }: ReceiptProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="receipt-print no-print" style={{ 
      display: 'none', 
      padding: '20px',
      background: '#fff',
      color: '#000'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>NEXUS STORE</h2>
        <p style={{ margin: '0 0 5px 0' }}>123 Cyber Street, Tech City</p>
        <p style={{ margin: '0 0 15px 0' }}>Tel: (555) 123-4567</p>
        <div style={{ borderBottom: '1px dashed #000', marginBottom: '15px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Receipt #:</span>
          <span>{receiptNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span>Date:</span>
          <span>{date.toLocaleString()}</span>
        </div>
        <div style={{ borderBottom: '1px dashed #000', marginBottom: '15px' }}></div>
      </div>

      <div style={{ width: '100%', marginBottom: '15px' }}>
        <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: '10px' }}>
          <span style={{ flex: 2 }}>Item</span>
          <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
          <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
        </div>
        
        {items.map(item => (
          <div key={item.barcode} style={{ display: 'flex', marginBottom: '8px' }}>
            <span style={{ flex: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </span>
            <span style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</span>
            <span style={{ flex: 1, textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px dashed #000', marginBottom: '15px' }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>
        <span>TOTAL:</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ margin: '0 0 5px 0' }}>Thank you for shopping!</p>
        <p style={{ margin: '0 0 5px 0' }}>Powered by Nexus POS</p>
      </div>
      
      {/* Global override when printing to ensure only receipt is visible */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-print, .receipt-print * {
            visibility: visible;
          }
          .receipt-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
