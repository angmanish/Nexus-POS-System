import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, Keyboard } from 'lucide-react';

interface ScannerProps {
  onScan: (barcode: string) => void;
}

export default function Scanner({ onScan }: ScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [useCamera, setUseCamera] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (useCamera) {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      );
      
      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          // Optional: pause or beep here
        },
        (_error) => {
          // Ignore frequent scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [useCamera, onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2><ScanLine size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> Barcode Scanner</h2>
        <button 
          className="glass-button" 
          onClick={() => setUseCamera(!useCamera)}
        >
          {useCamera ? <Keyboard size={18} /> : <ScanLine size={18} />}
          {useCamera ? 'Manual Input' : 'Use Camera'}
        </button>
      </div>

      {useCamera ? (
        <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--glass-border)' }}></div>
      ) : (
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Enter barcode or scan with hardware scanner..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="glass-button primary">Add</button>
        </form>
      )}
    </div>
  );
}
