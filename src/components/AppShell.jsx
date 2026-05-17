import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../hooks/useAuthMutations';
import { useUserQuery } from '../hooks/useUser';
import { useWalletsQuery } from '../hooks/useWallets';
import { Icon } from './Icon';
import NotificationPanel from './NotificationPanel';

export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { auth, signOut } = useAuth();
  const logout    = useLogoutMutation();
  const { data: user }      = useUserQuery();
  const { data: wallets = [] } = useWalletsQuery();

  const [activeTab, setActiveTab] = useState('home');

  const handleSignOut = async () => {
    try {
      if (auth?.refreshToken) await logout.mutateAsync(auth.refreshToken);
    } catch {}
    signOut();
    navigate('/signin');
  };

  const path = location.pathname;

  const userInitials = (user?.name || user?.username || 'U')
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  // Items with a `path` are route-driven; those without are state-driven tabs on /home
  const navItems = [
    { id: 'home',     label: 'Overview',     icon: Icon.home },
    { id: 'wallets',  label: 'Wallets',      icon: Icon.wallet, path: '/wallets', badge: wallets.length },
    { id: 'tx',       label: 'Transactions', icon: Icon.arrows, path: '/transactions' },
    { id: 'insights', label: 'Insights',     icon: Icon.chart, path: '/insights' },
  ];

  const isActive = (item) => {
    if (item.path) return path === item.path;
    return path === '/home' && activeTab === item.id;
  };

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
      if (path !== '/home') navigate('/home');
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="app-side-head">
          <div className="auth-brand" style={{ padding: 0 }}>
            <div className="logo-mark"></div>
            <span>Wallet</span>
          </div>
          <NotificationPanel />
        </div>

        <div className="nav-section">Main</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={'nav-item' + (isActive(item) ? ' active' : '')}
            onClick={() => handleNavClick(item)}
          >
            <span className="nav-ico"><item.icon /></span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge != null && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                background: isActive(item) ? 'rgba(255,255,255,.15)' : 'var(--ink-100)',
                padding: '2px 7px', borderRadius: 99,
              }}>{item.badge}</span>
            )}
          </button>
        ))}

        <div className="nav-section">Account</div>
        <button
          className={'nav-item' + (path === '/settings' ? ' active' : '')}
          onClick={() => navigate('/settings')}
        >
          <span className="nav-ico"><Icon.settings /></span>
          <span>Account</span>
        </button>

        <div className="app-side-bottom">
          <div className="avatar">{userInitials}</div>
          <div className="meta" style={{ flex: 1, minWidth: 0 }}>
            <div className="name">{user?.name || user?.username || 'Guest'}</div>
            <div className="sub">@{user?.username || 'guest'}</div>
          </div>
          <button className="signout" title="Sign out" onClick={handleSignOut}>
            <Icon.signOut />
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet context={{ activeTab, setActiveTab }} />
      </main>
    </div>
  );
}
