"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PaymentMethod,
  Transaction,
  TransactionKind,
  createSampleTransactions,
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

const repairKnownMojibake = (value: string) =>
  value
    .replaceAll("\u00c3\u00a9", "é")
    .replaceAll("\u00c3\u00a8", "è")
    .replaceAll("\u00c3\u00aa", "ê")
    .replaceAll("\u00c3\u00a0", "à")
    .replaceAll("\u00c3\u00b4", "ô")
    .replaceAll("\u00c3\u00bb", "û")
    .replaceAll("\u00c3\u00a7", "ç")
    .replaceAll("\u00c3\u2030", "É");

const normalizePaymentMethod = (value: unknown): PaymentMethod | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const repaired = repairKnownMojibake(value);
  return paymentMethods.includes(repaired as PaymentMethod) ? (repaired as PaymentMethod) : undefined;
};

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  normalizePaymentMethod(value) !== undefined;

const normalizeCategory = (value: unknown) => (typeof value === "string" ? repairKnownMojibake(value) : "");

type NormalizableTransaction = Partial<Omit<Transaction, "amount">> & {
  amount: number | string;
  kind: TransactionKind;
  label: string;
};

const getNumericAmount = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value.replace(/\s/g, ""));
  }

  return Number.NaN;
};

const isTransaction = (value: unknown): value is NormalizableTransaction => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Transaction>;
  const amount = getNumericAmount(candidate.amount);

  return (
    (candidate.id === undefined || typeof candidate.id === "string") &&
    (candidate.date === undefined || isValidDateInput(candidate.date)) &&
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    Number.isFinite(amount) &&
    amount > 0 &&
    (candidate.category === undefined || typeof candidate.category === "string") &&
    (candidate.paymentMethod === undefined || isPaymentMethod(candidate.paymentMethod)) &&
    (candidate.partyName === undefined || typeof candidate.partyName === "string") &&
    (candidate.note === undefined || typeof candidate.note === "string") &&
    (candidate.isSample === undefined || typeof candidate.isSample === "boolean") &&
    typeof candidate.kind === "string" &&
    transactionKinds.includes(candidate.kind as TransactionKind)
  );
};

export type NormalizedTransactionsResult = {
  transactions: Transaction[];
  ignoredCount: number;
};

export const normalizeTransactionsWithReport = (value: unknown): NormalizedTransactionsResult | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const validTransactions = value.filter(isTransaction);
  const ignoredCount = value.length - validTransactions.length;

  if (ignoredCount > 0 && process.env.NODE_ENV !== "production") {
    console.warn(`${ignoredCount} invalid Ma Petite Compta transaction(s) ignored.`);
  }

  return {
    transactions: validTransactions.map((transaction) => ({
      ...transaction,
      id: transaction.id ?? crypto.randomUUID(),
      amount: getNumericAmount(transaction.amount),
      date: transaction.date ?? formatLocalDateInput(),
      paymentMethod: normalizePaymentMethod(transaction.paymentMethod) ?? "Autre",
      partyName: transaction.partyName ?? "",
      category: normalizeCategory(transaction.category),
      note: transaction.note ?? "",
      isSample: transaction.isSample ?? false,
      generated: generateAccounting(transaction.kind, getNumericAmount(transaction.amount))
    })),
    ignoredCount
  };
};

export const normalizeTransactions = (value: unknown): Transaction[] | null =>
  normalizeTransactionsWithReport(value)?.transactions ?? null;

const readStoredTransactions = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }

    return normalizeTransactionsWithReport(JSON.parse(saved) as unknown)?.transactions ?? [];
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
      addSampleTransactions: () =>
        setTransactions((current) => {
          const withoutSamples = current.filter((transaction) => !transaction.isSample);
          return [...createSampleTransactions(), ...withoutSamples];
        }),
      removeSampleTransactions: () => setTransactions((current) => current.filter((transaction) => !transaction.isSample)),
      updateTransaction: (transaction: Transaction) =>
        setTransactions((current) => current.map((item) => (item.id === transaction.id ? transaction : item))),
      replaceTransactions: (nextTransactions: Transaction[]) => setTransactions(nextTransactions),
      deleteTransaction: (id: string) => setTransactions((current) => current.filter((transaction) => transaction.id !== id)),
      clearTransactions: () => setTransactions([])
    }),
    [loaded, transactions]
  );
};
