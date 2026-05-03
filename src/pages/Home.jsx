import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLogoutMutation } from "../hooks/useAuthMutations";
import { useWallets } from "../hooks/useWallets";
import { useCreateWalletMutation } from "../hooks/useWalletMutations";
import { Icon } from "../components/Icon";
import { WalletCard } from "../components/WalletCard";
import { TransactionRow } from "../components/TransactionRow";
import { CreateWalletModal } from "../components/CreateWalletModal";
import { AddMoneyModal } from "../components/AddMoneyModal";
import { WalletDetailModal } from "../components/WalletDetailModal";
import { ProfileSection } from "../components/ProfileSection";
import { useUserQuery } from "../hooks/useUser";
import { formatMoney } from "../utils/format";

function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={"toast " + (t.kind || "")}>
          <Icon.shield />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { auth, signOut } = useAuth();
  const logout = useLogoutMutation();
  const { wallets, isLoading, error, transactions, addMoney } = useWallets();
  const createWalletMutation = useCreateWalletMutation();
  const { data: user } = useUserQuery();

  const [activeNav, setActiveNav] = useState("home");
  const [showCreate, setShowCreate] = useState(false);
  const [detailWalletId, setDetailWalletId] = useState(null);
  const [addMoneyFor, setAddMoneyFor] = useState(null);
  const [toasts, setToasts] = useState([]);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const totalMoney = formatMoney(totalBalance, "USD");

  const last30 = transactions.filter((t) => Date.now() - t.ts < 86400000 * 30);
  const incoming30 = last30
    .filter((t) => t.kind === "in")
    .reduce((s, t) => s + t.amount, 0);
  const outgoing30 = last30
    .filter((t) => t.kind !== "in")
    .reduce((s, t) => s + t.amount, 0);

  const pushToast = (msg, kind = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const handleCreate = async (formData) => {
    await createWalletMutation.mutateAsync({
      walletName: formData.walletName,
      type: formData.type,
      category: formData.category,
      note: formData.note,
      totalAmount: 0,
    });
    pushToast(`Wallet "${formData.walletName}" created`);
  };

  const handleAddMoney = (walletId, amount, label) => {
    addMoney(walletId, amount, label);
    const w = wallets.find((x) => x.id === walletId);
    pushToast(
      `Added ${formatMoney(amount, w?.currency).sym}${amount.toFixed(2)} to ${w?.name}`,
    );
  };

  const handleSignOut = async () => {
    try {
      if (auth?.refreshToken) {
        await logout.mutateAsync(auth.refreshToken);
      }
    } catch (e) {
      // ignore — sign out locally regardless
    }
    signOut();
    navigate("/signin");
  };

  const userInitials = (user?.name || user?.username || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navItems = [
    { id: "home", label: "Overview", icon: Icon.home },
    {
      id: "wallets",
      label: "Wallets",
      icon: Icon.wallet,
      badge: wallets.length,
    },
    { id: "tx", label: "Transactions", icon: Icon.arrows },
    { id: "insights", label: "Insights", icon: Icon.chart },
  ];

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="auth-brand">
          <div className="logo-mark"></div>
          <span>Wallet</span>
        </div>

        <div className="nav-section">Main</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={"nav-item" + (activeNav === item.id ? " active" : "")}
            onClick={() => setActiveNav(item.id)}
          >
            <span className="nav-ico">
              <item.icon />
            </span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge != null && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  background:
                    activeNav === item.id
                      ? "rgba(255,255,255,.15)"
                      : "var(--ink-100)",
                  padding: "2px 7px",
                  borderRadius: 99,
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <div className="nav-section">Account</div>
        <button
          className={"nav-item" + (activeNav === "settings" ? " active" : "")}
          onClick={() => setActiveNav("settings")}
        >
          <span className="nav-ico">
            <Icon.settings />
          </span>
          <span>Account</span>
        </button>

        <div className="app-side-bottom">
          <div className="avatar">{userInitials}</div>
          <div className="meta" style={{ flex: 1, minWidth: 0 }}>
            <div className="name">{user?.name || user?.username || "Guest"}</div>
            <div className="sub">@{user?.username || "guest"}</div>
          </div>
          <button className="signout" title="Sign out" onClick={handleSignOut}>
            <Icon.signOut />
          </button>
        </div>
      </aside>

      <main className="app-main">
        {activeNav === "settings" ? (
          <ProfileSection />
        ) : (
          <>
            <div className="app-top">
              <div>
                <h1>Good day, {(user?.name || user?.username || "there").split(" ")[0]}.</h1>
                <div className="subtitle">
                  Here's how your wallets are looking today.
                </div>
              </div>
              <div className="actions">
                <button className="btn btn-ghost btn-sm">
                  <Icon.search /> Search
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCreate(true)}
                >
                  <Icon.plus /> New wallet
                </button>
              </div>
            </div>

            <div className="hero-balance">
              <div className="hero-eyebrow">
                Total balance · across {wallets.length} wallets
              </div>
              <div className="hero-amount">
                <span className="currency">$</span>
                <span>{totalMoney.int}</span>
                <span className="cents">.{totalMoney.dec}</span>
              </div>
              <div className="hero-meta">
                <div>
                  <span className="stat-up">↑ ${incoming30.toFixed(2)}</span>{" "}
                  incoming · 30d
                </div>
                <div>↓ ${outgoing30.toFixed(2)} outgoing · 30d</div>
                <div>·</div>
                <div>
                  Net{" "}
                  <span className="stat-up">
                    +${(incoming30 - outgoing30).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="hero-actions">
                <button
                  className="btn primary"
                  onClick={() => wallets[0] && setAddMoneyFor(wallets[0])}
                >
                  <Icon.plus /> Add money
                </button>
                <button className="btn">
                  <Icon.send /> Send
                </button>
                <button className="btn">
                  <Icon.swap /> Transfer
                </button>
                <button className="btn">
                  <Icon.download /> Statement
                </button>
              </div>
            </div>

            <div className="section-head">
              <h2>Your wallets</h2>
              <button className="link" onClick={() => setShowCreate(true)}>
                + New wallet
              </button>
            </div>

            {isLoading && (
              <div style={{ padding: "24px 0", color: "var(--ink-400)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="spinner" /> Loading wallets…
              </div>
            )}

            {error && (
              <div style={{ color: "var(--danger-700)", background: "var(--danger-100)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                Failed to load wallets:{" "}
                {error.response?.data?.message || error.message}
              </div>
            )}

            <div className="wallet-grid">
              {wallets.map((w) => (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  onClick={() => setDetailWalletId(w.id)}
                />
              ))}
              <div className="wallet-card add-new" onClick={() => setShowCreate(true)}>
                <div className="plus"><Icon.plus /></div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Create a new wallet</div>
                <div style={{ fontSize: 12.5, marginTop: 4, color: "var(--ink-400)" }}>
                  Organize money by goal
                </div>
              </div>
            </div>

            <div className="section-head">
              <h2>Recent transactions</h2>
              <button className="link">View all →</button>
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
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    wallet={wallets.find((w) => w.id === tx.walletId)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {showCreate && (
        <CreateWalletModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {detailWalletId && (
        <WalletDetailModal
          walletId={detailWalletId}
          onClose={() => setDetailWalletId(null)}
          onAddMoney={(w) => setAddMoneyFor(w)}
        />
      )}
      {addMoneyFor && (
        <AddMoneyModal
          wallet={addMoneyFor}
          onClose={() => setAddMoneyFor(null)}
          onConfirm={handleAddMoney}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
