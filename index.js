import { useEffect, useState } from 'react';
import { TARIFS } from '../lib/tarifs';

export default function Home() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dates')
      .then((r) => r.json())
      .then(setDates);
  }, []);

  const remaining = selectedDate
    ? dates.find((d) => d.id === selectedDate)?.remaining ?? 0
    : 0;

  const price = selectedTarif ? TARIFS[selectedTarif].price / 100 : 0;
  const total = price * quantity;

  async function handlePay() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_id: selectedDate, tarif: selectedTarif, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setError('Impossible de contacter le serveur.');
      setLoading(false);
    }
  }

  const canPay = selectedDate && selectedTarif && quantity >= 1 && quantity <= remaining;

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', color: '#2C2619' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Réserver un emplacement</h1>
      <p style={{ color: '#5A5142', marginBottom: 32 }}>Provence Greniers — Châteaurenard (13)</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>1. Choisissez une date</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {dates.map((d) => (
            <button
              key={d.id}
              onClick={() => { setSelectedDate(d.id); setQuantity(1); }}
              disabled={d.remaining === 0}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 10,
                border: selectedDate === d.id ? '2px solid #7B2635' : '1px solid #ddd',
                background: d.remaining === 0 ? '#f2f2f2' : '#fff',
                cursor: d.remaining === 0 ? 'not-allowed' : 'pointer',
                opacity: d.remaining === 0 ? 0.5 : 1,
              }}
            >
              <strong>{d.label}</strong>
              <div style={{ fontSize: '0.85rem', color: '#5A5142' }}>
                {d.remaining === 0 ? 'Complet' : `${d.remaining} places restantes sur ${d.total_spots}`}
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedDate && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>2. Choisissez votre profil</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {Object.entries(TARIFS).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setSelectedTarif(key)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: selectedTarif === key ? '2px solid #7B2635' : '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <strong>{t.label}</strong> — {(t.price / 100).toFixed(0)}€
                <div style={{ fontSize: '0.85rem', color: '#5A5142' }}>{t.dimensions}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedTarif && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>3. Nombre de places</h2>
          <input
            type="number"
            min="1"
            max={remaining}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(remaining, Number(e.target.value))))}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', width: 100, fontSize: '1rem' }}
          />
          <span style={{ marginLeft: 10, color: '#5A5142', fontSize: '0.9rem' }}>
            ({remaining} disponibles)
          </span>
        </section>
      )}

      {canPay && (
        <section style={{ padding: 20, background: '#F5EEE0', borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span>Total à payer</span>
            <strong style={{ fontSize: '1.3rem' }}>{total.toFixed(0)}€</strong>
          </div>
          <button
            onClick={handlePay}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: '#7B2635',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Redirection vers Stripe...' : 'Payer avec Stripe'}
          </button>
        </section>
      )}

      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
    </main>
  );
}
