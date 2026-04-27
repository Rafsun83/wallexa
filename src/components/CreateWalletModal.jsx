import { useState } from 'react';
import { formatMoney } from '../utils/format';

const THEMES = [
  { id: 'emerald',  preview: 'linear-gradient(140deg, #003328, #0aa177)' },
  { id: 'sapphire', preview: 'linear-gradient(140deg, #0a1f4d, #2e5bd9)' },
  { id: 'graphite', preview: 'linear-gradient(140deg, #181d23, #475669)' },
  { id: 'bronze',   preview: 'linear-gradient(140deg, #2e1c0a, #c98a17)' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'JPY', 'INR'];

export function CreateWalletModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('emerald');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    onCreate({ name: name.trim(), currency, theme });
    setSubmitting(false);
    onClose();
  };

  const m = formatMoney(0, currency);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Create a new wallet</h2>
          <p>Organize your money by purpose. Add funds anytime.</p>
        </div>
        <div className="modal-body">
          <div className={'wallet-card theme-' + theme} style={{ marginBottom: 18, cursor: 'default' }}>
            <div className="top">
              <div className="name">{name || 'New wallet'}</div>
              <div className="currency-pill">{currency}</div>
            </div>
            <div>
              <div className="balance">{m.sym}{m.int}<span style={{opacity:.6, fontSize:18}}>.{m.dec}</span></div>
              <div className="meta" style={{marginTop: 12}}>
                <span>•••• 0000</span>
                <span>JUST CREATED</span>
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="walletName">Wallet name</label>
            <input id="walletName" className="input" placeholder="e.g. Vacation savings"
              value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>

          <div className="field-row">
            <div className="field" style={{marginBottom: 0}}>
              <label htmlFor="currency">Currency</label>
              <select id="currency" className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{marginBottom: 0}}>
              <label>Card style</label>
              <div className="swatch-row">
                {THEMES.map((t) => (
                  <div key={t.id} onClick={() => setTheme(t.id)}
                    className={'swatch' + (theme === t.id ? ' selected' : '')}
                    style={{ background: t.preview }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-brand" onClick={submit} disabled={!name.trim() || submitting}>
            {submitting ? <><span className="spinner"></span> Creating…</> : <>Create wallet</>}
          </button>
        </div>
      </div>
    </div>
  );
}
