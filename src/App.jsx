import { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DataEntry from './components/DataEntry';
import Reports from './components/Reports';
import Goals from './components/Goals';
import { getEntries, getGoals } from './utils/api';
import './index.css';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [e, g] = await Promise.all([getEntries(), getGoals()]);
      setEntries(e);
      setGoals(g);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #060D1F 0%, #0D1933 45%, #0A0618 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #0071E3', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Yükleniyor…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, padding: 24,
      }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Bağlantı Hatası</div>
        <div style={{ color: 'var(--secondary)', fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
          {error}
        </div>
        <button
          onClick={() => { setLoading(true); refresh(); }}
          style={{
            background: 'var(--blue)', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 22px', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', marginTop: 8,
          }}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar active={tab} onChange={setTab} />
      {tab === 'dashboard' && <Dashboard entries={entries} goals={goals} />}
      {tab === 'entry'     && <DataEntry entries={entries} onRefresh={refresh} />}
      {tab === 'reports'   && <Reports entries={entries} />}
      {tab === 'goals'     && <Goals entries={entries} goals={goals} onRefresh={refresh} />}
    </div>
  );
}
