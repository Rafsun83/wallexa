import { useState } from 'react';
import { useWallets } from '../hooks/useWallets';
import { useCreateWalletMutation } from '../hooks/useWalletMutations';
import { Icon } from '../components/Icon';
import { WalletCard } from '../components/WalletCard';
import { CreateWalletModal } from '../components/CreateWalletModal';
import { WalletDetailModal } from '../components/WalletDetailModal';
import { AddMoneyModal } from '../components/AddMoneyModal';
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

export default function Wallets() {
  const { wallets, isLoading, error, addMoney } = useWallets();
  const createWalletMutation = useCreateWalletMutation();

  const [showCreate, setShowCreate]           = useState(false);
  const [detailWalletId, setDetailWalletId]   = useState(null);
  const [addMoneyFor, setAddMoneyFor]         = useState(null);
  const [toasts, setToasts]                   = useState([]);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const totalMoney   = formatMoney(totalBalance, 'USD');

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

  const handleAddMoney = (walletId, amount, label) => {
    addMoney(walletId, amount, label);
    const w = wallets.find((x) => x.id === walletId);
    pushToast(`Added ${formatMoney(amount, w?.currency).sym}${amount.toFixed(2)} to ${w?.name}`);
  };

  return (
    <>
      <div className="app-top">
        <div>
          <h1>Wallets</h1>
          <div className="subtitle">
            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} · total balance{' '}
            <strong>{totalMoney.sym}{totalMoney.int}.{totalMoney.dec}</strong>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Icon.plus /> New wallet
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '32px 0', color: 'var(--ink-400)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="spinner" /> Loading wallets…
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger-700)', background: 'var(--danger-100)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          Failed to load wallets: {error.response?.data?.message || error.message}
        </div>
      )}

      {!isLoading && !error && wallets.length === 0 && (
        <div className="tx-card">
          <div className="empty">
            <div className="icon-wrap"><Icon.wallet /></div>
            <h3>No wallets yet</h3>
            <p>Create your first wallet to start organising your money.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowCreate(true)}>
              <Icon.plus /> Create wallet
            </button>
          </div>
        </div>
      )}

      {wallets.length > 0 && (
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
