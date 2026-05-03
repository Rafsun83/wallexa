import { apiClient } from './client';

export async function getUser() {
  const { data } = await apiClient.get('/api/user');
  return data.data;
}
