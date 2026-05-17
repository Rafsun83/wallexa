import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from './Icon';
import { useNotificationsQuery } from '../hooks/useNotifications';

function NotifIcon({ type }) {
  if (type === 'credit') return <Icon.download />;
  if (type === 'debit')  return <Icon.send />;
  return <Icon.alert />;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });

  const bellRef  = useRef(null);
  const panelRef = useRef(null);

  const queryClient = useQueryClient();
  const { data: raw = [], isLoading, isError } = useNotificationsQuery();

  // Normalise field names — adjust if your API uses different keys
  const notifications = raw.map((n) => ({
    id:      n.id,
    type:    n.type ?? n.notificationType ?? 'info',
    title:   n.title ?? n.subject ?? '',
    message: n.message ?? n.body ?? n.content ?? '',
    time:    timeAgo(n.createdAt ?? n.created_at ?? n.timestamp),
    read:    n.read ?? n.isRead ?? false,
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // TODO: connect WebSocket at /user/queue/notifications
  // useEffect(() => {
  //   const ws = new WebSocket(`${WS_BASE}/user/queue/notifications`);
  //   ws.onmessage = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
  //   return () => ws.close();
  // }, [queryClient]);

  const calcPos = () => {
    if (!bellRef.current) return;
    const r = bellRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left });
  };

  const toggle = () => {
    if (!open) calcPos();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!bellRef.current?.contains(e.target) && !panelRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

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
    // TODO: call PATCH /notifications/mark-all-read then invalidate
    // await apiClient.patch('/notifications/mark-all-read');
    queryClient.setQueryData(['notifications'], (prev) =>
      prev?.map((n) => ({ ...n, read: true, isRead: true })) ?? prev
    );
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
            {isLoading && (
              <div className="notif-loading">
                <div className="notif-skeleton" />
                <div className="notif-skeleton" />
                <div className="notif-skeleton short" />
              </div>
            )}

            {isError && (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <Icon.alert width={20} height={20} />
                </div>
                <p>Could not load notifications</p>
              </div>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <Icon.bell width={22} height={22} />
                </div>
                <p>You're all caught up</p>
              </div>
            )}

            {!isLoading && !isError && notifications.map((n) => (
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
            ))}
          </div>

          {!isLoading && !isError && notifications.length > 0 && (
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
