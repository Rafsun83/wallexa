import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useWallets } from '../hooks/useWallets';
import { useCreateWalletMutation, useCreateTransactionMutation } from '../hooks/useWalletMutations';
import { useUserQuery } from '../hooks/useUser';
import { Icon } from '../components/Icon';
import { WalletCard } from '../components/WalletCard';
import { TransactionRow } from '../components/TransactionRow';
import { CreateWalletModal } from '../components/CreateWalletModal';
import { AddMoneyModal } from '../components/AddMoneyModal';
import { WalletDetailModal } from '../components/WalletDetailModal';
import { formatMoney, formatRelTime } from '../utils/format';

const THEME_BG = { emerald: '#006b54', sapphire: '#173a8c', graphite: '#2a3340', bronze: '#6b4017' };

function SearchOverlay({ wallets, transactions, onClose, onSelectWallet }) {
  const [q, setQ] = useState('');
  const inputRef  = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const query = q.trim().toLowerCase();

  const matchedWallets = query
    ? wallets.filter((w) => w.name.toLowerCase().includes(query))
    : [];

  const matchedTx = query
    ? transactions
        .filter((t) =>
          t.title.toLowerCase().includes(query) ||
          t.merchant.toLowerCase().includes(query)
        )
        .slice(0, 8)
    : [];

  const hasResults = matchedWallets.length > 0 || matchedTx.length > 0;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-box" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <Icon.search width={18} height={18} />
          <input
            ref={inputRef}
            placeholder="Search wallets, transactions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-400)', padding: 2 }}
            >
              ✕
            </button>
          )}
        </div>

        <div className="search-results">
          {!query && (
            <div className="search-empty">Start typing to search wallets and transactions</div>
          )}

          {query && !hasResults && (
            <div className="search-empty">No results for "<strong>{q}</strong>"</div>
          )}

          {matchedWallets.length > 0 && (
            <>
              <div className="search-section-label">Wallets</div>
              {matchedWallets.map((w) => {
                const m = formatMoney(w.balance, w.currency);
                return (
                  <button
                    key={w.id}
                    className="search-result-item"
                    onClick={() => { onClose(); onSelectWallet(w.id); }}
                  >
                    <div className="search-result-icon" style={{ background: THEME_BG[w.theme] || THEME_BG.emerald }}>
                      <Icon.wallet style={{ color: '#fff', width: 16, height: 16 }} />
                    </div>
                    <div>
                      <div className="search-result-title">{w.name}</div>
                      <div className="search-result-sub">{w.type} · {w.category}</div>
                    </div>
                    <div className="search-result-amount" style={{ color: 'var(--ink-700)' }}>
                      {m.sym}{m.int}.{m.dec}
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {matchedTx.length > 0 && (
            <>
              <div className="search-section-label">Transactions</div>
              {matchedTx.map((tx) => {
                const wallet = wallets.find((w) => w.id === tx.walletId);
                const m      = formatMoney(tx.amount, wallet?.currency || 'USD');
                const isIn   = tx.kind === 'in';
                return (
                  <div key={tx.id} className="search-result-item" style={{ cursor: 'default' }}>
                    <div
                      className="search-result-icon"
                      style={{ background: isIn ? 'var(--brand-100)' : 'var(--ink-100)' }}
                    >
                      {isIn
                        ? <Icon.download style={{ color: 'var(--brand-700)', width: 15, height: 15 }} />
                        : <Icon.send    style={{ color: 'var(--ink-600)',   width: 15, height: 15 }} />
                      }
                    </div>
                    <div>
                      <div className="search-result-title">{tx.title}</div>
                      <div className="search-result-sub">{tx.merchant} · {wallet?.name || 'Unknown'} · {formatRelTime(tx.ts)}</div>
                    </div>
                    <div
                      className="search-result-amount"
                      style={{ color: isIn ? 'var(--brand-700)' : 'var(--ink-700)' }}
                    >
                      {isIn ? '+' : '−'}{m.sym}{m.int}.{m.dec}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="search-footer">
          <span><kbd>↵</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

function StatementModal({ wallet, transactions, onClose }) {
  const walletTx = transactions
    .filter((t) => t.walletId === wallet.id)
    .sort((a, b) => b.ts - a.ts);

  const totalIn  = walletTx.filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = walletTx.filter((t) => t.kind !== 'in').reduce((s, t) => s + t.amount, 0);

  const grouped = walletTx.reduce((acc, tx) => {
    const day = new Date(tx.ts).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
    (acc[day] = acc[day] || []).push(tx);
    return acc;
  }, {});

  const downloadCSV = () => {
    const rows = [
      ['Date', 'Time', 'Title', 'Category', 'Type', 'Amount', 'Currency'],
      ...walletTx.map((tx) => {
        const d = new Date(tx.ts);
        return [
          d.toLocaleDateString('en'),
          d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
          tx.title,
          tx.merchant,
          tx.kind === 'in' ? 'CREDIT' : 'DEBIT',
          tx.amount.toFixed(2),
          wallet.currency,
        ];
      }),
    ];
    const csv  = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${wallet.name.replace(/\s+/g, '_')}_statement.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const balFmt = formatMoney(wallet.balance, wallet.currency);
    const inFmt  = formatMoney(totalIn,        wallet.currency);
    const outFmt = formatMoney(totalOut,        wallet.currency);
    const themeColor = THEME_BG[wallet.theme] || THEME_BG.emerald;
    const generatedOn = new Date().toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });

    const txRows = walletTx.map((tx) => {
      const d  = new Date(tx.ts);
      const mf = formatMoney(tx.amount, wallet.currency);
      const isIn = tx.kind === 'in';
      return `
        <tr>
          <td>${d.toLocaleDateString('en')}</td>
          <td>${d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${tx.title}</td>
          <td>${tx.merchant}</td>
          <td><span class="${isIn ? 'credit' : 'debit'}">${isIn ? 'CREDIT' : 'DEBIT'}</span></td>
          <td class="amount ${isIn ? 'credit' : 'debit'}">${isIn ? '+' : '−'}${mf.sym}${mf.int}.${mf.dec}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${wallet.name} Statement</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #06121f; background: #fff; padding: 40px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid ${themeColor}; }
    .brand { font-size: 22px; font-weight: 700; color: ${themeColor}; letter-spacing: -0.02em; }
    .brand span { display: block; font-size: 12px; font-weight: 400; color: #5a7591; margin-top: 2px; letter-spacing: 0; }
    .meta { text-align: right; font-size: 12px; color: #5a7591; line-height: 1.7; }
    .meta strong { color: #06121f; }
    .summary { display: flex; gap: 0; border: 1px solid #e6edf5; border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
    .summary-cell { flex: 1; padding: 14px 18px; border-right: 1px solid #e6edf5; }
    .summary-cell:last-child { border-right: none; }
    .summary-cell .lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #8ea4be; margin-bottom: 4px; }
    .summary-cell .val { font-size: 17px; font-weight: 700; font-family: 'Courier New', monospace; }
    .val.bal { color: #06121f; }
    .val.crd { color: #006b54; }
    .val.dbt { color: #9b1c2c; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: ${themeColor}; color: #fff; }
    thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
    tbody tr { border-bottom: 1px solid #e6edf5; }
    tbody tr:nth-child(even) { background: #f4f7fb; }
    td { padding: 10px 12px; vertical-align: middle; }
    .amount { font-family: 'Courier New', monospace; font-weight: 600; text-align: right; }
    .credit { color: #006b54; }
    .debit  { color: #9b1c2c; }
    span.credit { background: #e0f7ee; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    span.debit  { background: #fde7ea; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .footer { margin-top: 28px; font-size: 11px; color: #8ea4be; text-align: center; border-top: 1px solid #e6edf5; padding-top: 14px; }
    @media print {
      body { padding: 20px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Wallexa <span>Account Statement</span></div>
      <div style="margin-top:10px;font-size:13px;color:#06121f;">
        <strong>${wallet.name}</strong> &nbsp;·&nbsp; ${wallet.type} &nbsp;·&nbsp; ${wallet.currency}
      </div>
    </div>
    <div class="meta">
      <div>Generated on <strong>${generatedOn}</strong></div>
      <div>Total transactions: <strong>${walletTx.length}</strong></div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-cell"><div class="lbl">Balance</div><div class="val bal">${balFmt.sym}${balFmt.int}.${balFmt.dec}</div></div>
    <div class="summary-cell"><div class="lbl">Total Credited</div><div class="val crd">+${inFmt.sym}${inFmt.int}.${inFmt.dec}</div></div>
    <div class="summary-cell"><div class="lbl">Total Debited</div><div class="val dbt">−${outFmt.sym}${outFmt.int}.${outFmt.dec}</div></div>
  </div>

  ${walletTx.length === 0
    ? '<p style="text-align:center;color:#8ea4be;padding:32px;">No transactions found for this wallet.</p>'
    : `<table>
        <thead><tr><th>Date</th><th>Time</th><th>Description</th><th>Category</th><th>Type</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${txRows}</tbody>
      </table>`
  }

  <div class="footer">This statement was generated automatically by Wallexa. &nbsp;·&nbsp; ${generatedOn}</div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-head">
          <h2>Statement</h2>
          <p>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 99,
              background: THEME_BG[wallet.theme] || THEME_BG.emerald,
              color: '#fff', fontSize: 12, fontWeight: 600, marginRight: 6,
            }}>
              {wallet.name}
            </span>
            {wallet.type} · {wallet.currency}
          </p>
        </div>

        {/* Summary bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--ink-100)', borderTop: '1px solid var(--ink-100)', flexShrink: 0 }}>
          {[
            { label: 'Balance',  value: wallet.balance, color: 'var(--ink-900)' },
            { label: 'Credited', value: totalIn,        color: 'var(--brand-700)' },
            { label: 'Debited',  value: totalOut,       color: 'var(--danger-500)' },
          ].map(({ label, value, color }, i, arr) => {
            const m = formatMoney(value, wallet.currency);
            return (
              <div key={label} style={{ flex: 1, padding: '12px 20px', borderRight: i < arr.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color }}>{m.sym}{m.int}.{m.dec}</div>
              </div>
            );
          })}
        </div>

        {/* Transactions grouped by day */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {walletTx.length === 0 ? (
            <div className="empty" style={{ padding: '40px 24px' }}>
              <div className="icon-wrap"><Icon.arrows /></div>
              <h3>No transactions</h3>
              <p>This wallet has no activity yet.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([day, txs]) => (
              <div key={day}>
                <div style={{
                  padding: '8px 24px', fontSize: 11.5, fontWeight: 600,
                  letterSpacing: '.05em', textTransform: 'uppercase',
                  color: 'var(--ink-400)', background: 'var(--ink-50)',
                  borderBottom: '1px solid var(--ink-100)',
                }}>
                  {day}
                </div>
                {txs.map((tx) => {
                  const m    = formatMoney(tx.amount, wallet.currency);
                  const isIn = tx.kind === 'in';
                  return (
                    <div key={tx.id} style={{
                      display: 'grid', gridTemplateColumns: '36px 1fr auto',
                      alignItems: 'center', gap: 12, padding: '12px 24px',
                      borderBottom: '1px solid var(--ink-100)',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: isIn ? 'var(--brand-100)' : 'var(--ink-100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isIn
                          ? <Icon.download style={{ color: 'var(--brand-700)', width: 14, height: 14 }} />
                          : <Icon.send    style={{ color: 'var(--ink-600)',   width: 14, height: 14 }} />
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-900)' }}>{tx.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 1 }}>
                          {tx.merchant} · {new Date(tx.ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13.5, color: isIn ? 'var(--brand-700)' : 'var(--ink-700)' }}>
                        {isIn ? '+' : '−'}{m.sym}{m.int}.{m.dec}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {walletTx.length > 0 && (
            <>
              <button className="btn btn-ghost" onClick={downloadCSV}>
                <Icon.download /> CSV
              </button>
              <button className="btn btn-primary" onClick={downloadPDF}>
                <Icon.download /> Download PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={'toast ' + (t.kind || '')}>
          <Icon.shield /><span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { wallets, isLoading, error, transactions, addMoney } = useWallets();
  const createWalletMutation     = useCreateWalletMutation();
  const createTransactionMutation = useCreateTransactionMutation();

  const [showSearch, setShowSearch]               = useState(false);
  const [statementWallet, setStatementWallet]     = useState(null);
  const [showStatementPicker, setShowStatementPicker] = useState(false);
  const [showCreate, setShowCreate]               = useState(false);
  const [detailWalletId, setDetailWalletId] = useState(null);
  const [addMoneyFor, setAddMoneyFor]       = useState(null);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [toasts, setToasts]                 = useState([]);

  const openAddMoney = () => {
    if (wallets.length === 0) return;
    if (wallets.length === 1) { setAddMoneyFor(wallets[0]); return; }
    setShowWalletPicker(true);
  };

  const openStatement = () => {
    if (wallets.length === 0) return;
    if (wallets.length === 1) { setStatementWallet(wallets[0]); return; }
    setShowStatementPicker(true);
  };

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const totalMoney   = formatMoney(totalBalance, 'USD');

  const last30      = transactions.filter((t) => Date.now() - t.ts < 86400000 * 30);
  const incoming30  = last30.filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0);
  const outgoing30  = last30.filter((t) => t.kind !== 'in').reduce((s, t) => s + t.amount, 0);

  const pushToast = (msg, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const handleCreate = async (formData) => {
    await createWalletMutation.mutateAsync({
      walletName:  formData.walletName,
      type:        formData.type,
      category:    formData.category,
      note:        formData.note,
      totalAmount: 0,
    });
    pushToast(`Wallet "${formData.walletName}" created`);
  };

  const handleAddMoney = async (walletId, txData) => {
    await createTransactionMutation.mutateAsync({ walletId, ...txData });
    addMoney(walletId, txData);
    const w   = wallets.find((x) => x.id === walletId);
    const sym = formatMoney(txData.amount, w?.currency).sym;
    const msg = txData.type === 'DEBIT'
      ? `Debited ${sym}${txData.amount.toFixed(2)} from ${w?.name}`
      : `Added ${sym}${txData.amount.toFixed(2)} to ${w?.name}`;
    pushToast(msg);
  };

  return (
    <>
      <div className="app-top">
        <div>
          <h1>Good day, {(user?.name || user?.username || 'there').split(' ')[0]}.</h1>
          <div className="subtitle">Here's how your wallets are looking today.</div>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSearch(true)}><Icon.search /> Search</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Icon.plus /> New wallet
          </button>
        </div>
      </div>

      <div className="hero-balance">
        <div className="hero-eyebrow">Total balance · across {wallets.length} wallets</div>
        <div className="hero-amount">
          <span className="currency">$</span>
          <span>{totalMoney.int}</span>
          <span className="cents">.{totalMoney.dec}</span>
        </div>
        <div className="hero-meta">
          <div><span className="stat-up">↑ ${incoming30.toFixed(2)}</span> incoming · 30d</div>
          <div>↓ ${outgoing30.toFixed(2)} outgoing · 30d</div>
          <div>·</div>
          <div>Net <span className="stat-up">+${(incoming30 - outgoing30).toFixed(2)}</span></div>
        </div>
        <div className="hero-actions">
          <button className="btn primary" onClick={openAddMoney} disabled={wallets.length === 0}>
            <Icon.plus /> Add money
          </button>
          <button className="btn"><Icon.send /> Send</button>
          <button className="btn"><Icon.swap /> Transfer</button>
          <button className="btn" onClick={openStatement} disabled={wallets.length === 0}><Icon.download /> Statement</button>
        </div>
      </div>

      <div className="section-head">
        <h2>Your wallets</h2>
        <button className="link" onClick={() => setShowCreate(true)}>+ New wallet</button>
      </div>

      {isLoading && (
        <div style={{ padding: '24px 0', color: 'var(--ink-400)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="spinner" /> Loading wallets…
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--danger-700)', background: 'var(--danger-100)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          Failed to load wallets: {error.response?.data?.message || error.message}
        </div>
      )}

      <div className="wallet-grid">
        {wallets.map((w) => (
          <WalletCard key={w.id} wallet={w} onClick={() => setDetailWalletId(w.id)} />
        ))}
        <div className="wallet-card add-new" onClick={() => setShowCreate(true)}>
          <div className="plus"><Icon.plus /></div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>Create a new wallet</div>
          <div style={{ fontSize: 12.5, marginTop: 4, color: 'var(--ink-400)' }}>Organize money by goal</div>
        </div>
      </div>

      <div className="section-head">
        <h2>Recent transactions</h2>
        <button className="link" onClick={() => navigate('/transactions')}>View all →</button>
      </div>
      <div className="tx-card">
        {transactions.length === 0 ? (
          <div className="empty">
            <div className="icon-wrap"><Icon.arrows /></div>
            <h3>No transactions yet</h3>
            <p>Add money to a wallet to see activity here.</p>
          </div>
        ) : (
          transactions.slice(0, 10).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} wallet={wallets.find((w) => w.id === tx.walletId)} />
          ))
        )}
      </div>

      {showStatementPicker && (
        <div className="modal-backdrop" onClick={() => setShowStatementPicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <h2>Statement for…</h2>
              <p>Choose which wallet to view statement</p>
            </div>
            <div className="modal-body" style={{ padding: '12px 16px' }}>
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => { setShowStatementPicker(false); setStatementWallet(w); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                    padding: '12px 14px', borderRadius: 12, border: '1px solid var(--ink-100)',
                    background: 'var(--paper)', cursor: 'pointer', marginBottom: 8,
                    textAlign: 'left', transition: 'background .12s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--paper)'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: THEME_BG[w.theme] || THEME_BG.emerald,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon.wallet style={{ color: '#fff', width: 18, height: 18 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>{w.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 2 }}>
                      {w.currency} · Balance ${w.balance.toFixed(2)}
                    </div>
                  </div>
                  <Icon.chevron style={{ color: 'var(--ink-300)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setShowStatementPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {statementWallet && (
        <StatementModal
          wallet={statementWallet}
          transactions={transactions}
          onClose={() => setStatementWallet(null)}
        />
      )}

      {showSearch && (
        <SearchOverlay
          wallets={wallets}
          transactions={transactions}
          onClose={() => setShowSearch(false)}
          onSelectWallet={(id) => setDetailWalletId(id)}
        />
      )}

      {showWalletPicker && (
        <div className="modal-backdrop" onClick={() => setShowWalletPicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <h2>Add money to…</h2>
              <p>Choose which wallet to add a transaction to</p>
            </div>
            <div className="modal-body" style={{ padding: '12px 16px' }}>
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => { setShowWalletPicker(false); setAddMoneyFor(w); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                    padding: '12px 14px', borderRadius: 12, border: '1px solid var(--ink-100)',
                    background: 'var(--paper)', cursor: 'pointer', marginBottom: 8,
                    textAlign: 'left', transition: 'background .12s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--paper)'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: { emerald: '#006b54', sapphire: '#173a8c', graphite: '#2a3340', bronze: '#6b4017' }[w.theme] || '#006b54',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon.wallet style={{ color: '#fff', width: 18, height: 18 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>{w.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 2 }}>
                      {w.currency} · Balance ${w.balance.toFixed(2)}
                    </div>
                  </div>
                  <Icon.chevron style={{ color: 'var(--ink-300)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setShowWalletPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateWalletModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
      {detailWalletId && (
        <WalletDetailModal
          walletId={detailWalletId}
          onClose={() => setDetailWalletId(null)}
          onAddMoney={(w) => setAddMoneyFor(w)}
        />
      )}
      {addMoneyFor && (
        <AddMoneyModal wallet={addMoneyFor} onClose={() => setAddMoneyFor(null)} onConfirm={handleAddMoney} />
      )}

      <Toast toasts={toasts} />
    </>
  );
}
