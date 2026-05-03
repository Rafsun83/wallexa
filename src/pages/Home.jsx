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

  const [showSearch, setShowSearch]         = useState(false);
  const [showCreate, setShowCreate]         = useState(false);
  const [detailWalletId, setDetailWalletId] = useState(null);
  const [addMoneyFor, setAddMoneyFor]       = useState(null);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [toasts, setToasts]                 = useState([]);

  const openAddMoney = () => {
    if (wallets.length === 0) return;
    if (wallets.length === 1) { setAddMoneyFor(wallets[0]); return; }
    setShowWalletPicker(true);
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
          <button className="btn"><Icon.download /> Statement</button>
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
