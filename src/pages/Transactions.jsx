import { useState, useMemo } from 'react';
import { useWallets } from '../hooks/useWallets';
import { Icon } from '../components/Icon';
import { TransactionRow } from '../components/TransactionRow';

const KIND_LABELS = { all: 'All', in: 'Credit', out: 'Debit' };

export default function Transactions() {
  const { wallets, transactions, isLoading, txLoading } = useWallets();

  const [walletFilter, setWalletFilter] = useState('all');
  const [kindFilter,   setKindFilter]   = useState('all');
  const [search,       setSearch]       = useState('');

  const filtered = useMemo(() => {
    let list = transactions;
    if (walletFilter !== 'all') list = list.filter((t) => t.walletId === walletFilter);
    if (kindFilter   !== 'all') list = list.filter((t) => t.kind    === kindFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.merchant.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, walletFilter, kindFilter, search]);

  const totalIn  = filtered.filter((t) => t.kind === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.kind !== 'in').reduce((s, t) => s + t.amount, 0);

  const loading = isLoading || txLoading;

  return (
    <>
      <div className="app-top">
        <div>
          <h1>Transactions</h1>
          <div className="subtitle">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} ·{' '}
            <span style={{ color: 'var(--brand-700)' }}>+${totalIn.toFixed(2)}</span>
            {' '}in · <span style={{ color: 'var(--ink-600)' }}>−${totalOut.toFixed(2)}</span> out
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Search */}
        <div className="input-wrap" style={{ flex: '1 1 200px', minWidth: 180 }}>
          <span className="input-icon" style={{ color: 'var(--ink-400)' }}><Icon.search /></span>
          <input
            className="input with-icon"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: 38, fontSize: 13 }}
          />
        </div>

        {/* Wallet filter */}
        <select
          className="input"
          value={walletFilter}
          onChange={(e) => setWalletFilter(e.target.value)}
          style={{ height: 38, fontSize: 13, flex: '0 0 160px' }}
        >
          <option value="all">All wallets</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        {/* Kind filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(KIND_LABELS).map(([val, label]) => (
            <button
              key={val}
              type="button"
              className={'btn btn-sm' + (kindFilter === val ? ' btn-primary' : ' btn-ghost')}
              onClick={() => setKindFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="tx-card">
        {loading ? (
          <div style={{ padding: '32px 0', color: 'var(--ink-400)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="spinner" /> Loading transactions…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="icon-wrap"><Icon.arrows /></div>
            <h3>No transactions found</h3>
            <p>
              {transactions.length === 0
                ? 'Add money to a wallet to see activity here.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          filtered.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              wallet={wallets.find((w) => w.id === tx.walletId)}
            />
          ))
        )}
      </div>
    </>
  );
}
