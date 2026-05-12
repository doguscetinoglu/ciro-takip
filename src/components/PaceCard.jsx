/* Tempo Analizi — hedefe ulaşmak için gereken günlük hızı gösterir */

function PaceRow({ label, current, required, diff, ahead, done, projected, goal, pct, suffix, daysRemaining, total }) {
  const statusColor  = done ? '#34C759' : ahead ? '#34C759' : '#FBBF24';
  const barColor     = done ? '#34C759' : ahead ? '#34C759' : 'linear-gradient(90deg,#FF9F0A,#FF6B35)';
  const fmt = v => suffix === '₺' ? Math.round(v).toLocaleString('tr-TR') + ' ₺' : v.toFixed(1) + ' ' + suffix;

  return (
    <div>
      {/* Current vs Required */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 6, fontWeight: 500 }}>
            Mevcut hız / gün
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {fmt(current)}
          </div>
        </div>

        <div style={{
          background: done ? 'rgba(52,199,89,0.08)' : ahead ? 'rgba(52,199,89,0.07)' : 'rgba(255,159,10,0.08)',
          border: `1px solid ${done || ahead ? 'rgba(52,199,89,0.2)' : 'rgba(255,159,10,0.2)'}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 6, fontWeight: 500 }}>
            {daysRemaining > 0 ? 'Gereken hız / gün' : 'Ay bitti'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: statusColor, letterSpacing: '-0.5px' }}>
            {done ? '✓ Tamam' : daysRemaining > 0 ? fmt(required) : '—'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: barColor, borderRadius: 99,
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          <span>{fmt(total)}</span>
          <span style={{ fontWeight: 700, color: statusColor }}>{Math.round(pct)}%</span>
          <span>{fmt(goal)}</span>
        </div>
      </div>

      {/* Status message */}
      {done ? (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.2)',
          color: '#4ADE80', fontSize: 13, fontWeight: 600,
        }}>
          🎉 {label} hedefine ulaştın!
        </div>
      ) : daysRemaining <= 0 ? (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.4)', fontSize: 13,
        }}>
          Ay tamamlandı · Gerçekleşen: {fmt(total)} / Hedef: {fmt(goal)}
        </div>
      ) : ahead ? (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(52,199,89,0.07)', border: '1px solid rgba(52,199,89,0.15)',
          color: '#4ADE80', fontSize: 13,
        }}>
          ✓ Günde <strong>{fmt(Math.abs(diff))}</strong> öndesin
          {suffix === '₺' && <span style={{ opacity: .75 }}> · Tahmini ay sonu: {fmt(projected)}</span>}
        </div>
      ) : (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.18)',
          fontSize: 13,
        }}>
          <span style={{ color: '#FBBF24' }}>
            ⚠ Hedefe ulaşmak için kalan <strong style={{ color: '#fff' }}>{daysRemaining} günde</strong>{' '}
            günlük <strong>{fmt(required)}</strong> yapman gerekiyor
          </span>
          {suffix === '₺' && (
            <div style={{ marginTop: 5, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
              Mevcut hızla tahmini ay sonu: {fmt(projected)}
              {projected < goal && ` (hedefe ${fmt(goal - projected)} uzak)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaceCard({ entries, goals }) {
  const today        = new Date();
  const year         = today.getFullYear();
  const month        = today.getMonth();
  const monthKey     = `${year}-${String(month + 1).padStart(2, '0')}`;
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const daysPassed   = today.getDate();
  const daysRemaining = daysInMonth - daysPassed;

  const goal = goals[monthKey] || {};
  if (!goal.ciroGoal && !goal.salesGoal) return null;

  const me          = entries.filter(e => e.date.startsWith(monthKey));
  const totalCiro   = me.reduce((s, e) => s + Number(e.ciro),  0);
  const totalSales  = me.reduce((s, e) => s + Number(e.sales), 0);

  /* ── Ciro pace ── */
  const currentCiroDaily  = daysPassed > 0 ? totalCiro / daysPassed : 0;
  const ciroRemaining     = Math.max(0, (goal.ciroGoal || 0) - totalCiro);
  const requiredCiroDaily = daysRemaining > 0 ? ciroRemaining / daysRemaining : 0;
  const ciroDiff          = requiredCiroDaily - currentCiroDaily;
  const ciroAhead         = ciroDiff <= 0;
  const ciroDone          = totalCiro >= (goal.ciroGoal || 0) && goal.ciroGoal > 0;
  const ciroProjected     = currentCiroDaily * daysInMonth;
  const ciroPct           = goal.ciroGoal > 0 ? Math.min(100, (totalCiro / goal.ciroGoal) * 100) : 0;

  /* ── Sales pace ── */
  const currentSalesDaily  = daysPassed > 0 ? totalSales / daysPassed : 0;
  const salesRemaining     = Math.max(0, (goal.salesGoal || 0) - totalSales);
  const requiredSalesDaily = daysRemaining > 0 ? salesRemaining / daysRemaining : 0;
  const salesDiff          = requiredSalesDaily - currentSalesDaily;
  const salesAhead         = salesDiff <= 0;
  const salesDone          = totalSales >= (goal.salesGoal || 0) && goal.salesGoal > 0;
  const salesProjected     = Math.round(currentSalesDaily * daysInMonth);
  const salesPct           = goal.salesGoal > 0 ? Math.min(100, (totalSales / goal.salesGoal) * 100) : 0;

  const monthLabel = today.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="glass-card dash-fade-5" style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>
            Tempo Analizi · {monthLabel}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            Hedefe Ulaşmak İçin Günlük Hız
          </div>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 20, flexShrink: 0,
          background: daysRemaining <= 5 ? 'rgba(255,59,48,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${daysRemaining <= 5 ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.1)'}`,
          fontSize: 12, fontWeight: 700,
          color: daysRemaining <= 5 ? '#FF6B6B' : 'rgba(255,255,255,0.5)',
        }}>
          {daysRemaining > 0 ? `${daysRemaining} gün kaldı` : 'Ay tamamlandı'}
        </div>
      </div>

      {/* Ciro section */}
      {goal.ciroGoal > 0 && (
        <div style={{ marginBottom: goal.salesGoal > 0 ? 28 : 0 }}>
          {goal.salesGoal > 0 && (
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Ciro
            </div>
          )}
          <PaceRow
            label="Ciro"
            current={currentCiroDaily}
            required={requiredCiroDaily}
            diff={ciroDiff}
            ahead={ciroAhead}
            done={ciroDone}
            projected={ciroProjected}
            goal={goal.ciroGoal}
            pct={ciroPct}
            suffix="₺"
            daysRemaining={daysRemaining}
            total={totalCiro}
          />
        </div>
      )}

      {/* Divider */}
      {goal.ciroGoal > 0 && goal.salesGoal > 0 && (
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />
      )}

      {/* Sales section */}
      {goal.salesGoal > 0 && (
        <div>
          {goal.ciroGoal > 0 && (
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Satış Adedi
            </div>
          )}
          <PaceRow
            label="Satış"
            current={currentSalesDaily}
            required={requiredSalesDaily}
            diff={salesDiff}
            ahead={salesAhead}
            done={salesDone}
            projected={salesProjected}
            goal={goal.salesGoal}
            pct={salesPct}
            suffix="adet"
            daysRemaining={daysRemaining}
            total={totalSales}
          />
        </div>
      )}
    </div>
  );
}
