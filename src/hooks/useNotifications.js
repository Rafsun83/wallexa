import { useQuery } from '@tanstack/react-query';
import { getNotifications, getUnreadCount } from '../api/notifications';

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
  });
}
