import { Icon } from './Icon';
import { formatMoney, formatRelTime } from '../utils/format';

export function TransactionRow({ tx, wallet }) {
  const m = formatMoney(tx.amount, wallet?.currency || 'USD');
  const sign = tx.kind === 'in' ? '+' : '−';
  const iconKind = tx.kind === 'in' ? <Icon.download/> : (tx.kind === 'fee' ? <Icon.alert/> : <Icon.send/>);
  return (
    <div className="tx-row">
      <div className={'tx-icon ' + tx.kind}>{iconKind}</div>
      <div>
        <div className="tx-title">{tx.title}</div>
        <div className="tx-sub">{tx.merchant} · {wallet?.name || 'Unknown wallet'}</div>
      </div>
      <div className={'tx-amount ' + (tx.kind === 'in' ? 'in' : 'out')}>
        {sign}{m.sym}{m.int}.{m.dec}
      </div>
      <div className="tx-time">{formatRelTime(tx.ts)}</div>
    </div>
  );
}
