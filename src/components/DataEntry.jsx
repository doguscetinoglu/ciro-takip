import { useState } from 'react';
import { saveEntry, deleteEntry } from '../utils/api';
import { Trash2, CheckCircle2 } from 'lucide-react';

const s = {
  page: { maxWidth: 760, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 },
  card: { background: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow-sm)' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--secondary)', marginBottom: 6 },
  input: {
    width: '100%',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: 15,
    color: 'var(--text)',
    background: 'var(--bg)',
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  },
};

export default function DataEntry({ entries, onRefresh }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [ciro, setCiro] = useState('');
  const [sales, setSales] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState('');

  const monthKey = date.slice(0, 7);
  const monthEntries = entries
    .filter(e => e.date.startsWith(monthKey))
    .sort((a, b) => b.date.localeCompare(a.date));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ciro || isNaN(ciro) || Number(ciro) < 0) return setError('Geçerli bir ciro tutarı girin.');
    if (!sales || isNaN(sales) || Number(sales) < 0) return setError('Geçerli bir satış adedi girin.');
    setError('');
    try {
      await saveEntry({ date, ciro: Number(ciro), sales: Number(sales) });
      await onRefresh();
      setSaved(true);
      setCiro('');
      setSales('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(entry) {
    if (!confirm(`${entry.date} kaydı silinsin mi?`)) return;
    try {
      await deleteEntry(entry.date);
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  }

  const monthTotal = monthEntries.reduce((s, e) => s + Number(e.ciro), 0);
  const salesTotal = monthEntries.reduce((s, e) => s + Number(e.sales), 0);

  const inputStyle = (name) => ({
    ...s.input,
    borderColor: focus === name ? 'var(--blue)' : 'rgba(0,0,0,0.1)',
    boxShadow: focus === name ? '0 0 0 3px rgba(0,113,227,0.12)' : 'none',
  });

  return (
    <div style={s.page}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 500, marginBottom: 4 }}>Günlük Kayıt</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.6px' }}>Veri Gir</div>
      </div>

      <form onSubmit={handleSubmit} style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={s.label}>Tarih</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              onFocus={() => setFocus('date')}
              onBlur={() => setFocus('')}
              style={inputStyle('date')}
            />
          </div>
          <div>
            <label style={s.label}>Ciro (₺)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={ciro}
              onChange={e => setCiro(e.target.value)}
              placeholder="0"
              onFocus={() => setFocus('ciro')}
              onBlur={() => setFocus('')}
              style={inputStyle('ciro')}
            />
          </div>
          <div>
            <label style={s.label}>Satış Adedi</label>
            <input
              type="number"
              min="0"
              value={sales}
              onChange={e => setSales(e.target.value)}
              placeholder="0"
              onFocus={() => setFocus('sales')}
              onBlur={() => setFocus('')}
              style={inputStyle('sales')}
            />
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-light)', color: 'var(--red)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--green-light)', color: 'var(--green)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            fontSize: 13, marginBottom: 16,
          }}>
            <CheckCircle2 size={15} />
            Kayıt eklendi.
          </div>
        )}

        <button
          type="submit"
          style={{
            background: 'var(--blue)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 22px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.target.style.opacity = 0.88}
          onMouseLeave={e => e.target.style.opacity = 1}
        >
          Kaydet
        </button>
      </form>

      {monthEntries.length > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--separator)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{monthKey} Kayıtları</span>
            <span style={{ fontSize: 13, color: 'var(--secondary)' }}>{monthEntries.length} gün</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Tarih', 'Ciro', 'Satış', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left',
                    fontSize: 12, fontWeight: 500, color: 'var(--tertiary)',
                    letterSpacing: '0.3px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthEntries.map((e, i) => (
                <tr key={e.date} style={{ borderTop: '1px solid var(--separator)' }}>
                  <td style={{ padding: '13px 20px', color: 'var(--secondary)', fontWeight: 500 }}>{e.date}</td>
                  <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--blue)' }}>
                    {Number(e.ciro).toLocaleString('tr-TR')} ₺
                  </td>
                  <td style={{ padding: '13px 20px', color: 'var(--text)' }}>{e.sales} adet</td>
                  <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tertiary)', padding: 4, transition: 'color 0.15s' }}
                      onMouseEnter={ev => ev.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={ev => ev.currentTarget.style.color = 'var(--tertiary)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid var(--separator)', background: 'var(--bg)' }}>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--secondary)' }}>Toplam</td>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--blue)' }}>
                  {monthTotal.toLocaleString('tr-TR')} ₺
                </td>
                <td style={{ padding: '12px 20px', fontWeight: 700 }}>{salesTotal} adet</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
