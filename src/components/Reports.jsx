import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { exportExcel, exportPDF } from '../utils/export';

const s = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 },
  card: { background: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow-sm)' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.2px', marginBottom: 20 },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(29,29,31,0.88)',
      backdropFilter: 'blur(12px)',
      borderRadius: 10,
      padding: '10px 14px',
      color: '#fff',
      fontSize: 13,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontSize: 12 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontWeight: 600 }}>
          {p.dataKey === 'ciro'
            ? `${Number(p.value).toLocaleString('tr-TR')} ₺`
            : `${p.value} adet`}
        </div>
      ))}
    </div>
  );
}

function ExportBtn({ onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = 0.88}
      onMouseLeave={e => e.currentTarget.style.opacity = 1}
    >
      {label}
    </button>
  );
}

export default function Reports({ entries }) {
  const months = [...new Set(entries.map(e => e.date.slice(0, 7)))].sort().reverse();
  const [selected, setSelected] = useState(months[0] || '');

  if (entries.length === 0) {
    return (
      <div style={{ ...s.page, alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Henüz veri yok</div>
          <div style={{ color: 'var(--tertiary)', fontSize: 13, marginTop: 6 }}>Veri girdikten sonra raporlar burada görünür.</div>
        </div>
      </div>
    );
  }

  const monthEntries = entries.filter(e => e.date.startsWith(selected)).sort((a, b) => a.date.localeCompare(b.date));
  const totalCiro = monthEntries.reduce((s, e) => s + Number(e.ciro), 0);
  const totalSales = monthEntries.reduce((s, e) => s + Number(e.sales), 0);
  const avgOrder = totalSales > 0 ? Math.round(totalCiro / totalSales) : 0;

  const allMonths = [...new Set(entries.map(e => e.date.slice(0, 7)))].sort().slice(-12);
  const monthlyTrend = allMonths.map(m => {
    const me = entries.filter(e => e.date.startsWith(m));
    return {
      month: m.slice(5),
      ciro: me.reduce((s, e) => s + Number(e.ciro), 0),
      sales: me.reduce((s, e) => s + Number(e.sales), 0),
    };
  });

  return (
    <div className="page page-pad" style={s.page}>
      {/* Header */}
      <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 500, marginBottom: 4 }}>Detaylı Analiz</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.6px' }}>Raporlar</div>
        </div>
        <div className="full-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text)',
              background: 'var(--card)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ExportBtn onClick={() => exportExcel(monthEntries, selected)} label="↓ Excel" color="#34C759" />
          <ExportBtn onClick={() => exportPDF(monthEntries, selected, totalCiro, totalSales)} label="↓ PDF" color="#FF3B30" />
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Toplam Ciro', value: `${totalCiro.toLocaleString('tr-TR')} ₺`, color: 'var(--blue)' },
          { label: 'Toplam Satış', value: `${totalSales} adet` },
          { label: 'Kayıtlı Gün', value: `${monthEntries.length} gün` },
          { label: 'Ort. Sipariş', value: avgOrder > 0 ? `${avgOrder.toLocaleString('tr-TR')} ₺` : '—' },
        ].map(({ label, value, color }) => (
          <div key={label} style={s.card}>
            <div style={{ fontSize: 12, color: 'var(--tertiary)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--text)', letterSpacing: '-0.5px' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      {monthEntries.length > 0 && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Günlük Ciro — {selected}</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthEntries.map(e => ({ date: e.date.slice(5), ciro: e.ciro, sales: e.sales }))} barSize={24}>
              <CartesianGrid strokeDasharray="0" stroke="var(--separator)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--tertiary)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--tertiary)', fontFamily: 'inherit' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} width={38} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="ciro" fill="#0071E3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly trend */}
      {monthlyTrend.length > 1 && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Aylık Ciro Trendi</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="0" stroke="var(--separator)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--tertiary)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--tertiary)', fontFamily: 'inherit' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} width={38} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--blue)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="ciro" stroke="#0071E3" strokeWidth={2.5} dot={false}
                activeDot={{ r: 4, fill: '#0071E3', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--separator)' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Gün Detayı</span>
        </div>
        <div className="table-wrap reports-table">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Tarih', 'Ciro', 'Satış Adedi', 'Kümülatif Ciro'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: 'var(--tertiary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cum = 0;
              return monthEntries.map(e => {
                cum += Number(e.ciro);
                return (
                  <tr key={e.date} style={{ borderTop: '1px solid var(--separator)' }}>
                    <td style={{ padding: '12px 20px', color: 'var(--secondary)', fontWeight: 500 }}>{e.date}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--blue)' }}>{Number(e.ciro).toLocaleString('tr-TR')} ₺</td>
                    <td style={{ padding: '12px 20px' }}>{e.sales} adet</td>
                    <td style={{ padding: '12px 20px', color: 'var(--secondary)' }}>{cum.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                );
              });
            })()}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid var(--separator)', background: 'var(--bg)' }}>
              <td style={{ padding: '12px 20px', fontWeight: 600, fontSize: 13, color: 'var(--secondary)' }}>Toplam</td>
              <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--blue)' }}>{totalCiro.toLocaleString('tr-TR')} ₺</td>
              <td style={{ padding: '12px 20px', fontWeight: 700 }}>{totalSales} adet</td>
              <td />
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    </div>
  );
}
