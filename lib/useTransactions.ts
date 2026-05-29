"use client";

import { useEffect, useMemo, useState } from "react";
import { Transaction, demoTransactions } from "@/lib/accounting";

const STORAGE_KEY = "ma-petite-compta-transactions";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // localStorage is only available after mount, so this hydration step is intentionally effect-driven.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions(JSON.parse(saved) as Transaction[]);
    } else {
      const demo = demoTransactions();
      setTransactions(demo);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [loaded, transactions]);

  return useMemo(
    () => ({
      transactions,
      loaded,
      addTransaction: (transaction: Transaction) => setTransactions((current) => [transaction, ...current]),
      clearTransactions: () => setTransactions([])
    }),
    [loaded, transactions]
  );
};
