import { useState } from "react";
import { formatMoney } from "../utils/format";

const THEMES = [
  { id: "emerald", preview: "linear-gradient(140deg, #003328, #0aa177)" },
  { id: "sapphire", preview: "linear-gradient(140deg, #0a1f4d, #2e5bd9)" },
  { id: "graphite", preview: "linear-gradient(140deg, #181d23, #475669)" },
  { id: "bronze", preview: "linear-gradient(140deg, #2e1c0a, #c98a17)" },
];

const WALLET_TYPES = [
  "personal",
  "savings",
  "business",
  "investment",
  "emergency",
  "E_CURRENCY",
];
const CATEGORIES = [
  "general",
  "food",
  "transport",
  "travel",
  "shopping",
  "bills",
  "entertainment",
  "other",
];
const CURRENCIES = ["USD", "EUR", "GBP", "BDT", "JPY", "INR"];

export function CreateWalletModal({ onClose, onCreate }) {
  const [walletName, setWalletName] = useState("");
  const [type, setType] = useState("personal");
  const [category, setCategory] = useState("general");
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("emerald");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!walletName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        walletName: walletName.trim(),
        type,
        category,
        note: note.trim(),
        totalAmount: 0,
        currency,
        theme,
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create wallet",
      );
      setSubmitting(false);
    }
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
          <div
            className={"wallet-card theme-" + theme}
            style={{ marginBottom: 18, cursor: "default" }}
          >
            <div className="top">
              <div className="name">{walletName || "New wallet"}</div>
              <div className="currency-pill">{currency}</div>
            </div>
            <div>
              <div className="balance">
                {m.sym}
                {m.int}
                <span style={{ opacity: 0.6, fontSize: 18 }}>.{m.dec}</span>
              </div>
              <div className="meta" style={{ marginTop: 12 }}>
                <span>{type}</span>
                <span>JUST CREATED</span>
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="walletName">Wallet name</label>
            <input
              id="walletName"
              className="input"
              placeholder="e.g. Vacation savings"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {WALLET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row" style={{ marginTop: 14 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                className="input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Card style</label>
              <div className="swatch-row">
                {THEMES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={"swatch" + (theme === t.id ? " selected" : "")}
                    style={{ background: t.preview }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="note">
              Note{" "}
              <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="note"
              className="input"
              placeholder="e.g. For annual family trip"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && (
            <div
              style={{
                color: "var(--danger-700)",
                background: "var(--danger-100)",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-brand"
            onClick={submit}
            disabled={!walletName.trim() || submitting}
          >
            {submitting ? (
              <>
                <span className="spinner"></span> Creating…
              </>
            ) : (
              <>Create wallet</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
