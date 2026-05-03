import { useMemo } from 'react';
import { useWallets } from '../hooks/useWallets';
import { Icon } from '../components/Icon';
import { formatMoney } from '../utils/format';

const THEME_COLORS = {
  emerald:  '#0aa177',
  sapphire: '#2e5bd9',
  graphite: '#475669',
  bronze:   '#c98a17',
};

const CATEGORY_ICONS = {
  food:          '🍔',
  transport:     '🚌',
  travel:        '✈️',
  shopping:      '🛍️',
  bills:         '💡',
  entertainment: '🎬',
  general:       '📦',
  other:         '💼',
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--paper)', border: '1px solid var(--ink-100)',
      borderRadius: 16, padding: '20px 22px',
    }}>
      <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: accent || 'var(--ink-900)', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function MonthlyBarChart({ months }) {
  const maxVal = Math.max(...months.flatMap((m) => [m.in, m.out]), 1);
  const BAR_W = 18;
  const GAP   = 6;
  const GROUP = BAR_W * 2 + GAP + 16;
  const H     = 120;
  const total = months.length;
  const W     = total * GROUP;

  return (
    <svg viewBox={`0 0 ${W} ${H + 32}`} style={{ width: '100%', overflow: 'visible' }}>
      {months.map((m, i) => {
        const x     = i * GROUP;
        const inH   = Math.round((m.in  / maxVal) * H);
        const outH  = Math.round((m.out / maxVal) * H);
        const inY   = H - inH;
        const outY  = H - outH;
        return (
          <g key={m.label}>
            {/* Credit bar */}
            <rect x={x} y={inY} width={BAR_W} height={inH || 2}
              fill="var(--brand-500)" rx={4} opacity={.85} />
            {/* Debit bar */}
            <rect x={x + BAR_W + GAP} y={outY} width={BAR_W} height={outH || 2}
              fill="var(--ink-300)" rx={4} opacity={.85} />
            {/* Month label */}
            <text x={x + BAR_W} y={H + 18}
              textAnchor="middle" fontSize="11" fill="var(--ink-400)"
              fontFamily="var(--font-sans)">
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HorizBar({ pct, color }) {
  return (
    <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 99, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .5s ease' }} />
    </div>
  );
}

export default function Insights() {
  const { wallets, transactions, isLoading, txLoading } = useWallets();
  const loading = isLoading || txLoading;

  const now = Date.now();
  const ms30 = 86400000 * 30;

  const last30 = useMemo(() => transactions.filter((t) => now - t.ts < ms30), [transactions]);
  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const income30     = last30.filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0);
  const spend30      = last30.filter((t) => t.kind !== 'in').reduce((s, t) => s + t.amount, 0);
  const net30        = income30 - spend30;

  /* Spending by category (debit transactions, all time) */
  const byCat = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.kind !== 'in')
      .forEach((t) => { map[t.merchant] = (map[t.merchant] || 0) + t.amount; });
    return Object.entries(map)
      .map(([cat, total]) => ({ cat, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [transactions]);
  const maxCat = byCat[0]?.total || 1;

  /* Monthly trend — last 6 months */
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const year  = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString('en', { month: 'short' });
      const slice = transactions.filter((t) => {
        const td = new Date(t.ts);
        return td.getFullYear() === year && td.getMonth() === month;
      });
      months.push({
        label,
        in:  slice.filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0),
        out: slice.filter((t) => t.kind !== 'in').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);

  const totalIn6m  = monthlyData.reduce((s, m) => s + m.in,  0);
  const totalOut6m = monthlyData.reduce((s, m) => s + m.out, 0);

  const money = (n) => { const m = formatMoney(n, 'USD'); return `${m.sym}${m.int}.${m.dec}`; };

  if (loading) {
    return (
      <div style={{ padding: '48px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-400)', fontSize: 14 }}>
        <span className="spinner" /> Loading insights…
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <>
        <div className="app-top">
          <div><h1>Insights</h1><div className="subtitle">Your financial overview</div></div>
        </div>
        <div className="tx-card">
          <div className="empty">
            <div className="icon-wrap"><Icon.chart /></div>
            <h3>No data yet</h3>
            <p>Add transactions to your wallets to see insights here.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-top">
        <div>
          <h1>Insights</h1>
          <div className="subtitle">Your financial overview · last 30 days</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total balance" value={money(totalBalance)} sub={`across ${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`} />
        <StatCard label="Income · 30d"   value={money(income30)} accent="var(--brand-700)" sub="credited" />
        <StatCard label="Spending · 30d" value={money(spend30)}  accent="var(--ink-700)"   sub="debited" />
        <StatCard
          label="Net · 30d"
          value={(net30 >= 0 ? '+' : '−') + money(Math.abs(net30))}
          accent={net30 >= 0 ? 'var(--brand-700)' : 'var(--danger-500)'}
          sub={net30 >= 0 ? 'surplus' : 'deficit'}
        />
      </div>

      {/* Monthly trend + legend */}
      <div style={{
        background: 'var(--paper)', border: '1px solid var(--ink-100)',
        borderRadius: 16, padding: '22px 24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--ink-900)' }}>Monthly activity</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 3 }}>Last 6 months</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--brand-500)', display: 'inline-block' }} />
              Credit <strong style={{ color: 'var(--ink-900)', marginLeft: 2 }}>{money(totalIn6m)}</strong>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--ink-300)', display: 'inline-block' }} />
              Debit <strong style={{ color: 'var(--ink-900)', marginLeft: 2 }}>{money(totalOut6m)}</strong>
            </div>
          </div>
        </div>
        <MonthlyBarChart months={monthlyData} />
      </div>

      {/* Bottom row: category breakdown + wallet distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Spending by category */}
        <div style={{
          background: 'var(--paper)', border: '1px solid var(--ink-100)',
          borderRadius: 16, padding: '22px 24px',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--ink-900)', marginBottom: 4 }}>
            Spending by category
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginBottom: 18 }}>All debit transactions</div>

          {byCat.length === 0 ? (
            <div style={{ color: 'var(--ink-400)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No spending data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {byCat.map(({ cat, total }) => {
                const pct = Math.round((total / maxCat) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{CATEGORY_ICONS[cat] || '💼'}</span>
                        <span style={{ fontWeight: 500 }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      </span>
                      <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)' }}>
                        {money(total)}
                      </span>
                    </div>
                    <HorizBar pct={pct} color="var(--brand-500)" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Wallet distribution */}
        <div style={{
          background: 'var(--paper)', border: '1px solid var(--ink-100)',
          borderRadius: 16, padding: '22px 24px',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--ink-900)', marginBottom: 4 }}>
            Wallet distribution
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginBottom: 18 }}>Balance share per wallet</div>

          {wallets.length === 0 ? (
            <div style={{ color: 'var(--ink-400)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No wallets yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...wallets].sort((a, b) => b.balance - a.balance).map((w) => {
                const pct = totalBalance > 0 ? Math.round((w.balance / totalBalance) * 100) : 0;
                const color = THEME_COLORS[w.theme] || 'var(--brand-500)';
                return (
                  <div key={w.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-700)' }}>{w.name}</span>
                      <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-500)' }}>
                        {money(w.balance)} <span style={{ color: 'var(--ink-300)' }}>·</span> {pct}%
                      </span>
                    </div>
                    <HorizBar pct={pct} color={color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
