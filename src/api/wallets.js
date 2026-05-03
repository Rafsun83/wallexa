import { apiClient } from "./client";

export async function getWallets() {
  const { data } = await apiClient.get("/api/wallets");
  return data.data;
}

export async function getWallet(id) {
  const { data } = await apiClient.get(`/api/wallets/${id}`);
  return data.data;
}

export async function createWallet(payload) {
  const { data } = await apiClient.post("/api/wallets", payload);
  return data;
}

export async function getTransactions(walletId) {
  const { data } = await apiClient.get(`/api/wallet/${walletId}/transaction`);
  return data;
}

export async function createTransaction(walletId, payload) {
  const { data } = await apiClient.post(`/api/wallet/${walletId}/transaction`, payload);
  return data;
}
