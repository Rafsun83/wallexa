import { useState } from 'react';
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
import { formatMoney } from '../utils/format';

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

  const [showCreate, setShowCreate]       = useState(false);
  const [detailWalletId, setDetailWalletId] = useState(null);
  const [addMoneyFor, setAddMoneyFor]     = useState(null);
  const [toasts, setToasts]               = useState([]);

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
          <button className="btn btn-ghost btn-sm"><Icon.search /> Search</button>
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
          <button className="btn primary" onClick={() => wallets[0] && setAddMoneyFor(wallets[0])}>
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
