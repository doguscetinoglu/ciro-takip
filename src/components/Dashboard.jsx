import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

/* ── count-up hook ── */
function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    const t0 = performance.now();
    let raf;
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ── gradient ring ── */
function Ring({ pct, color, size = 90 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  const done = pct >= 100;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={done ? '#34C759' : color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)',
            filter: `drop-shadow(0 0 6px ${done ? '#34C759' : color})`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800,
        color: done ? '#34C759' : color,
        textShadow: `0 0 12px ${done ? '#34C759' : color}`,
      }}>
        {Math.round(pct)}%
      </div>
    </div>
  );
}

/* ── stat card ── */
const CARDS_META = [
  { id: 'ciro',  label: 'Aylık Ciro',     suffix: '₺',    grad: 'linear-gradient(135deg,#0071E3,#5856D6)', glow: 'rgba(0,113,227,.65)',   bg: 'rgba(0,113,227,.12)',  icon: '₺' },
  { id: 'sales', label: 'Toplam Satış',    suffix: 'adet', grad: 'linear-gradient(135deg,#34C759,#00BCD4)', glow: 'rgba(52,199,89,.6)',    bg: 'rgba(52,199,89,.1)',   icon: '↑' },
  { id: 'avg',   label: 'Günlük Ort.',     suffix: '₺',    grad: 'linear-gradient(135deg,#FF9F0A,#FF6B35)', glow: 'rgba(255,159,10,.6)',   bg: 'rgba(255,159,10,.1)',  icon: '◎' },
  { id: 'order', label: 'Ort. Sipariş',    suffix: '₺',    grad: 'linear-gradient(135deg,#BF5AF2,#FF375F)', glow: 'rgba(191,90,242,.55)',  bg: 'rgba(191,90,242,.1)',  icon: '★' },
];

