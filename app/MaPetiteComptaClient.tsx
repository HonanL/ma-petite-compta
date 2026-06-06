"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  FileBarChart2,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Menu,
  PiggyBank,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Scale,
  ShieldCheck,
  Upload,
  WalletCards,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, RefObject, useMemo, useRef, useState } from "react";
import {
  AccountType,
  accountNormalSide,
  calculateAccountBalances,
  calculateSummary,
  createTransaction,
  formatCurrency,
  formatLocalDateInput,
  PaymentMethod,
  paymentMethods,
  sum,
  Transaction,
  TransactionKind,
  transactionTemplates
} from "@/lib/accounting";
import {
  BusinessProfile,
  businessProfiles,
  getBusinessProfileDefinition
} from "@/lib/businessProfile";
import { createBackup, getBackupFilename, parseBackup } from "@/lib/backup";
import {
  Language,
  translateBusinessProfileName,
  transactionKindLabels,
  translateAccountName,
  translateCategoryName,
  translateExampleText,
  translatePaymentMethod,
  translateStatementName,
  translations
} from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import { useBusinessProfile } from "@/lib/useBusinessProfile";
import { useTransactions } from "@/lib/useTransactions";

type Tab = "dashboard" | "transactions" | "add" | "reports" | "learn" | "settings";
type PeriodPreset = "all" | "current-month" | "last-month" | "current-year" | "custom";
type AppTranslations = (typeof translations)[Language];

type PeriodState = {
  preset: PeriodPreset;
  startDate: string;
  endDate: string;
};

type QuizQuestion = {
  type: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
};

const navigation = [
  { id: "dashboard" as Tab, href: "/dashboard", icon: LayoutDashboard },
  { id: "transactions" as Tab, href: "/transactions", icon: ReceiptText },
  { id: "add" as Tab, href: "/transactions/new", icon: Plus },
  { id: "reports" as Tab, href: "/reports", icon: FileBarChart2 },
  { id: "learn" as Tab, href: "/learn", icon: GraduationCap },
  { id: "settings" as Tab, href: "/settings", icon: BriefcaseBusiness }
];

const tabRoutes: Record<Tab, string> = {
  dashboard: "/dashboard",
  transactions: "/transactions",
  add: "/transactions/new",
  reports: "/reports",
  learn: "/learn",
  settings: "/settings"
};

const cashAccountName = "Encaisse (Cash)";
const accountsPayableName = "Comptes fournisseurs (Accounts Payable)";
const logoPath = "/logo-ma-petite-compta.png?v=20260604";

const getAccountBalance = (transactions: Transaction[], accountName: string) =>
  calculateAccountBalances(transactions).find((balance) => balance.account === accountName)?.balance ?? 0;

const lessons = [
  {
    title: "Actifs",
    icon: WalletCards,
    text: "Les actifs sont ce que l'entreprise possède ou contrôle: argent, équipement, fournitures ou montants à recevoir."
  },
  {
    title: "Passifs",
    icon: CreditCard,
    text: "Les passifs sont les dettes: fournisseurs à payer, emprunts bancaires ou obligations futures."
  },
  {
    title: "Capitaux propres",
    icon: PiggyBank,
    text: "Les capitaux propres représentent la part du propriétaire: apports, bénéfices conservés et retraits."
  },
  {
    title: "Revenus",
    icon: ArrowUpRight,
    text: "Les revenus viennent des ventes ou services. Ils augmentent le bénéfice et donc les capitaux propres."
  },
  {
    title: "Dépenses",
    icon: ArrowDownRight,
    text: "Les dépenses sont les coûts nécessaires pour gagner des revenus. Elles diminuent le bénéfice."
  },
  {
    title: "Débit et crédit",
    icon: Scale,
    text: "Chaque transaction a au moins un débit et un crédit. Les actifs et dépenses augmentent au débit; les passifs, revenus et capitaux propres augmentent au crédit."
  },
  {
    title: "Écritures de journal",
    icon: ReceiptText,
    text: "Une écriture de journal décrit quels comptes changent, avec les montants au débit et au crédit."
  },
  {
    title: "Comptes en T",
    icon: ClipboardList,
    text: "Un compte en T sépare les débits à gauche et les crédits à droite pour visualiser le solde d'un compte."
  },
  {
    title: "Balance de vérification",
    icon: ShieldCheck,
    text: "La balance de vérification liste tous les comptes. Le total des débits doit égaler le total des crédits."
  },
  {
    title: "États financiers",
    icon: FileBarChart2,
    text: "L'état des résultats montre le bénéfice. Le bilan montre actifs, passifs et capitaux propres à une date donnée."
  }
];

const quizQuestions: QuizQuestion[] = [
  {
    type: "Type de compte",
    prompt: "Quel est le type du compte Caisse ?",
    choices: ["Actif", "Passif", "Capitaux propres", "Revenu", "Dépense"],
    correctAnswer: "Actif",
    explanation: "Caisse représente l'argent disponible de l'entreprise. C'est donc un actif."
  },
  {
    type: "Type de compte",
    prompt: "Quel est le type du compte Comptes fournisseurs ?",
    choices: ["Actif", "Passif", "Capitaux propres", "Revenu", "Dépense"],
    correctAnswer: "Passif",
    explanation: "Les comptes fournisseurs représentent des montants que l'entreprise doit payer. C'est un passif."
  },
  {
    type: "Type de compte",
    prompt: "Quel est le type du compte Revenus de service ?",
    choices: ["Actif", "Passif", "Capitaux propres", "Revenu", "Dépense"],
    correctAnswer: "Revenu",
    explanation: "Les revenus de service sont gagnés lorsque l'entreprise réalise un travail pour un client."
  },
  {
    type: "Type de compte",
    prompt: "Quel est le type du compte Dépense de carburant ?",
    choices: ["Actif", "Passif", "Capitaux propres", "Revenu", "Dépense"],
    correctAnswer: "Dépense",
    explanation: "Le carburant utilisé pour travailler est un coût de l'entreprise. C'est une dépense."
  },
  {
    type: "Type de compte",
    prompt: "Quel est le type du compte Capital du propriétaire ?",
    choices: ["Actif", "Passif", "Capitaux propres", "Revenu", "Dépense"],
    correctAnswer: "Capitaux propres",
    explanation: "Le capital représente la part investie par le propriétaire dans l'entreprise."
  },
  {
    type: "Débit ou crédit",
    prompt: "La Caisse augmente. Quel côté augmente ?",
    choices: ["Débit", "Crédit"],
    correctAnswer: "Débit",
    explanation: "Caisse est un actif. Quand un actif augmente, on le débite."
  },
  {
    type: "Débit ou crédit",
    prompt: "Une dette bancaire augmente. Quel côté augmente ?",
    choices: ["Débit", "Crédit"],
    correctAnswer: "Crédit",
    explanation: "Une dette bancaire est un passif. Quand un passif augmente, on le crédite."
  },
  {
    type: "Débit ou crédit",
    prompt: "Les revenus de service augmentent. Quel côté augmente ?",
    choices: ["Débit", "Crédit"],
    correctAnswer: "Crédit",
    explanation: "Les revenus augmentent normalement au crédit."
  },
  {
    type: "Débit ou crédit",
    prompt: "Une dépense de publicité augmente. Quel côté augmente ?",
    choices: ["Débit", "Crédit"],
    correctAnswer: "Débit",
    explanation: "Les dépenses augmentent normalement au débit."
  },
  {
    type: "Analyse de transaction",
    prompt: "Un client paie 25 000 FCFA pour un service. Quelle écriture est correcte ?",
    choices: [
      "Débit Caisse 25 000 FCFA / Crédit Revenus de service 25 000 FCFA",
      "Débit Revenus de service 25 000 FCFA / Crédit Caisse 25 000 FCFA",
      "Débit Caisse 25 000 FCFA / Crédit Capital du propriétaire 25 000 FCFA"
    ],
    correctAnswer: "Débit Caisse 25 000 FCFA / Crédit Revenus de service 25 000 FCFA",
    explanation: "L'argent reçu augmente la Caisse au débit, et le service gagné augmente les revenus au crédit."
  },
  {
    type: "Analyse de transaction",
    prompt: "L'entreprise paie 5 000 FCFA d'essence. Quelle écriture est correcte ?",
    choices: [
      "Débit Dépense de carburant 5 000 FCFA / Crédit Caisse 5 000 FCFA",
      "Débit Caisse 5 000 FCFA / Crédit Dépense de carburant 5 000 FCFA",
      "Débit Fournitures 5 000 FCFA / Crédit Comptes fournisseurs 5 000 FCFA"
    ],
    correctAnswer: "Débit Dépense de carburant 5 000 FCFA / Crédit Caisse 5 000 FCFA",
    explanation: "La dépense de carburant augmente au débit et la Caisse diminue au crédit."
  },
  {
    type: "Analyse de transaction",
    prompt: "Le propriétaire investit 100 000 FCFA. Quelle écriture est correcte ?",
    choices: [
      "Débit Caisse 100 000 FCFA / Crédit Capital du propriétaire 100 000 FCFA",
      "Débit Capital du propriétaire 100 000 FCFA / Crédit Caisse 100 000 FCFA",
      "Débit Caisse 100 000 FCFA / Crédit Revenus de service 100 000 FCFA"
    ],
    correctAnswer: "Débit Caisse 100 000 FCFA / Crédit Capital du propriétaire 100 000 FCFA",
    explanation: "L'investissement augmente la Caisse au débit et le capital du propriétaire au crédit."
  }
];

