import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import * as walletsApi from "../api/wallets";

const THEMES = ["emerald", "sapphire", "graphite", "bronze"];

function mapWallet(item, index = 0) {
  return {
    id:        String(item.id),
    name:      item.walletName,
    balance:   item.totalAmount ?? 0,
    type:      item.type     || "personal",
    category:  item.category || "general",
    note:      item.note     || "",
    currency:  item.currency || "USD",
    theme:     item.theme    || THEMES[index % THEMES.length],
    createdAt: item.createdAt || Date.now(),
  };
}

function mapTransaction(item, walletId) {
  return {
    id:       String(item.id),
    walletId: String(item.walletId ?? walletId),
    kind:     item.type === "DEBIT" ? "out" : "in",
    title:    item.note     || (item.type === "DEBIT" ? "Withdrawal" : "Top-up"),
    merchant: item.category || "Manual",
    amount:   item.amount   ?? 0,
    ts:       item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
  };
}

export function useWalletsQuery() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const raw = await walletsApi.getWallets();
      return (Array.isArray(raw) ? raw : []).map(mapWallet);
    },
  });
}

export function useWalletDetailQuery(id) {
  return useQuery({
    queryKey: ["wallets", id],
    queryFn: async () => mapWallet(await walletsApi.getWallet(id)),
    enabled: !!id,
  });
}

function useAllTransactionsQuery(walletIds) {
  const results = useQueries({
    queries: walletIds.map((id) => ({
      queryKey: ["transactions", id],
      queryFn: async () => {
        const raw  = await walletsApi.getTransactions(id);
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        return list.map((tx) => mapTransaction(tx, id));
      },
      enabled: !!id,
    })),
  });

  return {
    transactions: results
      .flatMap((r) => r.data || [])
      .sort((a, b) => b.ts - a.ts),
    txLoading: walletIds.length > 0 && results.some((r) => r.isLoading),
  };
}

export function useWallets() {
  const { data: wallets = [], isLoading, error } = useWalletsQuery();
  const { transactions, txLoading } = useAllTransactionsQuery(wallets.map((w) => w.id));
  const queryClient = useQueryClient();

  const addMoney = (walletId, { type, amount }) => {
    const delta = type === "DEBIT" ? -amount : amount;
    queryClient.setQueryData(["wallets"], (old = []) =>
      old.map((w) => w.id === walletId ? { ...w, balance: w.balance + delta } : w)
    );
  };

  return { wallets, isLoading, txLoading, error, transactions, addMoney };
}