function StatCard({ meta, value, rawValue, trend, sub, delay }) {
  const animated = useCountUp(rawValue);
  const display = rawValue > 999
    ? animated.toLocaleString('tr-TR')
    : animated;

  return (
    <div
      className={`stat-card dash-fade-${delay}`}
      style={{
        background: meta.grad,
        boxShadow: `0 8px 32px ${meta.glow}, 0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.18)`,
        padding: '24px 22px',
      }}
    >
      <div className="stat-card-inner-shine" />

      {/* top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, fontWeight: 700, color: '#fff',
          backdropFilter: 'blur(6px)',
        }}>
          {meta.icon}
        </div>
        {trend !== null && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '4px 8px', borderRadius: 20,
            background: trend >= 0 ? 'rgba(52,199,89,.25)' : 'rgba(255,59,48,.25)',
            color: trend >= 0 ? '#4ADE80' : '#FF6B6B',
            fontSize: 12, fontWeight: 700,
          }}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* value */}
      <div style={{
        fontSize: meta.id === 'sales' ? 40 : 34,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '-1.5px',
        lineHeight: 1,
        marginBottom: 6,
        textShadow: '0 2px 12px rgba(0,0,0,.25)',
      }}>
        {display}
        {meta.id !== 'sales' && (
          <span style={{ fontSize: 18, fontWeight: 600, marginLeft: 4, opacity: .85 }}>₺</span>
        )}
        {meta.id === 'sales' && (
          <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 6, opacity: .75 }}>adet</span>
        )}
      </div>

      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
        {meta.label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

/* ── custom tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,14,30,0.92)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 16px',
      backdropFilter: 'blur(16px)',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 5 }}>{label}</div>
      <div style={{ color: '#60A5FA', fontWeight: 700, fontSize: 15 }}>
        {Number(payload[0].value).toLocaleString('tr-TR')} ₺
      </div>
    </div>
  );
}

/* ── main ── */
export default function Dashboard({ entries, goals }) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey  = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const me   = entries.filter(e => e.date.startsWith(monthKey));
  const prev = entries.filter(e => e.date.startsWith(prevKey));

  const totalCiro  = me.reduce((s, e) => s + Number(e.ciro), 0);
  const totalSales = me.reduce((s, e) => s + Number(e.sales), 0);
  const prevCiro   = prev.reduce((s, e) => s + Number(e.ciro), 0);
  const prevSales  = prev.reduce((s, e) => s + Number(e.sales), 0);

  const dailyMap = {};
  me.forEach(e => { dailyMap[e.date] = { ciro: Number(e.ciro), sales: Number(e.sales) }; });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date: date.slice(5), ...v }));

  const avgCiro  = dailyData.length > 0 ? Math.round(totalCiro / dailyData.length) : 0;
  const avgOrder = totalSales > 0 ? Math.round(totalCiro / totalSales) : 0;

  const ciroTrend  = prevCiro  > 0 ? Math.round(((totalCiro  - prevCiro)  / prevCiro)  * 100) : null;
  const salesTrend = prevSales > 0 ? Math.round(((totalSales - prevSales) / prevSales) * 100) : null;

  const goal     = goals[monthKey] || {};
  const ciroPct  = goal.ciroGoal  > 0 ? (totalCiro  / goal.ciroGoal)  * 100 : 0;
  const salesPct = goal.salesGoal > 0 ? (totalSales / goal.salesGoal) * 100 : 0;

  const monthLabel = now.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  const cardValues = [
    { raw: totalCiro,  trend: ciroTrend,  sub: prevCiro  > 0 ? `Geçen ay ${prevCiro.toLocaleString('tr-TR')} ₺`   : 'İlk ay' },
    { raw: totalSales, trend: salesTrend, sub: prevSales > 0 ? `Geçen ay ${prevSales} adet` : 'İlk ay' },
    { raw: avgCiro,    trend: null,        sub: `${dailyData.length} gün kayıtlı` },
    { raw: avgOrder,   trend: null,        sub: 'Ciro ÷ Satış adedi' },
  ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: 'linear-gradient(160deg, #060D1F 0%, #0D1933 45%, #0A0618 100%)',
      backgroundAttachment: 'fixed',
    }}>
      {/* dot grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '5%', left: '10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,113,227,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(175,82,222,0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 800, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(52,199,89,0.04) 0%, transparent 70%)',
        }} />
      </div>

      {/* content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 48px', position: 'relative', zIndex: 1 }}>

        {/* header */}
        <div className="dash-fade-1" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase' }}>
            {monthLabel}
          </div>
          <div style={{
            fontSize: 34, fontWeight: 800, letterSpacing: '-1px',
            background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Genel Bakış
          </div>
        </div>

        {/* stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          {CARDS_META.map((meta, i) => (
            <StatCard
              key={meta.id}
              meta={meta}
              rawValue={cardValues[i].raw}
              trend={cardValues[i].trend}
              sub={cardValues[i].sub}
              delay={i + 2}
            />
          ))}
        </div>

        {/* goals row */}
        {(goal.ciroGoal > 0 || goal.salesGoal > 0) && (
          <div className="glass-card dash-fade-5" style={{ padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>
              Aylık Hedefler
            </div>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
              {goal.ciroGoal > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <Ring pct={ciroPct} color="#0071E3" />
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ciro Hedefi</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{totalCiro.toLocaleString('tr-TR')} ₺</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/ {goal.ciroGoal.toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>
              )}
              {goal.salesGoal > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <Ring pct={salesPct} color="#34C759" />
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Satış Hedefi</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{totalSales} adet</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/ {goal.salesGoal} adet</div>
                  </div>
                </div>
              )}

              {/* divider line */}
              {(goal.ciroGoal > 0 && goal.salesGoal > 0) && (
                <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
              )}

              {/* remaining text */}
              <div>
                {goal.ciroGoal > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Kalan Ciro</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: ciroPct >= 100 ? '#34C759' : '#60A5FA' }}>
                      {ciroPct >= 100 ? '✓ Tamamlandı' : `${Math.max(0, goal.ciroGoal - totalCiro).toLocaleString('tr-TR')} ₺`}
                    </div>
                  </div>
                )}
                {goal.salesGoal > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Kalan Satış</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: salesPct >= 100 ? '#34C759' : '#4ADE80' }}>
                      {salesPct >= 100 ? '✓ Tamamlandı' : `${Math.max(0, goal.salesGoal - totalSales)} adet`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* chart */}
        {dailyData.length > 0 && (
          <div className="glass-card dash-fade-5" style={{ padding: '24px 28px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
                  Günlük Ciro
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                  {totalCiro.toLocaleString('tr-TR')} ₺
                </div>
              </div>
              <div style={{
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(0,113,227,0.2)',
                border: '1px solid rgba(0,113,227,0.3)',
                color: '#60A5FA', fontSize: 12, fontWeight: 600,
              }}>
                {dailyData.length} gün
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#0071E3" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0071E3" stopOpacity={0.02} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                  width={38}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(96,165,250,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone" dataKey="ciro"
                  stroke="#3B82F6" strokeWidth={2.5}
                  fill="url(#blueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#60A5FA', strokeWidth: 0, filter: 'url(#glow)' }}
                  style={{ filter: 'url(#glow)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* empty state */}
        {entries.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            color: 'rgba(255,255,255,0.35)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Henüz veri yok</div>
            <div style={{ fontSize: 14 }}>"Veri Gir" sekmesinden günlük ciro ve satış adedini ekle.</div>
          </div>
        )}
      </div>
    </div>
  );
}
