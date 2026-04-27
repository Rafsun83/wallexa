import { useState } from 'react';
import { formatMoney } from '../utils/format';

export function AddMoneyModal({ wallet, onClose, onConfirm }) {
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('Top-up');
  const [submitting, setSubmitting] = useState(false);

  const num = parseFloat(amount);
  const valid = !isNaN(num) && num > 0;

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    onConfirm(wallet.id, num, label);
    setSubmitting(false);
    onClose();
  };

  const presets = [50, 100, 500, 1000];
  const m = formatMoney(0, wallet.currency);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Add money</h2>
          <p>Deposit funds into <strong>{wallet.name}</strong></p>
        </div>
        <div className="modal-body">
          <div className="field">
            <label htmlFor="amount">Amount</label>
            <div className="input-wrap">
              <span className="input-icon" style={{fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-500)'}}>{m.sym}</span>
              <input id="amount" type="number" step="0.01" className="input with-icon"
                placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
                style={{fontSize: 22, fontFamily: 'var(--font-display)', height: 56, fontWeight: 500}} />
            </div>
            <div style={{display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap'}}>
              {presets.map((p) => (
                <button key={p} type="button" className="btn btn-ghost btn-sm" onClick={() => setAmount(String(p))}>
                  +{m.sym}{p}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="txLabel">Description</label>
            <input id="txLabel" className="input" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="What's this for?" />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" onClick={submit} disabled={!valid || submitting}>
            {submitting ? <><span className="spinner"></span> Processing…</> : <>Add {valid ? m.sym + num.toFixed(2) : 'money'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
