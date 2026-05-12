import { useEffect, useState } from 'react';
import { LayoutDashboard, PlusCircle, BarChart2, Target } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Genel Bakış', short: 'Bakış',   icon: LayoutDashboard },
  { id: 'entry',     label: 'Veri Gir',    short: 'Veri Gir', icon: PlusCircle },
  { id: 'reports',   label: 'Raporlar',    short: 'Rapor',    icon: BarChart2 },
  { id: 'goals',     label: 'Hedefler',    short: 'Hedef',    icon: Target },
];

function useIsMobile() {
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return v;
}

export default function Navbar({ active, onChange }) {
  const isMobile = useIsMobile();

  const glassStyle = {
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: 'var(--blue)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <BarChart2 size={15} color="#fff" strokeWidth={2.5} />
      </div>
      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.3px' }}>
        Ciro Takip
      </span>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile top bar — logo only */}
        <nav style={{
          ...glassStyle,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky', top: 0, zIndex: 100,
          height: 50,
          display: 'flex', alignItems: 'center',
          padding: '0 16px',
        }}>
          <Logo />
        </nav>

        {/* Mobile bottom tab bar */}
        <div style={{
          ...glassStyle,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {tabs.map(({ id, short, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 3,
                  padding: '10px 0',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: isActive ? 'var(--blue)' : 'var(--tertiary)',
                  transition: 'color 0.15s',
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '0.1px' }}>
                  {short}
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  /* Desktop */
  return (
    <nav style={{
      ...glassStyle,
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <div style={{ marginRight: 28 }}>
          <Logo />
        </div>
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 450,
                color: isActive ? 'var(--blue)' : 'var(--secondary)',
                background: isActive ? 'var(--blue-light)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
