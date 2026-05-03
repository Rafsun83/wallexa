import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uid } from "../utils/format";
import * as walletsApi from "../api/wallets";

const THEMES = ["emerald", "sapphire", "graphite", "bronze"];
const TX_KEY = "wallet.transactions";

function mapWallet(item, index = 0) {
  return {
    id: String(item.id),
    name: item.walletName,
    balance: item.totalAmount ?? 0,
    type: item.type || "personal",
    category: item.category || "general",
    note: item.note || "",
    currency: item.currency || "USD",
    theme: item.theme || THEMES[index % THEMES.length],
    createdAt: item.createdAt || Date.now(),
  };
}

export function useWalletsQuery() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const raw = await walletsApi.getWallets();
      console.log("[wallets API response]", raw);
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

export function useWallets() {
  const { data: wallets = [], isLoading, error } = useWalletsQuery();
  const queryClient = useQueryClient();

  const [transactions, setTransactions] = useState(() => {
    try {
      const raw = localStorage.getItem(TX_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addMoney = (walletId, amount, label) => {
    queryClient.setQueryData(["wallets"], (old = []) =>
      old.map((w) =>
        w.id === walletId ? { ...w, balance: w.balance + amount } : w,
      ),
    );
    setTransactions((prev) => [
      {
        id: uid(),
        walletId,
        kind: "in",
        title: label || "Top-up",
        merchant: "Manual deposit",
        amount,
        ts: Date.now(),
      },
      ...prev,
    ]);
  };

  return { wallets, isLoading, error, transactions, addMoney };
}