const englishQuizQuestions: QuizQuestion[] = [
  {
    type: "Account type",
    prompt: "What type of account is Cash?",
    choices: ["Asset", "Liability", "Owner's Equity", "Revenue", "Expense"],
    correctAnswer: "Asset",
    explanation: "Cash is money available to the business. It is an asset."
  },
  {
    type: "Account type",
    prompt: "What type of account is Accounts Payable?",
    choices: ["Asset", "Liability", "Owner's Equity", "Revenue", "Expense"],
    correctAnswer: "Liability",
    explanation: "Accounts Payable means amounts the business still has to pay. It is a liability."
  },
  {
    type: "Account type",
    prompt: "What type of account is Service Revenue?",
    choices: ["Asset", "Liability", "Owner's Equity", "Revenue", "Expense"],
    correctAnswer: "Revenue",
    explanation: "Service revenue is earned when the business does work for a client."
  },
  {
    type: "Account type",
    prompt: "What type of account is Fuel Expense?",
    choices: ["Asset", "Liability", "Owner's Equity", "Revenue", "Expense"],
    correctAnswer: "Expense",
    explanation: "Fuel used for work is a business cost. It is an expense."
  },
  {
    type: "Account type",
    prompt: "What type of account is Owner's Capital?",
    choices: ["Asset", "Liability", "Owner's Equity", "Revenue", "Expense"],
    correctAnswer: "Owner's Equity",
    explanation: "Owner's capital represents the amount invested by the owner in the business."
  },
  {
    type: "Debit or credit",
    prompt: "Cash increases. Which side increases?",
    choices: ["Debit", "Credit"],
    correctAnswer: "Debit",
    explanation: "Cash is an asset. When an asset increases, it is debited."
  },
  {
    type: "Debit or credit",
    prompt: "A bank debt increases. Which side increases?",
    choices: ["Debit", "Credit"],
    correctAnswer: "Credit",
    explanation: "A bank debt is a liability. When a liability increases, it is credited."
  },
  {
    type: "Debit or credit",
    prompt: "Service revenue increases. Which side increases?",
    choices: ["Debit", "Credit"],
    correctAnswer: "Credit",
    explanation: "Revenue normally increases on the credit side."
  },
  {
    type: "Debit or credit",
    prompt: "Advertising expense increases. Which side increases?",
    choices: ["Debit", "Credit"],
    correctAnswer: "Debit",
    explanation: "Expenses normally increase on the debit side."
  },
  {
    type: "Transaction analysis",
    prompt: "A client pays 25 000 FCFA for a service. Which journal entry is correct?",
    choices: [
      "Debit Cash 25 000 FCFA / Credit Service Revenue 25 000 FCFA",
      "Debit Service Revenue 25 000 FCFA / Credit Cash 25 000 FCFA",
      "Debit Cash 25 000 FCFA / Credit Owner's Capital 25 000 FCFA"
    ],
    correctAnswer: "Debit Cash 25 000 FCFA / Credit Service Revenue 25 000 FCFA",
    explanation: "The money received increases Cash with a debit, and the service earned increases revenue with a credit."
  },
  {
    type: "Transaction analysis",
    prompt: "The business pays 5 000 FCFA for fuel. Which journal entry is correct?",
    choices: [
      "Debit Fuel Expense 5 000 FCFA / Credit Cash 5 000 FCFA",
      "Debit Cash 5 000 FCFA / Credit Fuel Expense 5 000 FCFA",
      "Debit Supplies 5 000 FCFA / Credit Accounts Payable 5 000 FCFA"
    ],
    correctAnswer: "Debit Fuel Expense 5 000 FCFA / Credit Cash 5 000 FCFA",
    explanation: "Fuel expense increases with a debit, and Cash decreases with a credit."
  },
  {
    type: "Transaction analysis",
    prompt: "The owner invests 100 000 FCFA. Which journal entry is correct?",
    choices: [
      "Debit Cash 100 000 FCFA / Credit Owner's Capital 100 000 FCFA",
      "Debit Owner's Capital 100 000 FCFA / Credit Cash 100 000 FCFA",
      "Debit Cash 100 000 FCFA / Credit Service Revenue 100 000 FCFA"
    ],
    correctAnswer: "Debit Cash 100 000 FCFA / Credit Owner's Capital 100 000 FCFA",
    explanation: "The investment increases Cash with a debit and Owner's Capital with a credit."
  }
];

const englishLessons: Record<string, { title: string; text: string }> = {
  Actifs: {
    title: "Assets",
    text: "Assets are what the business owns or controls: cash, equipment, supplies, or amounts to receive."
  },
  Passifs: {
    title: "Liabilities",
    text: "Liabilities are debts: suppliers to pay, bank loans, or future obligations."
  },
  "Capitaux propres": {
    title: "Owner's Equity",
    text: "Owner's equity represents the owner's share: investments, retained profit, and withdrawals."
  },
  Revenus: {
    title: "Revenue",
    text: "Revenue comes from sales or services. It increases profit and therefore owner's equity."
  },
  Dépenses: {
    title: "Expenses",
    text: "Expenses are the costs needed to earn revenue. They reduce profit."
  },
  "Débit et crédit": {
    title: "Debit and Credit",
    text: "Every transaction has at least one debit and one credit. Assets and expenses increase with debits; liabilities, revenue, and owner's equity increase with credits."
  },
  "Écritures de journal": {
    title: "Journal Entries",
    text: "A journal entry shows which accounts change, with amounts recorded as debits and credits."
  },
  "Comptes en T": {
    title: "T-Accounts",
    text: "A T-account separates debits on the left and credits on the right to visualize an account balance."
  },
  "Balance de vérification": {
    title: "Trial Balance",
    text: "The trial balance lists all accounts. Total debits must equal total credits."
  },
  "États financiers": {
    title: "Financial Statements",
    text: "The income statement shows profit. The balance sheet shows assets, liabilities, and owner's equity at a given date."
  }
};

