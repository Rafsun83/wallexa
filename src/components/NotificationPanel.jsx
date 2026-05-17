import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

// Placeholder notifications — swap with real data from GET /notifications
const PLACEHOLDER_NOTIFICATIONS = [
  {
    id: 1,
    type: 'credit',
    title: 'Transfer received',
    message: '$250.00 received from John Doe',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Wallet created',
    message: 'Your new USD wallet is ready to use',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'debit',
    title: 'Transfer sent',
    message: 'You sent $100.00 to Jane Smith',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 4,
    type: 'warn',
    title: 'Low balance alert',
    message: 'Your EUR wallet balance is below $10',
    time: '2 days ago',
    read: true,
  },
];

function NotifIcon({ type }) {
  if (type === 'credit') return <Icon.download />;
  if (type === 'debit')  return <Icon.send />;
  return <Icon.alert />;
}

export default function NotificationPanel() {
  const [open, setOpen]    = useState(false);
  const [pos, setPos]      = useState({ top: 0, left: 0 });

  // TODO: replace with useQuery for GET /notifications
  const [notifications, setNotifications] = useState(PLACEHOLDER_NOTIFICATIONS);

  // TODO: replace with useQuery for GET /notifications/unread-count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // TODO: connect WebSocket at /user/queue/notifications
  // useEffect(() => {
  //   const ws = new WebSocket(`${WS_BASE}/user/queue/notifications`);
  //   ws.onmessage = (e) => { /* push new notification, invalidate queries */ };
  //   return () => ws.close();
  // }, []);

  const bellRef  = useRef(null);
  const panelRef = useRef(null);

  const calcPos = () => {
    if (!bellRef.current) return;
    const r = bellRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left });
  };

  const toggle = () => {
    if (!open) calcPos();
    setOpen((o) => !o);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        !bellRef.current?.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [open]);

  const markAllRead = () => {
    // TODO: call API to mark all read, then invalidate queries
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notif-wrap">
      <button
        ref={bellRef}
        className={'notif-bell' + (open ? ' open' : '')}
        onClick={toggle}
        title="Notifications"
        aria-label="Open notifications"
      >
        <Icon.bell />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} unread`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="notif-panel"
          style={{ top: pos.top, left: pos.left }}
          role="dialog"
          aria-label="Notifications panel"
        >
          <div className="notif-head">
            <span className="notif-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                <Icon.check />
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <Icon.bell width={22} height={22} />
                </div>
                <p>You're all caught up</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={'notif-item' + (n.read ? '' : ' unread')}>
                  <div className={'notif-icon notif-icon-' + n.type}>
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="notif-content">
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notif-footer">
              {/* TODO: navigate to /notifications page */}
              <button onClick={() => setOpen(false)}>View all notifications</button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
