import { apiClient } from './client';

/**
 * POST /api/auth/register
 * payload: { name, email, location, password, username }
 */
export async function register(payload) {
  const { data } = await apiClient.post('/api/auth/register', payload);
  return data;
}

/**
 * POST /api/auth/login
 * payload: { username, password, deviceId }
 * response: { accessToken, refreshToken, user }
 */
export async function login(payload) {
  const { data } = await apiClient.post('/api/auth/login', payload);
  return data;
}

/**
 * POST /api/auth/logout
 * payload: { refreshToken }
 */
export async function logout(refreshToken) {
  const { data } = await apiClient.post('/api/auth/logout', { refreshToken });
  return data;
}

/**
 * POST /api/auth  (logout from all devices)
 * payload: { refreshToken }
 */
export async function logoutAll(refreshToken) {
  const { data } = await apiClient.post('/api/auth', { refreshToken });
  return data;
}