const getPeriodRange = (period: PeriodState) => {
  const today = new Date();

  if (period.preset === "current-month") {
    return {
      startDate: formatLocalDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: formatLocalDateInput(new Date(today.getFullYear(), today.getMonth() + 1, 0))
    };
  }

  if (period.preset === "last-month") {
    return {
      startDate: formatLocalDateInput(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      endDate: formatLocalDateInput(new Date(today.getFullYear(), today.getMonth(), 0))
    };
  }

  if (period.preset === "current-year") {
    return {
      startDate: formatLocalDateInput(new Date(today.getFullYear(), 0, 1)),
      endDate: formatLocalDateInput(new Date(today.getFullYear(), 11, 31))
    };
  }

  if (period.preset === "custom") {
    return {
      startDate: period.startDate,
      endDate: period.endDate
    };
  }

  return {
    startDate: "",
    endDate: ""
  };
};

const hasUsableDate = (transaction: Transaction) => /^\d{4}-\d{2}-\d{2}$/.test(transaction.date);

const formatDisplayDate = (dateInput: string, language: Language) => {
  const [year, month, day] = dateInput.split("-").map(Number);
  if (!year || !month || !day) {
    return dateInput;
  }

  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
};

const filterTransactionsByPeriod = (transactions: Transaction[], period: PeriodState) => {
  const range = getPeriodRange(period);

  if (period.preset === "all") {
    return transactions;
  }

  return transactions.filter((transaction) => {
    if (!hasUsableDate(transaction)) {
      return false;
    }

    const afterStart = range.startDate ? transaction.date >= range.startDate : true;
    const beforeEnd = range.endDate ? transaction.date <= range.endDate : true;

    return afterStart && beforeEnd;
  });
};

const filterTransactionsUntilPeriodEnd = (transactions: Transaction[], period: PeriodState) => {
  const { endDate } = getPeriodRange(period);

  if (period.preset === "all" || !endDate) {
    return transactions;
  }

  return transactions.filter((transaction) => hasUsableDate(transaction) && transaction.date <= endDate);
};

const getPeriodLabel = (period: PeriodState, language: Language) => {
  const range = getPeriodRange(period);
  const labels = translations[language].periods;

  if (period.preset === "custom") {
    if (range.startDate && range.endDate) {
      return language === "fr"
        ? `${labels.custom} : du ${formatDisplayDate(range.startDate, language)} au ${formatDisplayDate(range.endDate, language)}`
        : `${labels.custom}: from ${range.startDate} to ${range.endDate}`;
    }

    if (range.startDate) {
      return language === "fr" ? `${labels.custom} : depuis le ${formatDisplayDate(range.startDate, language)}` : `${labels.custom}: from ${formatDisplayDate(range.startDate, language)}`;
    }

    if (range.endDate) {
      return language === "fr" ? `${labels.custom} : jusqu'au ${formatDisplayDate(range.endDate, language)}` : `${labels.custom}: until ${formatDisplayDate(range.endDate, language)}`;
    }
  }

  if (period.preset !== "all" && range.startDate && range.endDate) {
    return language === "fr"
      ? `${labels[period.preset]} : du ${formatDisplayDate(range.startDate, language)} au ${formatDisplayDate(range.endDate, language)}`
      : `${labels[period.preset]}: from ${formatDisplayDate(range.startDate, language)} to ${formatDisplayDate(range.endDate, language)}`;
  }

  return labels[period.preset];
};

const escapeCsvValue = (value: string | number | undefined) => {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
};

const getTransactionsCsvFilename = (period: PeriodState) => {
  const range = getPeriodRange(period);

  if (period.preset === "all") {
    return "ma-petite-compta-transactions.csv";
  }

  if (period.preset === "current-month") {
    return "ma-petite-compta-transactions-ce-mois.csv";
  }

  if (period.preset === "last-month") {
    return "ma-petite-compta-transactions-mois-dernier.csv";
  }

  if (period.preset === "current-year") {
    return `ma-petite-compta-transactions-${new Date().getFullYear()}.csv`;
  }

  const dates = [range.startDate, range.endDate].filter(Boolean).join("-");
  return `ma-petite-compta-transactions${dates ? `-${dates}` : "-periode-personnalisee"}.csv`;
};

const downloadTransactionsCsv = (transactions: Transaction[], period: PeriodState, language: Language) => {
  const headers =
    language === "fr"
      ? ["Date", "Type de transaction", "Description", "Catégorie", "Méthode de paiement", "Client/fournisseur", "Notes", "Montant", "Devise"]
      : ["Date", "Transaction type", "Description", "Category", "Payment method", "Client/supplier", "Notes", "Amount", "Currency"];

  const rows = transactions.map((transaction) => [
    transaction.date,
    transactionKindLabels[transaction.kind][language],
    transaction.label,
    translateCategoryName(transaction.category ?? "", language),
    translatePaymentMethod(transaction.paymentMethod, language),
    transaction.partyName,
    transaction.note,
    transaction.amount,
    "FCFA"
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getTransactionsCsvFilename(period);
  link.click();
  URL.revokeObjectURL(url);
};

const getDisplayedExplanation = (transaction: Transaction, language: Language) => {
  if (language === "fr") {
    return transaction.generated.explanation;
  }

  const amount = formatCurrency(transaction.amount);

  switch (transaction.kind) {
    case "owner-investment":
      return `The owner invests ${amount}. Cash increases and Owner's Capital increases by the same amount.`;
    case "client-payment":
      return `A client pays ${amount}. Cash increases and Service Revenue increases by the same amount.`;
    case "cash-expense":
      return `The business pays an expense of ${amount}. The expense increases and Cash decreases.`;
    case "equipment-purchase":
      return `The business buys equipment for ${amount}. Equipment increases and Cash decreases.`;
    case "supplies-credit":
      return `The business buys supplies on credit for ${amount}. Supplies increase and Accounts Payable increases.`;
    case "supplier-payment":
      return `The business pays a supplier ${amount}. Accounts Payable decreases and Cash decreases.`;
    case "owner-withdrawal":
      return `The owner withdraws ${amount}. Owner's Drawings increase and Cash decreases.`;
    case "bank-loan":
      return `The business receives a bank loan of ${amount}. Cash increases and Bank Loan increases.`;
  }
};

const transactionTypeHelpers: Record<TransactionKind, Record<Language, string>> = {
  "owner-investment": {
    fr: "Le propriétaire met son propre argent dans l'entreprise. La caisse augmente et le capital augmente.",
    en: "The owner puts personal money into the business. Cash increases and owner's capital increases."
  },
  "client-payment": {
    fr: "Un client vous paie pour un service ou une vente. La caisse augmente et un revenu est gagné.",
    en: "A client pays you for a service or sale. Cash increases and revenue is earned."
  },
  "cash-expense": {
    fr: "L'entreprise paie une dépense tout de suite. Une dépense augmente et la caisse diminue.",
    en: "The business pays an expense right away. An expense increases and cash decreases."
  },
  "equipment-purchase": {
    fr: "L'entreprise achète un bien durable comme un outil, un ordinateur ou une machine.",
    en: "The business buys a long-lasting item such as a tool, computer, or machine."
  },
  "supplies-credit": {
    fr: "L'entreprise reçoit des fournitures maintenant mais paiera le fournisseur plus tard.",
    en: "The business receives supplies now but will pay the supplier later."
  },
  "supplier-payment": {
    fr: "L'entreprise rembourse un fournisseur déjà dû. La dette fournisseur et la caisse diminuent.",
    en: "The business pays a supplier it already owed. Accounts payable and cash decrease."
  },
  "owner-withdrawal": {
    fr: "Le propriétaire retire de l'argent de l'entreprise pour usage personnel.",
    en: "The owner takes money out of the business for personal use."
  },
  "bank-loan": {
    fr: "La banque prête de l'argent à l'entreprise. La caisse augmente et une dette bancaire apparaît.",
    en: "The bank lends money to the business. Cash increases and a bank debt appears."
  }
};

export default function MaPetiteComptaClient({ activePage }: { activePage: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(activePage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [period, setPeriod] = useState<PeriodState>({ preset: "current-month", startDate: "", endDate: "" });
  const [backupMessage, setBackupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage } = useLanguage();
  const ui = translations[language];
  const {
    transactions,
    loaded,
    addTransaction,
    addSampleTransactions,
    removeSampleTransactions,
    updateTransaction,
    replaceTransactions,
    deleteTransaction,
    clearTransactions
  } = useTransactions();
  const { profile, loaded: profileLoaded, setProfile } = useBusinessProfile();
  const periodTransactions = useMemo(() => filterTransactionsByPeriod(transactions, period), [transactions, period]);
  const balanceTransactions = useMemo(() => filterTransactionsUntilPeriodEnd(transactions, period), [transactions, period]);
  const periodSummary = useMemo(() => calculateSummary(periodTransactions, null), [periodTransactions]);
  const periodBalances = useMemo(() => calculateAccountBalances(periodTransactions), [periodTransactions]);
  const balanceBalances = useMemo(() => calculateAccountBalances(balanceTransactions), [balanceTransactions]);
  const balanceSummary = useMemo(() => calculateSummary(balanceTransactions, null), [balanceTransactions]);
  const periodLabel = getPeriodLabel(period, language);
  const businessProfile = getBusinessProfileDefinition(profile);

  const navigateTo = (nextTab: Tab) => {
    setTab(nextTab);
    setMobileMenuOpen(false);
    router.push(tabRoutes[nextTab]);
  };

  const confirmClearTransactions = () => {
    const confirmed = window.confirm(ui.confirmations.clearAll);

    if (confirmed) {
      clearTransactions();
    }
  };

  const startEditingTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    navigateTo("add");
  };

  const stopEditingTransaction = () => {
    setEditingTransaction(null);
  };

  const saveEditedTransaction = (transaction: Transaction) => {
    updateTransaction(transaction);
    setEditingTransaction(null);
    navigateTo("transactions");
  };

  const startNewTransaction = () => {
    setEditingTransaction(null);
    navigateTo("add");
  };

  const exportBackup = () => {
    const backup = createBackup(transactions, profile, language);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getBackupFilename();
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage({ type: "success", text: ui.messages.backupExported });
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const parsed = parseBackup(JSON.parse(await file.text()) as unknown);
      if (!parsed) {
        setBackupMessage({
          type: "error",
          text: ui.messages.invalidBackup
        });
        return;
      }

      const confirmed = window.confirm(ui.confirmations.importBackup);
      if (!confirmed) {
        return;
      }

      replaceTransactions(parsed.transactions);
      setProfile(parsed.businessProfile);
      if (parsed.language) {
        setLanguage(parsed.language);
      }
      setEditingTransaction(null);
      navigateTo("dashboard");
      setBackupMessage({
        type: parsed.ignoredTransactionCount ? "error" : "success",
        text: parsed.ignoredTransactionCount ? `${ui.messages.backupImported} ${ui.messages.ignoredInvalidTransactions}` : ui.messages.backupImported
      });
    } catch {
      setBackupMessage({
        type: "error",
        text: ui.messages.invalidJson
      });
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-6 lg:flex-row lg:gap-5 lg:py-6">
        <aside className="panel no-print flex flex-col gap-4 p-3 sm:p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
          <div>
            <div className="flex items-center justify-between gap-3 lg:items-start lg:justify-start">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-white shadow-soft">
                  <Image src={logoPath} alt="" width={48} height={48} className="h-full w-full object-cover" priority />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-bold text-ink">{ui.appName}</h1>
                  <p className="truncate text-xs text-moss">{ui.appSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="button-secondary min-h-11 px-3 lg:hidden"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={18} aria-hidden />
                {ui.mobileMenu.menu}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="label">{ui.language}</p>
              <div className="inline-flex border border-line bg-white shadow-sm" style={{ borderRadius: 6 }}>
                {(["fr", "en"] as Language[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLanguage(option)}
                    className={`min-h-9 px-3 text-xs font-bold ${language === option ? "bg-moss text-white" : "text-moss hover:bg-mint"}`}
                    style={{ borderRadius: 5 }}
                  >
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <nav className="hidden gap-2 lg:grid lg:grid-cols-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (item.id === "add") {
                      startNewTransaction();
                    } else {
                      setTab(item.id);
                    }
                  }}
                  className={`flex min-h-11 items-center justify-start gap-3 px-3 py-2 text-left text-sm font-semibold leading-tight transition ${
                    tab === item.id ? "bg-moss text-white shadow-sm" : "text-moss hover:bg-mint"
                  }`}
                  style={{ borderRadius: 6 }}
                >
                  <Icon className="shrink-0" size={18} aria-hidden />
                  <span className="line-clamp-2">{ui.nav[item.id]}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden border-t border-line pt-4 text-sm text-moss lg:block">
            <p className="label">{ui.storage}</p>
            <p className="mt-2">{ui.localStorage}</p>
          </div>
        </aside>

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/45"
              aria-label={ui.mobileMenu.close}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute bottom-0 right-0 top-0 flex w-full max-w-sm flex-col border-l border-line bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="label">{ui.mobileMenu.menu}</p>
                  <h2 className="text-lg font-bold text-moss">{ui.appName}</h2>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="button-secondary min-h-11 px-3">
                  <X size={18} aria-hidden />
                  {ui.mobileMenu.close}
                </button>
              </div>
              <nav className="grid gap-2 pt-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = tab === item.id;
                  const isAdd = item.id === "add";
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        if (isAdd) {
                          startNewTransaction();
                        } else {
                          setTab(item.id);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`flex min-h-14 items-center gap-3 rounded-md border px-4 py-3 text-base font-bold transition ${
                        isActive
                          ? "border-moss bg-moss text-white"
                          : isAdd
                            ? "border-accent bg-mint text-ink hover:border-moss"
                            : "border-line bg-white text-moss hover:bg-mint"
                      }`}
                    >
                      <Icon size={20} aria-hidden />
                      <span>{ui.mobileMenu[item.id]}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        ) : null}

        <section className="flex-1 pt-1 sm:pt-2 lg:pt-0">
          {!loaded || !profileLoaded ? (
            <div className="panel p-8">{ui.loading}</div>
          ) : (
            <>
              {tab === "transactions" ? (
                <PeriodSelector
                  period={period}
                  setPeriod={setPeriod}
                  periodLabel={periodLabel}
                  transactionCount={periodTransactions.length}
                  onExport={() => downloadTransactionsCsv(periodTransactions, period, language)}
                  ui={ui}
                />
              ) : null}
              {tab === "reports" ? (
                <PeriodSelector
                  period={period}
                  setPeriod={setPeriod}
                  periodLabel={periodLabel}
                  transactionCount={periodTransactions.length}
                  onExport={() => downloadTransactionsCsv(periodTransactions, period, language)}
                  ui={ui}
                />
              ) : null}
              {tab === "dashboard" && (
                <Dashboard
                  periodSummary={periodSummary}
                  balanceSummary={balanceSummary}
                  transactions={periodTransactions}
                  hasTransactions={transactions.length > 0}
                  hasSamples={transactions.some((transaction) => transaction.isSample)}
                  periodLabel={periodLabel}
                  onCreateTransaction={startNewTransaction}
                  onOpenSettings={() => navigateTo("settings")}
                  onOpenReports={() => navigateTo("reports")}
                  onAddSamples={addSampleTransactions}
                  onRemoveSamples={removeSampleTransactions}
                  onEditTransaction={startEditingTransaction}
                  onDeleteTransaction={deleteTransaction}
                  ui={ui}
                  language={language}
                  isPeriodFiltered={period.preset !== "all"}
                />
              )}
              {tab === "transactions" && (
                <TransactionsPageView
                  transactions={periodTransactions}
                  periodLabel={periodLabel}
                  onCreateTransaction={startNewTransaction}
                  onAddSamples={addSampleTransactions}
                  onEditTransaction={startEditingTransaction}
                  onDeleteTransaction={deleteTransaction}
                  ui={ui}
                  language={language}
                />
              )}
              {tab === "add" && (
                <AddTransaction
                  key={editingTransaction?.id ?? "new"}
                  onAdd={addTransaction}
                  onUpdate={saveEditedTransaction}
                  onCancelEdit={stopEditingTransaction}
                  onOpenTransactions={() => navigateTo("transactions")}
                  onOpenReports={() => navigateTo("reports")}
                  editingTransaction={editingTransaction}
                  businessProfile={businessProfile}
                  transactions={transactions}
                  ui={ui}
                  language={language}
                />
              )}
              {tab === "reports" && (
                <Reports
                  transactions={periodTransactions}
                  periodBalances={periodBalances}
                  balanceBalances={balanceBalances}
                  balanceSummary={balanceSummary}
                  periodLabel={periodLabel}
                  onCreateTransaction={startNewTransaction}
                  onAddSamples={addSampleTransactions}
                  ui={ui}
                  language={language}
                />
              )}
              {tab === "learn" && <Learning ui={ui} language={language} />}
              {tab === "settings" && (
                <Settings
                  profile={profile}
                  setProfile={setProfile}
                  hasSamples={transactions.some((transaction) => transaction.isSample)}
                  onAddSamples={addSampleTransactions}
                  onRemoveSamples={removeSampleTransactions}
                  onReset={confirmClearTransactions}
                  onExportBackup={exportBackup}
                  onImportBackup={() => backupInputRef.current?.click()}
                  backupMessage={backupMessage}
                  backupInputRef={backupInputRef}
                  onImportBackupChange={importBackup}
                  ui={ui}
                  language={language}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function PeriodSelector({
  period,
  setPeriod,
  periodLabel,
  transactionCount,
  onExport,
  ui
}: {
  period: PeriodState;
  setPeriod: (period: PeriodState) => void;
  periodLabel: string;
  transactionCount: number;
  onExport: () => void;
  ui: AppTranslations;
}) {
  return (
    <section className="panel no-print mb-5 p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-end">
        <div>
          <label className="label" htmlFor="period-preset">
            {ui.reports.periodShown}
          </label>
          <select
            id="period-preset"
            value={period.preset}
            onChange={(event) =>
              setPeriod({
                ...period,
                preset: event.target.value as PeriodPreset
              })
            }
            className="input mt-2"
          >
            {Object.entries(ui.periods)
              .filter(([value]) => !["start", "end"].includes(value))
              .map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {period.preset === "custom" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={ui.periods.start} id="period-start">
              <input
                id="period-start"
                type="date"
                value={period.startDate}
                onChange={(event) => setPeriod({ ...period, startDate: event.target.value })}
                className="input"
              />
            </Field>
            <Field label={ui.periods.end} id="period-end">
              <input
                id="period-end"
                type="date"
                value={period.endDate}
                onChange={(event) => setPeriod({ ...period, endDate: event.target.value })}
                className="input"
              />
            </Field>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-moss">
          {ui.reports.periodShown}: {periodLabel}
        </p>
        <button
          type="button"
          onClick={onExport}
          className="button-secondary w-full sm:w-auto"
        >
          <Download size={16} aria-hidden />
          {ui.actions.exportCsv} ({transactionCount})
        </button>
      </div>
    </section>
  );
}

function Dashboard({
  periodSummary,
  balanceSummary,
  transactions,
  hasTransactions,
  hasSamples,
  periodLabel,
  onCreateTransaction,
  onOpenSettings,
  onOpenReports,
  onAddSamples,
  onRemoveSamples,
  onEditTransaction,
  onDeleteTransaction,
  ui,
  language,
  isPeriodFiltered
}: {
  periodSummary: ReturnType<typeof calculateSummary>;
  balanceSummary: ReturnType<typeof calculateSummary>;
  transactions: Transaction[];
  hasTransactions: boolean;
  hasSamples: boolean;
  periodLabel: string;
  onCreateTransaction: () => void;
  onOpenSettings: () => void;
  onOpenReports: () => void;
  onAddSamples: () => void;
  onRemoveSamples: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  ui: AppTranslations;
  language: Language;
  isPeriodFiltered: boolean;
}) {
  const cards = [
    { label: ui.dashboard.cash, value: balanceSummary.cash, icon: Banknote, tone: "bg-moss text-white" },
    { label: ui.dashboard.revenue, value: periodSummary.revenue, icon: ArrowUpRight, tone: "bg-accent text-ink" },
    { label: ui.dashboard.expenses, value: periodSummary.expenses, icon: ArrowDownRight, tone: "bg-white text-clay" },
    { label: ui.dashboard.netIncome, value: periodSummary.netIncome, icon: Scale, tone: periodSummary.netIncome >= 0 ? "bg-accent text-ink" : "bg-white text-clay" },
    { label: ui.dashboard.liabilities, value: balanceSummary.liabilities, icon: Landmark, tone: "bg-white text-ink" },
    { label: ui.dashboard.equity, value: balanceSummary.equity, icon: Building2, tone: "bg-white text-ink" }
  ];
  const healthMessage =
    periodSummary.netIncome > 0
      ? ui.dashboard.healthPositive
      : periodSummary.netIncome === 0
        ? ui.dashboard.healthZero
        : ui.dashboard.healthNegative;
  const healthTone =
    periodSummary.netIncome > 0
      ? "border-accent bg-mint text-moss"
      : periodSummary.netIncome === 0
        ? "border-line bg-white text-moss"
        : "border-clay/30 bg-white text-clay";

  return (
    <div className="space-y-5">
      <Header
        title={ui.dashboard.title}
        subtitle={ui.dashboard.subtitle}
        eyebrow={ui.applicationMvp}
        action={
          <button
            type="button"
            onClick={onCreateTransaction}
            className="button-primary w-full sm:w-auto"
          >
            <Plus size={17} aria-hidden />
            {ui.actions.newTransaction}
          </button>
        }
      />

      <section className="panel overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={logoPath}
              alt="Ma Petite Compta"
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 rounded-md border border-line bg-white object-cover shadow-soft sm:h-14 sm:w-14"
              priority
            />
            <div className="min-w-0">
              <p className="label">{ui.appName}</p>
              <h2 className="text-lg font-bold leading-snug text-moss sm:text-xl">{ui.dashboard.tagline}</h2>
            </div>
          </div>
          <div className="grid gap-2 sm:min-w-48 sm:grid-cols-2">
            <button type="button" onClick={onCreateTransaction} className="button-primary px-3">
              <Plus size={17} aria-hidden />
              {ui.nav.add}
            </button>
            <button type="button" onClick={onOpenReports} className="button-secondary px-3">
              <FileBarChart2 size={17} aria-hidden />
              {ui.nav.reports}
            </button>
          </div>
        </div>
      </section>

      {isPeriodFiltered ? (
        <p className="panel p-4 text-sm font-semibold leading-6 text-moss">{ui.dashboard.filterClarification}</p>
      ) : null}

      {!hasTransactions ? (
        <Onboarding
          onOpenSettings={onOpenSettings}
          onCreateTransaction={onCreateTransaction}
          onOpenReports={onOpenReports}
          onAddSamples={onAddSamples}
          onRemoveSamples={onRemoveSamples}
          hasSamples={hasSamples}
          ui={ui}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="panel p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="label">{card.label}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line ${card.tone}`}>
                  <Icon size={20} aria-hidden />
                </div>
              </div>
              <p className="mt-5 text-2xl font-bold tracking-normal text-ink sm:text-3xl">{formatCurrency(card.value)}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="panel p-4 sm:p-5">
          <p className="label">{ui.dashboard.cash}</p>
          <h2 className="mt-1 text-lg font-bold text-ink">{ui.dashboard.cashVsProfit}</h2>
        </section>
        <section className={`rounded-md border p-4 sm:p-5 ${healthTone}`}>
          <p className="label">{ui.dashboard.netIncome}</p>
          <h2 className="mt-1 text-lg font-bold">{healthMessage}</h2>
        </section>
      </div>

      <section className="panel p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{ui.dashboard.recent}</h2>
            <p className="text-sm text-moss">
              {ui.reports.periodShown}: {periodLabel}
            </p>
          </div>
        </div>
        <TransactionList
          transactions={transactions.slice(0, 3)}
          emptyTitle={ui.emptyStates.dashboardTitle}
          emptyMessage={ui.emptyStates.dashboardText}
          emptyAction={
            <button type="button" onClick={onCreateTransaction} className="button-primary w-full sm:w-auto">
              <Plus size={16} aria-hidden />
              {ui.actions.newTransaction}
            </button>
          }
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          ui={ui}
          language={language}
        />
      </section>
    </div>
  );
}

function Onboarding({
  onOpenSettings,
  onCreateTransaction,
  onOpenReports,
  onAddSamples,
  onRemoveSamples,
  hasSamples,
  ui
}: {
  onOpenSettings: () => void;
  onCreateTransaction: () => void;
  onOpenReports: () => void;
  onAddSamples: () => void;
  onRemoveSamples: () => void;
  hasSamples: boolean;
  ui: AppTranslations;
}) {
  const steps = [
    {
      title: ui.onboarding.step1,
      text: ui.onboarding.step1Text,
      icon: BriefcaseBusiness,
      action: onOpenSettings,
      button: ui.chooseProfile
    },
    {
      title: ui.onboarding.step2,
      text: ui.onboarding.step2Text,
      icon: Plus,
      action: onCreateTransaction,
      button: ui.add.title
    },
    {
      title: ui.onboarding.step3,
      text: ui.onboarding.step3Text,
      icon: FileBarChart2,
      action: onOpenReports,
      button: ui.viewReports
    }
  ];

  return (
    <section className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label">{ui.onboarding.label}</p>
          <h2 className="mt-1 text-xl font-bold">{ui.onboarding.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">{ui.onboarding.text}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="soft-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-moss text-white">
                <Icon size={19} aria-hidden />
              </div>
              <h3 className="mt-3 text-base font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-moss">{step.text}</p>
              <button
                type="button"
                onClick={step.action}
                className="button-secondary mt-4 w-full px-3"
              >
                {step.button}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-line bg-mint p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-ink">{ui.onboarding.sampleTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-moss">
              {hasSamples ? ui.onboarding.sampleActive : ui.onboarding.sampleText}
            </p>
          </div>
          <div className="grid gap-2 sm:min-w-64 sm:grid-cols-2">
            <button type="button" onClick={onAddSamples} className="button-primary px-3">
              <Plus size={16} aria-hidden />
              {ui.actions.addSamples}
            </button>
            <button
              type="button"
              onClick={onRemoveSamples}
              disabled={!hasSamples}
              className="button-secondary px-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ui.actions.removeSamples}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransactionsPageView({
  transactions,
  periodLabel,
  onCreateTransaction,
  onAddSamples,
  onEditTransaction,
  onDeleteTransaction,
  ui,
  language
}: {
  transactions: Transaction[];
  periodLabel: string;
  onCreateTransaction: () => void;
  onAddSamples: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  ui: AppTranslations;
  language: Language;
}) {
  return (
    <div className="space-y-5">
      <Header
        title={ui.nav.transactions}
        subtitle={ui.dashboard.recent}
        eyebrow={ui.applicationMvp}
        action={
          <button type="button" onClick={onCreateTransaction} className="button-primary w-full sm:w-auto">
            <Plus size={17} aria-hidden />
            {ui.actions.newTransaction}
          </button>
        }
      />

      <section className="panel p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">{ui.dashboard.recent}</h2>
            <p className="text-sm font-semibold text-moss">
              {ui.reports.periodShown}: {periodLabel}
            </p>
          </div>
        </div>
        <TransactionList
          transactions={transactions}
          emptyTitle={ui.emptyStates.transactionsTitle}
          emptyMessage={ui.emptyStates.transactionsText}
          emptyAction={
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={onCreateTransaction} className="button-primary">
                <Plus size={16} aria-hidden />
                {ui.actions.newTransaction}
              </button>
              <button type="button" onClick={onAddSamples} className="button-secondary">
                {ui.actions.addSamples}
              </button>
            </div>
          }
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          ui={ui}
          language={language}
        />
      </section>
    </div>
  );
}

function getCategoryOptions(kind: TransactionKind, businessProfile: ReturnType<typeof getBusinessProfileDefinition>) {
  if (kind === "client-payment") {
    return businessProfile.revenues;
  }

  if (["cash-expense", "equipment-purchase", "supplies-credit", "supplier-payment"].includes(kind)) {
    return businessProfile.expenses;
  }

  return [];
}

function AddTransaction({
  onAdd,
  onUpdate,
  onCancelEdit,
  onOpenTransactions,
  onOpenReports,
  editingTransaction,
  businessProfile,
  transactions,
  ui,
  language
}: {
  onAdd: (transaction: Transaction) => void;
  onUpdate: (transaction: Transaction) => void;
  onCancelEdit: () => void;
  onOpenTransactions: () => void;
  onOpenReports: () => void;
  editingTransaction: Transaction | null;
  businessProfile: ReturnType<typeof getBusinessProfileDefinition>;
  transactions: Transaction[];
  ui: AppTranslations;
  language: Language;
}) {
  const isEditing = Boolean(editingTransaction);
  const [kind, setKind] = useState<TransactionKind>(editingTransaction?.kind ?? "client-payment");
  const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : "");
  const [label, setLabel] = useState(editingTransaction?.label ?? "");
  const [date, setDate] = useState(editingTransaction?.date ?? formatLocalDateInput());
  const categoryOptions = useMemo(() => getCategoryOptions(kind, businessProfile), [kind, businessProfile]);
  const [category, setCategory] = useState(editingTransaction?.category ?? categoryOptions[0] ?? "");
  const categoryChoices = category && !categoryOptions.includes(category) ? [category, ...categoryOptions] : categoryOptions;
  const selectedCategory = categoryChoices.includes(category) ? category : categoryChoices[0] ?? "";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editingTransaction?.paymentMethod ?? "Virement");
  const [partyName, setPartyName] = useState(editingTransaction?.partyName ?? "");
  const [note, setNote] = useState(editingTransaction?.note ?? "");
  const [lastSavedTransaction, setLastSavedTransaction] = useState<Transaction | null>(null);
  const baseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.id !== editingTransaction?.id),
    [transactions, editingTransaction?.id]
  );
  const preview = useMemo(
    () =>
      createTransaction({
        kind,
        amount: Number(amount) || 0,
        label: label.trim() || ui.add.descriptionPlaceholder,
        date,
        category: selectedCategory,
        paymentMethod,
        partyName,
        note
      }),
    [kind, amount, label, ui.add.descriptionPlaceholder, date, selectedCategory, paymentMethod, partyName, note]
  );
  const currentCashBalance = useMemo(() => getAccountBalance(baseTransactions, cashAccountName), [baseTransactions]);
  const currentAccountsPayableBalance = useMemo(() => getAccountBalance(baseTransactions, accountsPayableName), [baseTransactions]);
  const previewCashMovement = preview.generated.journal
    .filter((line) => line.account === cashAccountName)
    .reduce((total, line) => total + line.debit - line.credit, 0);
  const projectedCashBalance = currentCashBalance + previewCashMovement;
  const showNegativeCashWarning = projectedCashBalance < 0;
  const showSupplierOverpaymentWarning = kind === "supplier-payment" && (Number(amount) || 0) > currentAccountsPayableBalance;
  const selectedTypeHelper = transactionTypeHelpers[kind][language];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;
    const nextTransaction = createTransaction({
      kind,
      amount: numericAmount,
      label,
      date,
      category: selectedCategory,
      paymentMethod,
      partyName,
      note,
      isSample: editingTransaction?.isSample
    });

    if (editingTransaction) {
      onUpdate({
        ...nextTransaction,
        id: editingTransaction.id
      });
      return;
    }

    onAdd(nextTransaction);
    setLastSavedTransaction(nextTransaction);
    setLabel("");
    setAmount("");
    setCategory("");
    setPartyName("");
    setNote("");
  };

  return (
    <div className="space-y-5">
      <Header
        title={isEditing ? ui.add.editTitle : ui.add.title}
        subtitle={ui.add.subtitle}
        eyebrow={ui.applicationMvp}
        action={
          isEditing ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="button-secondary w-full sm:w-auto"
            >
              {ui.actions.cancel}
            </button>
          ) : undefined
        }
      />
      {lastSavedTransaction ? (
        <section className="panel border-accent bg-mint p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="label">{ui.add.savedTitle}</p>
              <h2 className="mt-1 text-lg font-bold text-ink">{lastSavedTransaction.label}</h2>
              <p className="mt-2 text-sm leading-6 text-moss">{getDisplayedExplanation(lastSavedTransaction, language)}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[30rem]">
              <button type="button" onClick={() => setLastSavedTransaction(null)} className="button-primary">
                <Plus size={16} aria-hidden />
                {ui.actions.newTransaction}
              </button>
              <button type="button" onClick={onOpenTransactions} className="button-secondary">
                <ReceiptText size={16} aria-hidden />
                {ui.nav.transactions}
              </button>
              <button type="button" onClick={onOpenReports} className="button-secondary">
                <FileBarChart2 size={16} aria-hidden />
                {ui.nav.reports}
              </button>
            </div>
          </div>
        </section>
      ) : null}
      <div>
        <form onSubmit={submit} className={`panel space-y-5 p-4 sm:p-5 ${isEditing ? "border-accent ring-2 ring-accent/15" : ""}`}>
          {isEditing ? (
            <div className="rounded-md border border-line bg-mint px-3 py-2 text-sm font-semibold text-moss">{ui.add.editMode}</div>
          ) : null}
          {showSupplierOverpaymentWarning || showNegativeCashWarning ? (
            <div className="space-y-2">
              {showSupplierOverpaymentWarning ? (
                <WarningMessage text={ui.warnings.supplierOverpayment} />
              ) : null}
              {showNegativeCashWarning ? <WarningMessage text={ui.warnings.negativeCash} /> : null}
            </div>
          ) : null}
          <FormSection title={ui.add.mainInfo} description={ui.add.detailsHint}>
            <div>
              <label className="label" htmlFor="kind">
                {ui.add.type}
              </label>
              <select
                id="kind"
                value={kind}
                onChange={(event) => {
                  const nextKind = event.target.value as TransactionKind;
                  setKind(nextKind);
                  setCategory(getCategoryOptions(nextKind, businessProfile)[0] ?? "");
                  setLastSavedTransaction(null);
                }}
                className="input mt-2"
              >
                {transactionTemplates.map((template) => (
                  <option key={template.kind} value={template.kind}>
                    {transactionKindLabels[template.kind][language]}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm leading-6 text-moss">{selectedTypeHelper}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={ui.add.date} id="date">
                <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input" required />
              </Field>
              <Field label={ui.add.amount} id="amount">
                <input id="amount" type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="input" placeholder={ui.add.amountPlaceholder} required />
              </Field>
            </div>
            <Field label={ui.add.description} id="label">
              <input id="label" value={label} onChange={(event) => setLabel(event.target.value)} className="input" placeholder={ui.add.descriptionPlaceholder} required />
            </Field>
            <div className="rounded-md border border-line bg-mint p-3">
              <p className="label">{ui.add.examplesTitle}</p>
              <p className="mt-1 text-sm leading-6 text-moss">{ui.add.examplesHint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {businessProfile.examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setLabel(translateExampleText(example, language))}
                    className="rounded-md border border-line bg-white px-3 py-2 text-left text-sm font-semibold text-moss transition hover:border-accent hover:bg-white"
                  >
                    {translateExampleText(example, language)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="category">
                {ui.add.category}
              </label>
              {categoryOptions.length ? (
                <>
                  <select id="category" value={selectedCategory} onChange={(event) => setCategory(event.target.value)} className="input mt-2">
                    {categoryChoices.map((option) => (
                      <option key={option} value={option}>
                        {translateCategoryName(option, language)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-moss">
                    {ui.add.categorySuggestion}: {translateBusinessProfileName(businessProfile.profile, language)}.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-moss">{ui.add.categoryUnavailable}</p>
              )}
            </div>
          </FormSection>

          <FormSection title={ui.add.paymentDetails}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={ui.add.payment} id="payment-method">
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                  className="input"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {translatePaymentMethod(method, language)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={ui.add.party} id="party-name">
                <input
                  id="party-name"
                  value={partyName}
                  onChange={(event) => setPartyName(event.target.value)}
                  className="input"
                  placeholder={ui.add.partyPlaceholder}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title={ui.add.notesSection}>
            <Field label={ui.add.note} id="note">
              <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} className="input min-h-24 resize-y" placeholder={ui.add.notePlaceholder} />
            </Field>
          </FormSection>

          <button type="submit" className="button-primary w-full">
            <CheckCircle2 size={17} aria-hidden />
            {isEditing ? ui.actions.saveChanges : ui.actions.saveTransaction}
          </button>
        </form>

          <details className="mt-4 rounded-md border border-line bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold text-moss">{ui.add.viewExplanation}</summary>
            <p className="mt-2 text-sm leading-6 text-moss">{ui.add.explanationHint}</p>
            <div className="mt-4">
              <AccountingExplanation transaction={preview} ui={ui} language={language} compact />
            </div>
          </details>
      </div>
    </div>
  );
}

function Reports({
  transactions,
  periodBalances,
  balanceBalances,
  balanceSummary,
  periodLabel,
  onCreateTransaction,
  onAddSamples,
  ui,
  language
}: {
  transactions: Transaction[];
  periodBalances: ReturnType<typeof calculateAccountBalances>;
  balanceBalances: ReturnType<typeof calculateAccountBalances>;
  balanceSummary: ReturnType<typeof calculateSummary>;
  periodLabel: string;
  onCreateTransaction: () => void;
  onAddSamples: () => void;
  ui: AppTranslations;
  language: Language;
}) {
  const revenue = sum(periodBalances.filter((line) => line.accountType === "revenu").map((line) => line.balance));
  const expenses = sum(periodBalances.filter((line) => line.accountType === "dépense").map((line) => line.balance));
  const assets = balanceBalances.filter((line) => line.accountType === "actif");
  const liabilities = balanceBalances.filter((line) => line.accountType === "passif");
  const equity = balanceBalances.filter((line) => line.accountType === "capitaux propres");
  const totalDebits = sum(periodBalances.map((line) => line.debit));
  const totalCredits = sum(periodBalances.map((line) => line.credit));
  const trialBalanceBalanced = totalDebits === totalCredits;

  return (
    <div className="print-report-area space-y-5">
      <div className="print-only">
        <h1>Ma Petite Compta</h1>
        <p>{ui.reports.accountingReports}</p>
        <p>
          {ui.reports.periodShown}: {periodLabel}
        </p>
      </div>
      <Header
        title={ui.reports.title}
        subtitle={ui.reports.subtitle}
        eyebrow={ui.applicationMvp}
        action={
          <button
            type="button"
            onClick={() => window.print()}
            className="button-primary no-print w-full sm:w-auto"
          >
            <Printer size={17} aria-hidden />
            {ui.actions.printReports}
          </button>
        }
      />
      <p className="panel p-4 text-sm font-semibold text-moss">
        {ui.reports.periodShown}: {periodLabel}
      </p>
      <p className="panel p-4 text-sm font-semibold leading-6 text-moss">{ui.reports.cashProfitDifference}</p>
      {!transactions.length ? (
        <EmptyState
          title={ui.emptyStates.reportsTitle}
          text={ui.emptyStates.reportsText}
          action={
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={onCreateTransaction} className="button-primary">
                <Plus size={16} aria-hidden />
                {ui.actions.newTransaction}
              </button>
              <button type="button" onClick={onAddSamples} className="button-secondary">
                {ui.actions.addSamples}
              </button>
            </div>
          }
        />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel p-4 sm:p-5">
          <ReportTitle title={ui.reports.income} />
          <ReportSummary text={ui.reports.incomeSummary} />
          <ReportLine label={ui.reports.revenue} value={revenue} />
          <ReportLine label={ui.reports.expenses} value={expenses} />
          <ReportLine label={ui.reports.netIncome} value={revenue - expenses} strong />
        </section>

        <section className="panel p-4 sm:p-5">
          <ReportTitle title={ui.reports.balance} />
          <ReportSummary text={ui.reports.balanceSummary} />
          <ReportGroup title={ui.accountTypes.actif} lines={assets} ui={ui} language={language} />
          <ReportLine label={ui.reports.totalAssets} value={balanceSummary.assets} strong />
          <ReportGroup title={ui.accountTypes.passif} lines={liabilities} ui={ui} language={language} />
          <ReportLine label={ui.reports.totalLiabilities} value={balanceSummary.liabilities} strong />
          <ReportGroup title={ui.accountTypes["capitaux propres"]} lines={equity} ui={ui} language={language} />
          <ReportLine label={ui.reports.retainedEarnings} value={balanceSummary.retainedEarnings} />
          <ReportLine label={ui.reports.totalEquity} value={balanceSummary.equity} strong />
          <ReportLine label={ui.reports.liabilitiesPlusEquity} value={balanceSummary.liabilities + balanceSummary.equity} strong />
        </section>
      </div>

      <section className="panel overflow-hidden p-4 sm:p-5">
        <ReportTitle title={ui.reports.trial} />
        <ReportSummary text={ui.reports.trialSummary} />
        <div className="max-w-full overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
            <thead className="border-b border-line text-xs uppercase text-moss">
              <tr>
                <th className="py-3 pl-3 pr-3">{ui.reports.account}</th>
                <th className="py-3 pr-3">{ui.reports.type}</th>
                <th className="py-3 pr-3">{ui.reports.normalBalance}</th>
                <th className="py-3 pr-3 text-right">{ui.sides.debit}</th>
                <th className="py-3 pr-3 text-right">{ui.sides.credit}</th>
              </tr>
            </thead>
            <tbody>
              {periodBalances.length ? (
                periodBalances.map((line) => (
                  <tr key={line.account} className="border-b border-line">
                    <td className="py-3 pl-3 pr-3 font-semibold">{translateAccountName(line.account, language)}</td>
                    <td className="py-3 pr-3">{ui.accountTypes[line.accountType]}</td>
                    <td className="py-3 pr-3">
                      {accountNormalSide[line.accountType] === "debit" ? ui.reports.debitBalance : ui.reports.creditBalance}:{" "}
                      {formatCurrency(line.balance)}
                    </td>
                    <td className="py-3 pr-3 text-right">{formatCurrency(line.debit)}</td>
                    <td className="py-3 pr-3 text-right">{formatCurrency(line.credit)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-sm text-moss">
                    {ui.empty}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="font-bold">
              <tr>
                <td className="py-3 pl-3 pr-3" colSpan={3}>
                  {ui.reports.totals}
                </td>
                <td className="py-3 pr-3 text-right">{formatCurrency(totalDebits)}</td>
                <td className="py-3 pr-3 text-right">{formatCurrency(totalCredits)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className={`mt-3 text-sm font-semibold ${trialBalanceBalanced ? "text-moss" : "text-clay"}`}>
          {trialBalanceBalanced ? ui.reports.balanced : ui.reports.unbalanced}: {ui.reports.totalDebits}{" "}
          {formatCurrency(totalDebits)} / {ui.reports.totalCredits} {formatCurrency(totalCredits)} ({transactions.length} transaction(s)).
        </p>
      </section>
    </div>
  );
}

function Learning({ ui, language }: { ui: AppTranslations; language: Language }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const questions = language === "fr" ? quizQuestions : englishQuizQuestions;
  const question = questions[questionIndex % questions.length];
  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const successRate = answeredQuestions ? Math.round((correctAnswers / answeredQuestions) * 100) : 0;

  const answerQuestion = (answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
    setAnsweredQuestions((current) => current + 1);
    if (answer === question.correctAnswer) {
      setCorrectAnswers((current) => current + 1);
    }
  };

  const nextQuestion = () => {
    setQuestionIndex((current) => (current + 1) % questions.length);
    setSelectedAnswer(null);
  };

  const restartQuiz = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setAnsweredQuestions(0);
  };

  return (
    <div className="space-y-5">
      <Header title={ui.learn.title} subtitle={ui.learn.subtitle} eyebrow={ui.applicationMvp} />
      <EmptyState title={ui.emptyStates.learnTitle} text={ui.emptyStates.learnText} />
      <div className="grid gap-3 md:grid-cols-2">
        {lessons.map((lesson) => {
          const Icon = lesson.icon;
          const lessonContent =
            language === "fr"
              ? { title: lesson.title.replace(/\s*\(.+\)$/, ""), text: lesson.text }
              : (englishLessons[lesson.title] ?? { title: lesson.title, text: lesson.text });
          return (
            <article key={lesson.title} className="panel p-4 transition hover:border-accent sm:p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-moss text-white">
                  <Icon size={19} aria-hidden />
                </div>
                <h2 className="text-base font-bold">{lessonContent.title}</h2>
              </div>
              <p className="text-sm leading-6 text-moss">{lessonContent.text}</p>
            </article>
          );
        })}
      </div>

      <section className="panel p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="label">{ui.learn.quiz}</p>
            <h2 className="mt-1 text-xl font-bold">{ui.learn.practice}</h2>
            <p className="mt-2 text-sm text-moss">
              {ui.learn.question} {(questionIndex % questions.length) + 1} {ui.learn.of} {questions.length} · {question.type}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
            <ScoreItem label={ui.learn.score} value={correctAnswers} />
            <ScoreItem label={ui.learn.answered} value={answeredQuestions} />
            <ScoreItem label={ui.learn.success} value={`${successRate}%`} />
          </div>
        </div>

        <div className="py-5">
          <h3 className="text-lg font-bold leading-7">{question.prompt}</h3>
          <div className="mt-4 grid gap-3">
            {question.choices.map((choice) => {
              const choiceIsCorrect = choice === question.correctAnswer;
              const choiceIsSelected = choice === selectedAnswer;
              const answerClass = hasAnswered
                ? choiceIsCorrect
                  ? "border-accent bg-mint text-ink"
                  : choiceIsSelected
                    ? "border-clay bg-white text-clay"
                    : "border-line bg-white text-moss"
                : "border-line bg-white text-ink hover:border-accent hover:bg-mint";

              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => answerQuestion(choice)}
                  disabled={hasAnswered}
                className={`min-h-12 border px-4 py-3 text-left text-sm font-semibold transition sm:min-h-14 ${answerClass}`}
                style={{ borderRadius: 6 }}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        {hasAnswered ? (
          <div className={`flex gap-3 border p-4 ${isCorrect ? "border-accent bg-mint" : "border-clay bg-white"}`} style={{ borderRadius: 8 }}>
            <CheckCircle2 className={isCorrect ? "mt-0.5 shrink-0 text-accent" : "mt-0.5 shrink-0 text-clay"} size={20} aria-hidden />
            <div>
              <p className={`font-bold ${isCorrect ? "text-ink" : "text-clay"}`}>
                {isCorrect ? ui.learn.correct : `${ui.learn.incorrect}: ${question.correctAnswer}`}
              </p>
              <p className="mt-2 text-sm leading-6 text-moss">{question.explanation}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={restartQuiz}
            className="button-secondary"
          >
            {ui.actions.restartQuiz}
          </button>
          <button
            type="button"
            onClick={nextQuestion}
            disabled={!hasAnswered}
            className="button-primary"
          >
            {ui.actions.nextQuestion}
          </button>
        </div>
      </section>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-20 border border-line bg-white px-2 py-3" style={{ borderRadius: 6 }}>
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-[10px] font-semibold uppercase leading-4 text-moss">{label}</p>
    </div>
  );
}

function BusinessProfileView({
  profile,
  setProfile,
  ui,
  language,
  showHeader = true
}: {
  profile: BusinessProfile;
  setProfile: (profile: BusinessProfile) => void;
  ui: AppTranslations;
  language: Language;
  showHeader?: boolean;
}) {
  const selectedProfile = getBusinessProfileDefinition(profile);

  return (
    <div className="space-y-5">
      {showHeader ? (
        <Header
          title={ui.profile.title}
          subtitle={ui.profile.subtitle}
          eyebrow={ui.applicationMvp}
        />
      ) : null}

      <section className="panel p-4">
        <label className="label" htmlFor="business-profile">
          {ui.profile.type}
        </label>
        <select
          id="business-profile"
          value={profile}
          onChange={(event) => setProfile(event.target.value as BusinessProfile)}
          className="input mt-2 max-w-xl"
        >
          {businessProfiles.map((definition) => (
            <option key={definition.profile} value={definition.profile}>
              {translateBusinessProfileName(definition.profile, language)}
            </option>
          ))}
        </select>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <CategoryPanel title={ui.profile.revenues} categories={selectedProfile.revenues} language={language} />
        <CategoryPanel title={ui.profile.expenses} categories={selectedProfile.expenses} language={language} />
      </div>
      <CategoryPanel title={ui.add.examplesTitle} categories={selectedProfile.examples} language={language} translateItem={translateExampleText} />
    </div>
  );
}

function Settings({
  profile,
  setProfile,
  hasSamples,
  onAddSamples,
  onRemoveSamples,
  onReset,
  onExportBackup,
  onImportBackup,
  backupMessage,
  backupInputRef,
  onImportBackupChange,
  ui,
  language
}: {
  profile: BusinessProfile;
  setProfile: (profile: BusinessProfile) => void;
  hasSamples: boolean;
  onAddSamples: () => void;
  onRemoveSamples: () => void;
  onReset: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  backupMessage: { type: "success" | "error"; text: string } | null;
  backupInputRef: RefObject<HTMLInputElement | null>;
  onImportBackupChange: (event: ChangeEvent<HTMLInputElement>) => void;
  ui: AppTranslations;
  language: Language;
}) {
  return (
    <div className="space-y-5">
      <Header
        title={ui.nav.settings}
        subtitle={ui.localStorage}
        eyebrow={ui.applicationMvp}
      />

      <BusinessProfileView profile={profile} setProfile={setProfile} ui={ui} language={language} showHeader={false} />

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel p-4 sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-moss text-white">
            <Upload size={18} aria-hidden />
          </div>
          <h2 className="mt-3 text-lg font-bold">{ui.storage}</h2>
          <p className="mt-2 text-sm leading-6 text-moss">{ui.localStorage}</p>
          {backupMessage ? (
            <p className={`mt-3 rounded-md border px-3 py-2 text-sm font-semibold ${backupMessage.type === "success" ? "border-accent bg-mint text-moss" : "border-clay/30 bg-white text-clay"}`}>
              {backupMessage.text}
            </p>
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={onExportBackup} className="button-secondary">
              <Download size={16} aria-hidden />
              {ui.actions.exportBackup}
            </button>
            <button type="button" onClick={onImportBackup} className="button-secondary">
              <Upload size={16} aria-hidden />
              {ui.actions.importBackup}
            </button>
          </div>
          <input
            ref={backupInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onImportBackupChange}
            className="hidden"
          />
        </article>

        <article className="panel p-4 sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-ink">
            <ReceiptText size={18} aria-hidden />
          </div>
          <h2 className="mt-3 text-lg font-bold">{ui.sampleDataTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-moss">{ui.sampleDataText}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={onAddSamples} className="button-primary">
              <Plus size={16} aria-hidden />
              {ui.actions.addSamples}
            </button>
            <button type="button" onClick={onRemoveSamples} disabled={!hasSamples} className="button-secondary disabled:cursor-not-allowed disabled:opacity-50">
              {ui.actions.removeSamples}
            </button>
          </div>
        </article>
      </section>

      <section className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">{ui.actions.reset}</h2>
            <p className="mt-2 text-sm leading-6 text-moss">{ui.confirmations.clearAll}</p>
          </div>
          <button type="button" onClick={onReset} className="button-danger w-full sm:w-auto">
            <RotateCcw size={16} aria-hidden />
            {ui.actions.reset}
          </button>
        </div>
      </section>
    </div>
  );
}

function CategoryPanel({
  title,
  categories,
  language,
  translateItem = translateCategoryName
}: {
  title: string;
  categories: string[];
  language: Language;
  translateItem?: (value: string, language: Language) => string;
}) {
  return (
    <section className="panel p-4 sm:p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span key={category} className="border border-line bg-mint px-3 py-2 text-sm font-semibold text-moss" style={{ borderRadius: 6 }}>
            {translateItem(category, language)}
          </span>
        ))}
      </div>
    </section>
  );
}

function Header({
  title,
  subtitle,
  action,
  eyebrow
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  eyebrow: string;
}) {
  return (
    <header className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="label">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold text-moss sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">{subtitle}</p>
      </div>
      {action ? <div className="w-full sm:w-auto">{action}</div> : null}
    </header>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function WarningMessage({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-clay/30 bg-white px-3 py-2 text-sm font-semibold leading-6 text-clay">{text}</p>
  );
}

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-b border-line pb-5 last:border-b-0 last:pb-0">
      <div>
        <h3 className="text-sm font-bold uppercase text-moss">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-6 text-moss">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="soft-card text-center">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-moss">{text}</p>
      {action ? <div className="mx-auto mt-4 max-w-md">{action}</div> : null}
    </div>
  );
}

function TransactionList({
  transactions,
  emptyTitle,
  emptyMessage,
  emptyAction,
  onEditTransaction,
  onDeleteTransaction,
  ui,
  language
}: {
  transactions: Transaction[];
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  ui: AppTranslations;
  language: Language;
}) {
  if (!transactions.length) {
    return <EmptyState title={emptyTitle ?? ui.empty} text={emptyMessage ?? ui.emptyHelp} action={emptyAction} />;
  }

  const confirmDelete = (transaction: Transaction) => {
    const confirmed = window.confirm(`${ui.confirmations.deleteOne} "${transaction.label}" ? ${ui.confirmations.irreversible}`);

    if (confirmed) {
      onDeleteTransaction(transaction.id);
    }
  };

  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => (
        <article key={transaction.id} className="soft-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{transaction.label}</p>
                {transaction.isSample ? (
                  <span className="border border-accent/40 bg-mint px-2 py-1 text-[10px] font-bold uppercase text-moss" style={{ borderRadius: 6 }}>
                    {ui.sampleBadge}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-moss">
                {formatDisplayDate(transaction.date, language)} - {transactionKindLabels[transaction.kind][language]}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-moss">
                {transaction.category ? (
                  <span className="border border-line bg-mint px-2 py-1" style={{ borderRadius: 6 }}>
                    {ui.transactionDetails.category}: {translateCategoryName(transaction.category, language)}
                  </span>
                ) : null}
                <span className="border border-line bg-white px-2 py-1" style={{ borderRadius: 6 }}>
                  {ui.transactionDetails.payment}: {translatePaymentMethod(transaction.paymentMethod, language)}
                </span>
                {transaction.partyName ? (
                  <span className="border border-line bg-white px-2 py-1" style={{ borderRadius: 6 }}>
                    {ui.transactionDetails.party}: {transaction.partyName}
                  </span>
                ) : null}
              </div>
              {transaction.note ? (
                <p className="mt-2 text-sm leading-6 text-moss">
                  {ui.transactionDetails.note}: {transaction.note}
                </p>
              ) : null}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
              <p className="text-xl font-bold text-ink">{formatCurrency(transaction.amount)}</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={() => onEditTransaction(transaction)}
                  className="button-secondary min-h-10 px-3"
                >
                  {ui.actions.edit}
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(transaction)}
                  className="button-danger min-h-10 px-3"
                >
                  {ui.actions.delete}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-moss">{getDisplayedExplanation(transaction, language)}</p>
        </article>
      ))}
    </div>
  );
}

function AccountingExplanation({
  transaction,
  ui,
  language,
  compact = false
}: {
  transaction: Transaction;
  ui: AppTranslations;
  language: Language;
  compact?: boolean;
}) {
  const debitTotal = sum(transaction.generated.journal.map((line) => line.debit));
  const creditTotal = sum(transaction.generated.journal.map((line) => line.credit));

  return (
    <section className={`panel space-y-4 p-4 sm:p-5 ${compact ? "bg-white" : ""}`}>
      <div>
        <p className="label">{ui.transactionDetails.explanation}</p>
        <h2 className="mt-1 text-xl font-bold">{ui.transactionDetails.changed}</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-moss">
          {transaction.category ? (
            <span className="border border-line bg-mint px-2 py-1" style={{ borderRadius: 6 }}>
              {ui.transactionDetails.category}: {translateCategoryName(transaction.category, language)}
            </span>
          ) : null}
          <span className="border border-line bg-white px-2 py-1" style={{ borderRadius: 6 }}>
            {ui.transactionDetails.payment}: {translatePaymentMethod(transaction.paymentMethod, language)}
          </span>
          {transaction.partyName ? (
            <span className="border border-line bg-white px-2 py-1" style={{ borderRadius: 6 }}>
              {ui.transactionDetails.party}: {transaction.partyName}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-moss">{getDisplayedExplanation(transaction, language)}</p>
      </div>

      <div>
        <h3 className="mb-2 font-bold">{ui.transactionDetails.affectedAccounts}</h3>
        <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
          {transaction.generated.affectedAccounts.map((account) => (
            <div key={`${account.name}-${account.movement}`} className="soft-card">
              <p className="font-semibold">{translateAccountName(account.name, language)}</p>
              <p className="text-sm text-moss">{ui.accountTypes[account.type]}</p>
              <p className="text-sm text-moss">
                {account.movement.includes("Débit") ? ui.sides.debit : ui.sides.credit}
              </p>
            </div>
          ))}
        </div>
      </div>

      <JournalTable journal={transaction.generated.journal} ui={ui} language={language} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="soft-card">
          <p className="label">{ui.transactionDetails.verification}</p>
          <p className="mt-1 font-bold">
            {formatCurrency(debitTotal)} = {formatCurrency(creditTotal)}
          </p>
          <p className="text-sm text-moss">
            {transaction.generated.debitsEqualCredits ? ui.transactionDetails.equal : ui.transactionDetails.notEqual}
          </p>
        </div>
        <div className="soft-card">
          <p className="label">{ui.transactionDetails.statements}</p>
          <p className="mt-1 text-sm leading-6 text-moss">
            {transaction.generated.affectedStatements.map((statement) => translateStatementName(statement, language)).join(", ")}
          </p>
        </div>
      </div>
    </section>
  );
}

function JournalTable({
  journal,
  ui,
  language
}: {
  journal: { account: string; accountType: AccountType; debit: number; credit: number }[];
  ui: AppTranslations;
  language: Language;
}) {
  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-line">
      <table className="w-full min-w-[520px] text-left text-xs sm:text-sm">
        <thead className="border-b border-line text-xs uppercase text-moss">
          <tr>
            <th className="py-3 pl-3 pr-3">{ui.reports.account}</th>
            <th className="py-3 pr-3">{ui.reports.type}</th>
            <th className="py-3 pr-3 text-right">{ui.sides.debit}</th>
            <th className="py-3 pr-3 text-right">{ui.sides.credit}</th>
          </tr>
        </thead>
        <tbody>
          {journal.map((line) => (
            <tr key={`${line.account}-${line.debit}-${line.credit}`} className="border-b border-line">
              <td className="py-3 pl-3 pr-3 font-semibold">{translateAccountName(line.account, language)}</td>
              <td className="py-3 pr-3">{ui.accountTypes[line.accountType]}</td>
              <td className="py-3 pr-3 text-right">{line.debit ? formatCurrency(line.debit) : "-"}</td>
              <td className="py-3 pr-3 text-right">{line.credit ? formatCurrency(line.credit) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportTitle({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}

function ReportSummary({ text }: { text: string }) {
  return <p className="mb-4 rounded-md border border-line bg-mint px-3 py-2 text-sm leading-6 text-moss">{text}</p>;
}

function ReportGroup({
  title,
  lines,
  ui,
  language
}: {
  title: string;
  lines: ReturnType<typeof calculateAccountBalances>;
  ui: AppTranslations;
  language: Language;
}) {
  return (
    <div className="mb-3">
      <p className="label mb-2">{title}</p>
      {lines.length ? (
        lines.map((line) => <ReportLine key={line.account} label={translateAccountName(line.account, language)} value={line.balance} />)
      ) : (
        <p className="text-sm text-moss">{ui.reports.noAccount}</p>
      )}
    </div>
  );
}

function ReportLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-line py-3 ${strong ? "font-bold text-ink" : "text-sm text-moss"}`}>
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 text-right">{formatCurrency(value)}</span>
    </div>
  );
}
