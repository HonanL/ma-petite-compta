"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PaymentMethod,
  Transaction,
  TransactionKind,
  formatLocalDateInput,
  generateAccounting,
  paymentMethods
} from "@/lib/accounting";

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

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  typeof value === "string" && paymentMethods.includes(value as PaymentMethod);

const isTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Transaction>;

  return (
    typeof candidate.id === "string" &&
    (candidate.date === undefined || isValidDateInput(candidate.date)) &&
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    candidate.amount > 0 &&
    (candidate.category === undefined || typeof candidate.category === "string") &&
    (candidate.paymentMethod === undefined || isPaymentMethod(candidate.paymentMethod)) &&
    (candidate.partyName === undefined || typeof candidate.partyName === "string") &&
    (candidate.note === undefined || typeof candidate.note === "string") &&
    typeof candidate.kind === "string" &&
    transactionKinds.includes(candidate.kind as TransactionKind)
  );
};

export const normalizeTransactions = (value: unknown): Transaction[] | null => {
  if (!Array.isArray(value) || !value.every(isTransaction)) {
    return null;
  }

  return value.map((transaction) => ({
    ...transaction,
    date: transaction.date ?? formatLocalDateInput(),
    paymentMethod: transaction.paymentMethod ?? "Autre",
    partyName: transaction.partyName ?? "",
    category: transaction.category ?? "",
    note: transaction.note ?? "",
    generated: generateAccounting(transaction.kind, transaction.amount)
  }));
};

const readStoredTransactions = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }

    return normalizeTransactions(JSON.parse(saved) as unknown) ?? [];
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
      updateTransaction: (transaction: Transaction) =>
        setTransactions((current) => current.map((item) => (item.id === transaction.id ? transaction : item))),
      replaceTransactions: (nextTransactions: Transaction[]) => setTransactions(nextTransactions),
      deleteTransaction: (id: string) => setTransactions((current) => current.filter((transaction) => transaction.id !== id)),
      clearTransactions: () => setTransactions([])
    }),
    [loaded, transactions]
  );
};
