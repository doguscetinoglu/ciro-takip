import { useState } from 'react';
import { saveGoal } from '../utils/api';

const s = {
  page: { maxWidth: 760, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 },
  card: { background: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow-sm)' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--secondary)', marginBottom: 6 },
  input: {
    width: '100%',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 15,
    color: 'var(--text)',
    background: 'var(--bg)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
};

function monthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = -2; i <= 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
    opts.push({ key, label });
  }
  return opts;
}

function ProgressBar({ label, current, goal, color }) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const done = pct >= 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--green)' : color }}>
          {pct}% {done && '✓'}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: done ? 'var(--green)' : color,
          borderRadius: 99,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--tertiary)' }}>
          {typeof current === 'number' && current > 999 ? current.toLocaleString('tr-TR') + ' ₺' : current}
        </span>
        <span style={{ fontSize: 12, color: 'var(--tertiary)' }}>
          {typeof goal === 'number' && goal > 999 ? goal.toLocaleString('tr-TR') + ' ₺' : goal}
        </span>
      </div>
    </div>
  );
}

export default function Goals({ goals, entries, onRefresh }) {
  const options = monthOptions();
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentKey);
  const [ciroGoal, setCiroGoal] = useState('');
  const [salesGoal, setSalesGoal] = useState('');
  const [saved, setSaved] = useState(false);
  const [focus, setFocus] = useState('');

  const existing = goals[selectedMonth] || {};
  const monthEntries = entries.filter(e => e.date.startsWith(selectedMonth));
  const actualCiro = monthEntries.reduce((s, e) => s + Number(e.ciro), 0);
  const actualSales = monthEntries.reduce((s, e) => s + Number(e.sales), 0);

  async function handleSave(e) {
    e.preventDefault();
    try {
      await saveGoal(selectedMonth, Number(ciroGoal) || 0, Number(salesGoal) || 0);
      await onRefresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.message);
    }
  }

  const inputStyle = (name) => ({
    ...s.input,
    borderColor: focus === name ? 'var(--blue)' : 'rgba(0,0,0,0.1)',
    boxShadow: focus === name ? '0 0 0 3px rgba(0,113,227,0.12)' : 'none',
  });

  return (
    <div className="page page-pad" style={s.page}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 500, marginBottom: 4 }}>Performans</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.6px' }}>Hedefler</div>
      </div>

      <form onSubmit={handleSave} style={s.card}>
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>Ay</label>
          <select
            value={selectedMonth}
            onChange={e => { setSelectedMonth(e.target.value); setSaved(false); setCiroGoal(''); setSalesGoal(''); }}
            style={{ ...inputStyle('month'), cursor: 'pointer' }}
            onFocus={() => setFocus('month')}
            onBlur={() => setFocus('')}
          >
            {options.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={s.label}>Ciro Hedefi (₺)</label>
            <input
              type="number" min="0"
              value={ciroGoal !== '' ? ciroGoal : (existing.ciroGoal || '')}
              onChange={e => setCiroGoal(e.target.value)}
              placeholder={existing.ciroGoal ? String(existing.ciroGoal) : 'Örn: 500000'}
              onFocus={() => setFocus('ciro')}
              onBlur={() => setFocus('')}
              style={inputStyle('ciro')}
            />
          </div>
          <div>
            <label style={s.label}>Satış Hedefi (adet)</label>
            <input
              type="number" min="0"
              value={salesGoal !== '' ? salesGoal : (existing.salesGoal || '')}
              onChange={e => setSalesGoal(e.target.value)}
              placeholder={existing.salesGoal ? String(existing.salesGoal) : 'Örn: 150'}
              onFocus={() => setFocus('sales')}
              onBlur={() => setFocus('')}
              style={inputStyle('sales')}
            />
          </div>
        </div>

        {saved && (
          <div style={{
            background: 'var(--green-light)', color: 'var(--green)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16,
          }}>
            Hedef kaydedildi.
          </div>
        )}

        <button
          type="submit"
          style={{
            background: 'var(--blue)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.88}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}
        >
          Kaydet
        </button>
      </form>

      {/* Current progress */}
      {existing.ciroGoal > 0 || existing.salesGoal > 0 ? (
        <div style={s.card}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>{selectedMonth} Gerçekleşme</div>
          {existing.ciroGoal > 0 && (
            <ProgressBar
              label="Ciro Hedefi"
              current={actualCiro}
              goal={existing.ciroGoal}
              color="var(--blue)"
            />
          )}
          {existing.salesGoal > 0 && (
            <ProgressBar
              label="Satış Hedefi"
              current={actualSales}
              goal={existing.salesGoal}
              color="var(--purple)"
            />
          )}
        </div>
      ) : null}

      {/* All goals */}
      {Object.keys(goals).length > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--separator)' }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Tüm Hedefler</span>
          </div>
          <div className="table-wrap goals-table">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Ay', 'Ciro Hedefi', 'Gerçekleşen', 'Satış Hedefi', 'Gerçekleşen'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: 'var(--tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(goals).sort(([a], [b]) => b.localeCompare(a)).map(([key, g]) => {
                const me = entries.filter(e => e.date.startsWith(key));
                const aC = me.reduce((s, e) => s + Number(e.ciro), 0);
                const aS = me.reduce((s, e) => s + Number(e.sales), 0);
                return (
                  <tr key={key} style={{ borderTop: '1px solid var(--separator)' }}>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--text)' }}>{key}</td>
                    <td style={{ padding: '13px 20px', color: 'var(--secondary)' }}>{g.ciroGoal > 0 ? g.ciroGoal.toLocaleString('tr-TR') + ' ₺' : '—'}</td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: g.ciroGoal > 0 && aC >= g.ciroGoal ? 'var(--green)' : 'var(--blue)' }}>
                      {aC.toLocaleString('tr-TR')} ₺
                    </td>
                    <td style={{ padding: '13px 20px', color: 'var(--secondary)' }}>{g.salesGoal > 0 ? g.salesGoal + ' adet' : '—'}</td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: g.salesGoal > 0 && aS >= g.salesGoal ? 'var(--green)' : 'var(--text)' }}>
                      {aS} adet
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
