"use client";

import { useEffect, useMemo, useState } from "react";
import { Transaction, TransactionKind, generateAccounting } from "@/lib/accounting";

const STORAGE_KEY = "ma-petite-compta-transactions";

const transactionKinds: TransactionKind[] = [
  "owner-investment",
  "client-payment",
  "cash-expense",
  "equipment-purchase",
  "supplies-credit",
  "supplier-payment",
  "owner-withdrawal",
  "bank-loan"
];

const isValidDateInput = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const isTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Transaction>;

  return (
    typeof candidate.id === "string" &&
    isValidDateInput(candidate.date) &&
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    candidate.amount > 0 &&
    (candidate.category === undefined || typeof candidate.category === "string") &&
    typeof candidate.kind === "string" &&
    transactionKinds.includes(candidate.kind as TransactionKind)
  );
};

const readStoredTransactions = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isTransaction)) {
      return [];
    }

    return parsed.map((transaction) => ({
      ...transaction,
      generated: generateAccounting(transaction.kind, transaction.amount)
    }));
  } catch {
    return [];
  }
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = readStoredTransactions();
    if (saved) {
      // localStorage is only available after mount, so this hydration step is intentionally effect-driven.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions(saved);
    } else {
      setTransactions([]);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
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
      deleteTransaction: (id: string) => setTransactions((current) => current.filter((transaction) => transaction.id !== id)),
      clearTransactions: () => setTransactions([])
    }),
    [loaded, transactions]
  );
};
