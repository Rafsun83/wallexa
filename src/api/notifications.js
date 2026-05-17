import { apiClient } from "./client";

export async function getNotifications() {
  const { data } = await apiClient.get("/api/notifications");
  return data.data ?? data;
}

export async function getUnreadCount() {
  const { data } = await apiClient.get("/api/notifications/unread-count");
  const result = data.data ?? data;
  // Handle both { count: N } and bare number responses
  return typeof result === "number"
    ? result
    : (result?.count ?? result?.unreadCount ?? 0);
}
