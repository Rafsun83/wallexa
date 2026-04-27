import { formatMoney } from '../utils/format';

export function WalletCard({ wallet, onClick }) {
  const m = formatMoney(wallet.balance, wallet.currency);
  const last4 = wallet.id.slice(-4).toUpperCase();
  return (
    <div className={'wallet-card theme-' + wallet.theme} onClick={onClick}>
      <div className="top">
        <div className="name">{wallet.name}</div>
        <div className="currency-pill">{wallet.currency}</div>
      </div>
      <div>
        <div className="balance">{m.sym}{m.int}<span style={{opacity:.6, fontSize:18}}>.{m.dec}</span></div>
        <div className="meta" style={{marginTop: 12}}>
          <span>•••• {last4}</span>
          <span>+ ADD MONEY</span>
        </div>
      </div>
    </div>
  );
}
