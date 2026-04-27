import { useState, useEffect } from 'react';
import { uid } from '../utils/format';

const STORAGE_KEY = 'wallet.wallets';
const TX_KEY = 'wallet.transactions';

function seedWallets() {
  const seed = [
    { id: uid(), name: 'Everyday Spending', currency: 'USD', balance: 2840.55, theme: 'emerald', createdAt: Date.now() - 86400000 * 12 },
    { id: uid(), name: 'Travel Fund', currency: 'USD', balance: 6120.0, theme: 'sapphire', createdAt: Date.now() - 86400000 * 30 },
    { id: uid(), name: 'Emergency', currency: 'USD', balance: 12000.0, theme: 'graphite', createdAt: Date.now() - 86400000 * 60 },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function seedTx(wallets) {
  const seed = [
    { id: uid(), walletId: wallets[0].id, kind: 'in',  title: 'Salary deposit',    merchant: 'Acme Corp',     amount: 4200.0,  ts: Date.now() - 1000 * 60 * 60 * 5 },
    { id: uid(), walletId: wallets[0].id, kind: 'out', title: 'Whole Foods',       merchant: 'Groceries',     amount: 87.42,   ts: Date.now() - 1000 * 60 * 60 * 12 },
    { id: uid(), walletId: wallets[1].id, kind: 'in',  title: 'Wallet top-up',     merchant: 'Bank transfer', amount: 500.0,   ts: Date.now() - 1000 * 60 * 60 * 26 },
    { id: uid(), walletId: wallets[0].id, kind: 'out', title: 'Netflix',           merchant: 'Subscription',  amount: 17.99,   ts: Date.now() - 1000 * 60 * 60 * 36 },
    { id: uid(), walletId: wallets[1].id, kind: 'out', title: 'Lufthansa flights', merchant: 'Travel',        amount: 612.4,   ts: Date.now() - 1000 * 60 * 60 * 48 },
    { id: uid(), walletId: wallets[2].id, kind: 'in',  title: 'Monthly savings',   merchant: 'Auto-transfer', amount: 1000.0,  ts: Date.now() - 1000 * 60 * 60 * 72 },
    { id: uid(), walletId: wallets[0].id, kind: 'fee', title: 'ATM withdrawal fee',merchant: 'Chase',         amount: 3.5,     ts: Date.now() - 1000 * 60 * 60 * 96 },
  ];
  localStorage.setItem(TX_KEY, JSON.stringify(seed));
  return seed;
}

export function useWallets() {
  const [wallets, setWallets] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seedWallets();
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const raw = localStorage.getItem(TX_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seedTx(wallets);
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets)); }, [wallets]);
  useEffect(() => { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); }, [transactions]);

  const createWallet = (data) => {
    const w = { id: uid(), name: data.name, currency: data.currency || 'USD', balance: 0, theme: data.theme || 'emerald', createdAt: Date.now() };
    setWallets((prev) => [...prev, w]);
    return w;
  };

  const addMoney = (walletId, amount, label) => {
    setWallets((prev) => prev.map((w) => w.id === walletId ? { ...w, balance: w.balance + amount } : w));
    setTransactions((prev) => [{
      id: uid(), walletId, kind: 'in', title: label || 'Top-up', merchant: 'Manual deposit', amount, ts: Date.now(),
    }, ...prev]);
  };

  return { wallets, transactions, createWallet, addMoney };
}
