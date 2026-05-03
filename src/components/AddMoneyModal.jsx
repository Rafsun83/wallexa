import { useState } from 'react';
import { formatMoney } from '../utils/format';

const CATEGORIES = ['general', 'food', 'transport', 'travel', 'shopping', 'bills', 'entertainment', 'other'];

export function AddMoneyModal({ wallet, onClose, onConfirm }) {
  const [type,       setType]       = useState('CREDIT');
  const [amount,     setAmount]     = useState('');
  const [category,   setCategory]   = useState('general');
  const [note,       setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

  const num            = parseFloat(amount);
  const hasBalance     = wallet.balance > 0;
  const overdrawn      = type === 'DEBIT' && !isNaN(num) && num > wallet.balance;
  const valid          = !isNaN(num) && num > 0 && !overdrawn;
  const m              = formatMoney(0, wallet.currency);
  const balanceFmt     = formatMoney(wallet.balance, wallet.currency);

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(wallet.id, { type, amount: num, category, note: note.trim() });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Transaction failed');
      setSubmitting(false);
    }
  };

  const presets = [50, 100, 500, 1000];

  const typeBtn = (t, label, color, disabled) => (
    <button
      type="button"
      onClick={() => !disabled && setType(t)}
      disabled={disabled}
      title={disabled ? 'Wallet balance is zero — nothing to debit' : undefined}
      style={{
        flex: 1, padding: '9px 0', borderRadius: 8, border: '1.5px solid',
        fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s', opacity: disabled ? .45 : 1,
        borderColor: type === t && !disabled ? color : 'var(--ink-200)',
        background:  type === t && !disabled ? color : 'transparent',
        color:       type === t && !disabled ? '#fff' : 'var(--ink-400)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>New transaction</h2>
          <p>Add a transaction to <strong>{wallet.name}</strong></p>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {typeBtn('CREDIT', '+ Credit', '#0a7c57')}
              {typeBtn('DEBIT',  '− Debit',  '#c0392b', !hasBalance)}
            </div>
            {!hasBalance && (
              <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 6 }}>
                Debit is unavailable — this wallet has no balance.
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="amount">Amount</label>
            <div className="input-wrap">
              <span className="input-icon" style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-500)' }}>
                {m.sym}
              </span>
              <input
                id="amount" type="number" step="0.01" min="0.01"
                className="input with-icon" placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
                style={{ fontSize: 22, fontFamily: 'var(--font-display)', height: 56, fontWeight: 500 }}
              />
            </div>
            {type === 'DEBIT' && (
              <div style={{ fontSize: 12.5, color: 'var(--ink-400)', marginTop: 8 }}>
                Available balance:&nbsp;
                <strong style={{ color: 'var(--ink-700)', fontFamily: 'var(--font-mono)' }}>
                  {balanceFmt.sym}{balanceFmt.int}.{balanceFmt.dec}
                </strong>
              </div>
            )}
            {overdrawn && (
              <div style={{ color: 'var(--danger-700)', background: 'var(--danger-100)', padding: '7px 11px', borderRadius: 8, fontSize: 12.5, marginTop: 8 }}>
                Amount exceeds available balance of {balanceFmt.sym}{balanceFmt.int}.{balanceFmt.dec}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {presets
                .filter((p) => type === 'CREDIT' || p <= wallet.balance)
                .map((p) => (
                  <button key={p} type="button" className="btn btn-ghost btn-sm" onClick={() => setAmount(String(p))}>
                    {m.sym}{p}
                  </button>
                ))
              }
            </div>
          </div>

          <div className="field">
            <label htmlFor="txCategory">Category</label>
            <select id="txCategory" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="txNote">
              Note <span style={{ opacity: .5, fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="txNote" className="input" placeholder="What's this for?"
              value={note} onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--danger-700)', background: 'var(--danger-100)', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" onClick={submit} disabled={!valid || submitting}>
            {submitting
              ? <><span className="spinner" /> Processing…</>
              : <>{type === 'CREDIT' ? 'Add' : 'Debit'} {valid ? `${m.sym}${num.toFixed(2)}` : 'money'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
