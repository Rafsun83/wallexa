import { useWalletDetailQuery } from "../hooks/useWallets";
import { formatMoney, formatRelTime } from "../utils/format";

function Badge({ label }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 99,
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: "uppercase",
        background: "var(--ink-100)",
        color: "var(--ink-500)",
      }}
    >
      {label}
    </span>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--ink-100)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--ink-400)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-700)" }}>
        {value}
      </span>
    </div>
  );
}

export function WalletDetailModal({ walletId, onClose, onAddMoney }) {
  const { data: wallet, isLoading, error } = useWalletDetailQuery(walletId);

  const m = wallet ? formatMoney(wallet.balance, wallet.currency) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Wallet details</h2>
          <p>Full information for this wallet.</p>
        </div>

        <div className="modal-body">
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "var(--ink-400)",
                fontSize: 14,
              }}
            >
              <span className="spinner" style={{ marginRight: 8 }} />
              Loading…
            </div>
          )}

          {error && (
            <div
              style={{
                color: "var(--danger-700)",
                background: "var(--danger-100)",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              Failed to load wallet:{" "}
              {error.response?.data?.message || error.message}
            </div>
          )}

          {wallet && (
            <>
              <div
                className={"wallet-card theme-" + wallet.theme}
                style={{ marginBottom: 20, cursor: "default" }}
              >
                <div className="top">
                  <div className="name">{wallet.name}</div>
                  <div className="currency-pill">{wallet.currency}</div>
                </div>
                <div>
                  <div className="balance">
                    {m.sym}
                    {m.int}
                    <span style={{ opacity: 0.6, fontSize: 18 }}>.{m.dec}</span>
                  </div>
                  <div className="meta" style={{ marginTop: 12 }}>
                    <span>•••• {wallet.id.slice(-4).toUpperCase()}</span>
                    <span>{wallet.type?.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 4 }}>
                <Badge label={wallet.type} />
                {wallet.category && <Badge label={wallet.category} />}
              </div>

              <div style={{ marginTop: 8 }}>
                <DetailRow label="Wallet name"  value={wallet.name} />
                <DetailRow label="Balance"      value={`${m.sym}${m.int}.${m.dec}`} />
                <DetailRow label="Currency"     value={wallet.currency} />
                <DetailRow label="Type"         value={wallet.type} />
                <DetailRow label="Category"     value={wallet.category} />
                <DetailRow label="Created"      value={formatRelTime(wallet.createdAt)} />
                <DetailRow label="Description"  value={wallet.note} />
              </div>
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          {wallet && (
            <button
              className="btn btn-brand"
              onClick={() => {
                onClose();
                onAddMoney(wallet);
              }}
            >
              + Add money
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
