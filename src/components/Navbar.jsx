import { LayoutDashboard, PlusCircle, BarChart2, Target } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'entry', label: 'Veri Gir', icon: PlusCircle },
  { id: 'reports', label: 'Raporlar', icon: BarChart2 },
  { id: 'goals', label: 'Hedefler', icon: Target },
];

export default function Navbar({ active, onChange }) {
  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <div style={{ marginRight: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BarChart2 size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Ciro Takip
          </span>
        </div>

        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: active === id ? 600 : 450,
              color: active === id ? 'var(--blue)' : 'var(--secondary)',
              background: active === id ? 'var(--blue-light)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={14} strokeWidth={active === id ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
