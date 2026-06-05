"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeEuro,
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
  PiggyBank,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Scale,
  ShieldCheck,
  Upload,
  WalletCards
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import {
  AccountType,
  accountNormalSide,
  accountTypeLabels,
  calculateAccountBalances,
  calculateSummary,
  createTransaction,
  formatCurrency,
  formatFrenchDate,
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
import { useBusinessProfile } from "@/lib/useBusinessProfile";
import { useTransactions } from "@/lib/useTransactions";

type Tab = "dashboard" | "add" | "reports" | "learn" | "profile";
type PeriodPreset = "all" | "current-month" | "last-month" | "current-year" | "custom";

type PeriodState = {
  preset: PeriodPreset;
  startDate: string;
  endDate: string;
};

type QuizQuestion = {
  type: "Type de compte" | "Débit ou crédit" | "Analyse de transaction";
  prompt: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
};

const navigation = [
  { id: "dashboard" as Tab, label: "Tableau de bord", icon: LayoutDashboard },
  { id: "add" as Tab, label: "Ajouter", icon: Plus },
  { id: "reports" as Tab, label: "Rapports", icon: FileBarChart2 },
  { id: "learn" as Tab, label: "Apprentissage", icon: GraduationCap },
  { id: "profile" as Tab, label: "Profil d'entreprise", icon: BriefcaseBusiness }
];

const periodLabels: Record<PeriodPreset, string> = {
  all: "Toutes les transactions",
  "current-month": "Ce mois-ci",
  "last-month": "Mois dernier",
  "current-year": "Cette année",
  custom: "Période personnalisée"
};

const lessons = [
  {
    title: "Actifs (Assets)",
    icon: WalletCards,
    text: "Les actifs sont ce que l'entreprise possède ou contrôle: argent, équipement, fournitures ou montants à recevoir."
  },
  {
    title: "Passifs (Liabilities)",
    icon: CreditCard,
    text: "Les passifs sont les dettes: fournisseurs à payer, emprunts bancaires ou obligations futures."
  },
  {
    title: "Capitaux propres (Equity)",
    icon: PiggyBank,
    text: "Les capitaux propres représentent la part du propriétaire: apports, bénéfices conservés et retraits."
  },
  {
    title: "Revenus (Revenue)",
    icon: ArrowUpRight,
    text: "Les revenus viennent des ventes ou services. Ils augmentent le bénéfice et donc les capitaux propres."
  },
  {
    title: "Dépenses (Expenses)",
    icon: ArrowDownRight,
    text: "Les dépenses sont les coûts nécessaires pour gagner des revenus. Elles diminuent le bénéfice."
  },
  {
    title: "Débit et crédit (Debit and Credit)",
    icon: Scale,
    text: "Chaque transaction a au moins un débit et un crédit. Les actifs et dépenses augmentent au débit; les passifs, revenus et capitaux propres augmentent au crédit."
  },
  {
    title: "Écritures de journal (Journal Entries)",
    icon: ReceiptText,
    text: "Une écriture de journal décrit quels comptes changent, avec les montants au débit et au crédit."
  },
  {
    title: "Comptes en T (T-Accounts)",
    icon: ClipboardList,
    text: "Un compte en T sépare les débits à gauche et les crédits à droite pour visualiser le solde d'un compte."
  },
  {
    title: "Balance de vérification (Trial Balance)",
    icon: ShieldCheck,
    text: "La balance de vérification liste tous les comptes. Le total des débits doit égaler le total des crédits."
  },
  {
    title: "États financiers (Financial Statements)",
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

const getPeriodLabel = (period: PeriodState) => {
  const range = getPeriodRange(period);

  if (period.preset === "custom") {
    if (range.startDate && range.endDate) {
      return `${periodLabels.custom} : du ${formatFrenchDate(range.startDate)} au ${formatFrenchDate(range.endDate)}`;
    }

    if (range.startDate) {
      return `${periodLabels.custom} : depuis le ${formatFrenchDate(range.startDate)}`;
    }

    if (range.endDate) {
      return `${periodLabels.custom} : jusqu'au ${formatFrenchDate(range.endDate)}`;
    }
  }

  if (period.preset !== "all" && range.startDate && range.endDate) {
    return `${periodLabels[period.preset]} : du ${formatFrenchDate(range.startDate)} au ${formatFrenchDate(range.endDate)}`;
  }

  return periodLabels[period.preset];
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

const downloadTransactionsCsv = (transactions: Transaction[], period: PeriodState) => {
  const headers = [
    "Date",
    "Type de transaction",
    "Description",
    "Catégorie",
    "Méthode de paiement",
    "Client/fournisseur",
    "Notes",
    "Montant",
    "Devise"
  ];

  const rows = transactions.map((transaction) => [
    transaction.date,
    transactionTemplates.find((template) => template.kind === transaction.kind)?.title ?? transaction.kind,
    transaction.label,
    transaction.category,
    transaction.paymentMethod,
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

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [period, setPeriod] = useState<PeriodState>({ preset: "current-month", startDate: "", endDate: "" });
  const [backupMessage, setBackupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
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
  const summary = useMemo(() => calculateSummary(periodTransactions, null), [periodTransactions]);
  const periodBalances = useMemo(() => calculateAccountBalances(periodTransactions), [periodTransactions]);
  const balanceBalances = useMemo(() => calculateAccountBalances(balanceTransactions), [balanceTransactions]);
  const balanceSummary = useMemo(() => calculateSummary(balanceTransactions, null), [balanceTransactions]);
  const periodLabel = getPeriodLabel(period);
  const businessProfile = getBusinessProfileDefinition(profile);

  const confirmClearTransactions = () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer toutes les transactions ? Cette action est irréversible."
    );

    if (confirmed) {
      clearTransactions();
    }
  };

  const startEditingTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTab("add");
  };

  const stopEditingTransaction = () => {
    setEditingTransaction(null);
  };

  const saveEditedTransaction = (transaction: Transaction) => {
    updateTransaction(transaction);
    setEditingTransaction(null);
    setTab("dashboard");
  };

  const startNewTransaction = () => {
    setEditingTransaction(null);
    setTab("add");
  };

  const exportBackup = () => {
    const backup = createBackup(transactions, profile);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getBackupFilename();
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage({ type: "success", text: "La sauvegarde a été exportée." });
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
          text: "Ce fichier n'est pas une sauvegarde valide de Ma Petite Compta."
        });
        return;
      }

      const confirmed = window.confirm(
        "Importer cette sauvegarde remplacera vos données actuelles. Voulez-vous continuer ?"
      );
      if (!confirmed) {
        return;
      }

      replaceTransactions(parsed.transactions);
      setProfile(parsed.businessProfile);
      setEditingTransaction(null);
      setTab("dashboard");
      setBackupMessage({ type: "success", text: "La sauvegarde a été importée avec succès." });
    } catch {
      setBackupMessage({
        type: "error",
        text: "Impossible de lire ce fichier. Vérifiez qu'il contient un JSON valide."
      });
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:flex-row lg:py-6">
        <aside className="panel no-print flex flex-col gap-5 p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
                <BadgeEuro size={23} aria-hidden />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink">Ma Petite Compta</h1>
                <p className="text-xs text-moss">Comptabilité simple (Simple Accounting)</p>
              </div>
            </div>
          </div>

          <nav className="grid gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === "add") {
                      startNewTransaction();
                    } else {
                      setTab(item.id);
                    }
                  }}
                  className={`flex min-h-11 items-center gap-3 px-3 py-2 text-left text-sm font-semibold transition ${
                    tab === item.id ? "bg-ink text-white" : "text-ink hover:bg-mint"
                  }`}
                  style={{ borderRadius: 6 }}
                >
                  <Icon size={18} aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-black/10 pt-4">
            <p className="label">Stockage (Storage)</p>
            <p className="mt-2 text-sm text-moss">Les données restent dans ce navigateur avec localStorage.</p>
            <p className="mt-2 text-sm font-semibold text-ink">Profil: {profile}</p>
            <button
              type="button"
              onClick={confirmClearTransactions}
              className="mt-3 inline-flex min-h-10 items-center gap-2 border border-black/10 bg-white px-3 text-sm font-semibold text-ink hover:border-clay hover:text-clay"
              style={{ borderRadius: 6 }}
            >
              <RotateCcw size={16} aria-hidden />
              Réinitialiser
            </button>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={exportBackup}
                className="inline-flex min-h-10 items-center justify-center gap-2 border border-black/10 bg-white px-3 text-sm font-semibold text-ink hover:border-moss"
                style={{ borderRadius: 6 }}
              >
                <Download size={16} aria-hidden />
                Exporter une sauvegarde
              </button>
              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="inline-flex min-h-10 items-center justify-center gap-2 border border-black/10 bg-white px-3 text-sm font-semibold text-ink hover:border-moss"
                style={{ borderRadius: 6 }}
              >
                <Upload size={16} aria-hidden />
                Importer une sauvegarde
              </button>
              <input
                ref={backupInputRef}
                type="file"
                accept="application/json,.json"
                onChange={importBackup}
                className="hidden"
                aria-label="Choisir une sauvegarde JSON"
              />
            </div>
            {backupMessage ? (
              <p className={`mt-3 text-sm font-semibold ${backupMessage.type === "error" ? "text-clay" : "text-moss"}`}>
                {backupMessage.text}
              </p>
            ) : null}
          </div>
        </aside>

        <section className="flex-1">
          {!loaded || !profileLoaded ? (
            <div className="panel p-8">Chargement...</div>
          ) : (
            <>
              {tab !== "add" && tab !== "learn" && tab !== "profile" ? (
                <PeriodSelector
                  period={period}
                  setPeriod={setPeriod}
                  periodLabel={periodLabel}
                  transactionCount={periodTransactions.length}
                  onExport={() => downloadTransactionsCsv(periodTransactions, period)}
                />
              ) : null}
              {tab === "dashboard" && (
                <Dashboard
                  summary={summary}
                  transactions={periodTransactions}
                  hasTransactions={transactions.length > 0}
                  hasSamples={transactions.some((transaction) => transaction.isSample)}
                  periodLabel={periodLabel}
                  onCreateTransaction={startNewTransaction}
                  onOpenProfile={() => setTab("profile")}
                  onOpenReports={() => setTab("reports")}
                  onAddSamples={addSampleTransactions}
                  onRemoveSamples={removeSampleTransactions}
                  onEditTransaction={startEditingTransaction}
                  onDeleteTransaction={deleteTransaction}
                />
              )}
              {tab === "add" && (
                <AddTransaction
                  key={editingTransaction?.id ?? "new"}
                  onAdd={addTransaction}
                  onUpdate={saveEditedTransaction}
                  onCancelEdit={stopEditingTransaction}
                  editingTransaction={editingTransaction}
                  businessProfile={businessProfile}
                />
              )}
              {tab === "reports" && (
                <Reports
                  transactions={periodTransactions}
                  periodBalances={periodBalances}
                  balanceBalances={balanceBalances}
                  balanceSummary={balanceSummary}
                  periodLabel={periodLabel}
                />
              )}
              {tab === "learn" && <Learning />}
              {tab === "profile" && <BusinessProfileView profile={profile} setProfile={setProfile} />}
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
  onExport
}: {
  period: PeriodState;
  setPeriod: (period: PeriodState) => void;
  periodLabel: string;
  transactionCount: number;
  onExport: () => void;
}) {
  return (
    <section className="panel no-print mb-5 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-end">
        <div>
          <label className="label" htmlFor="period-preset">
            Période
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
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {period.preset === "custom" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date de début" id="period-start">
              <input
                id="period-start"
                type="date"
                value={period.startDate}
                onChange={(event) => setPeriod({ ...period, startDate: event.target.value })}
                className="input"
              />
            </Field>
            <Field label="Date de fin" id="period-end">
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
        <p className="text-sm font-semibold text-moss">Période affichée : {periodLabel}</p>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-black/10 bg-white px-3 text-sm font-bold text-ink hover:border-moss"
          style={{ borderRadius: 6 }}
        >
          <Download size={16} aria-hidden />
          Exporter les transactions en CSV ({transactionCount})
        </button>
      </div>
    </section>
  );
}

function Dashboard({
  summary,
  transactions,
  hasTransactions,
  hasSamples,
  periodLabel,
  onCreateTransaction,
  onOpenProfile,
  onOpenReports,
  onAddSamples,
  onRemoveSamples,
  onEditTransaction,
  onDeleteTransaction
}: {
  summary: ReturnType<typeof calculateSummary>;
  transactions: Transaction[];
  hasTransactions: boolean;
  hasSamples: boolean;
  periodLabel: string;
  onCreateTransaction: () => void;
  onOpenProfile: () => void;
  onOpenReports: () => void;
  onAddSamples: () => void;
  onRemoveSamples: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}) {
  const cards = [
    { label: "Argent sur la période", english: "Period Cash", value: summary.cash, icon: Banknote },
    { label: "Revenus de la période", english: "Period Revenue", value: summary.revenue, icon: ArrowUpRight },
    { label: "Dépenses de la période", english: "Period Expenses", value: summary.expenses, icon: ArrowDownRight },
    { label: "Bénéfice net de la période", english: "Period Net Income", value: summary.netIncome, icon: Scale },
    { label: "Dettes de la période", english: "Period Liabilities", value: summary.liabilities, icon: Landmark },
    { label: "Capitaux propres de la période", english: "Period Equity", value: summary.equity, icon: Building2 }
  ];

  return (
    <div className="space-y-5">
      <Header
        title="Tableau de bord"
        subtitle="Vue rapide de votre petite entreprise avec les bases comptables visibles."
        action={
          <button
            type="button"
            onClick={onCreateTransaction}
            className="inline-flex min-h-11 items-center gap-2 bg-ink px-4 text-sm font-bold text-white"
            style={{ borderRadius: 6 }}
          >
            <Plus size={17} aria-hidden />
            Nouvelle transaction
          </button>
        }
      />

      {!hasTransactions ? (
        <Onboarding
          onOpenProfile={onOpenProfile}
          onCreateTransaction={onCreateTransaction}
          onOpenReports={onOpenReports}
          onAddSamples={onAddSamples}
        />
      ) : (
        <section className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">Données d&apos;exemple</p>
            <p className="mt-1 text-sm text-moss">
              Ajoutez quelques transactions fictives pour tester les rapports sans modifier vos données réelles.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onAddSamples}
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-black/10 bg-white px-3 text-sm font-bold text-ink hover:border-moss"
              style={{ borderRadius: 6 }}
            >
              Ajouter des exemples
            </button>
            {hasSamples ? (
              <button
                type="button"
                onClick={onRemoveSamples}
                className="inline-flex min-h-10 items-center justify-center border border-black/10 bg-white px-3 text-sm font-bold text-clay hover:border-clay"
                style={{ borderRadius: 6 }}
              >
                Supprimer les exemples
              </button>
            ) : null}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label">{card.label}</p>
                  <p className="text-xs text-moss">({card.english})</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-ink">
                  <Icon size={20} aria-hidden />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-ink">{formatCurrency(card.value)}</p>
            </article>
          );
        })}
      </div>

      <section className="panel p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Dernières transactions</h2>
            <p className="text-sm text-moss">Période affichée : {periodLabel}</p>
          </div>
        </div>
        <TransactionList
          transactions={transactions.slice(0, 6)}
          emptyMessage="Aucune transaction pour cette période. Ajoutez une transaction ou changez le filtre de période."
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      </section>
    </div>
  );
}

function Onboarding({
  onOpenProfile,
  onCreateTransaction,
  onOpenReports,
  onAddSamples
}: {
  onOpenProfile: () => void;
  onCreateTransaction: () => void;
  onOpenReports: () => void;
  onAddSamples: () => void;
}) {
  const steps = [
    {
      title: "Étape 1: Choisissez votre profil d'entreprise",
      text: "Ma Petite Compta proposera des catégories adaptées à votre activité.",
      icon: BriefcaseBusiness,
      action: onOpenProfile,
      button: "Choisir le profil"
    },
    {
      title: "Étape 2: Ajoutez une transaction",
      text: "Enregistrez un revenu, une dépense, un investissement ou un achat.",
      icon: Plus,
      action: onCreateTransaction,
      button: "Ajouter une transaction"
    },
    {
      title: "Étape 3: Consultez vos rapports et apprenez la comptabilité",
      text: "Vos écritures alimentent automatiquement le tableau de bord et les rapports.",
      icon: FileBarChart2,
      action: onOpenReports,
      button: "Voir les rapports"
    }
  ];

  return (
    <section className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label">Bienvenue</p>
          <h2 className="mt-1 text-xl font-bold">Bienvenue dans Ma Petite Compta</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Commencez par choisir votre profil d&apos;entreprise, puis ajoutez votre première transaction.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddSamples}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-4 text-sm font-bold text-white"
          style={{ borderRadius: 6 }}
        >
          Ajouter des exemples
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="border border-black/10 bg-white p-4" style={{ borderRadius: 8 }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-ink">
                <Icon size={19} aria-hidden />
              </div>
              <h3 className="mt-3 text-base font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-moss">{step.text}</p>
              <button
                type="button"
                onClick={step.action}
                className="mt-4 inline-flex min-h-10 items-center justify-center border border-black/10 bg-white px-3 text-sm font-bold text-ink hover:border-moss"
                style={{ borderRadius: 6 }}
              >
                {step.button}
              </button>
            </article>
          );
        })}
      </div>
    </section>
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
  editingTransaction,
  businessProfile
}: {
  onAdd: (transaction: Transaction) => void;
  onUpdate: (transaction: Transaction) => void;
  onCancelEdit: () => void;
  editingTransaction: Transaction | null;
  businessProfile: ReturnType<typeof getBusinessProfileDefinition>;
}) {
  const isEditing = Boolean(editingTransaction);
  const [kind, setKind] = useState<TransactionKind>(editingTransaction?.kind ?? "client-payment");
  const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : "250");
  const [label, setLabel] = useState(editingTransaction?.label ?? "Nouvelle vente");
  const [date, setDate] = useState(editingTransaction?.date ?? formatLocalDateInput());
  const categoryOptions = useMemo(() => getCategoryOptions(kind, businessProfile), [kind, businessProfile]);
  const [category, setCategory] = useState(editingTransaction?.category ?? categoryOptions[0] ?? "");
  const categoryChoices = category && !categoryOptions.includes(category) ? [category, ...categoryOptions] : categoryOptions;
  const selectedCategory = categoryChoices.includes(category) ? category : categoryChoices[0] ?? "";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editingTransaction?.paymentMethod ?? "Virement");
  const [partyName, setPartyName] = useState(editingTransaction?.partyName ?? "");
  const [note, setNote] = useState(editingTransaction?.note ?? "");
  const preview = useMemo(
    () =>
      createTransaction({
        kind,
        amount: Number(amount) || 0,
        label,
        date,
        category: selectedCategory,
        paymentMethod,
        partyName,
        note
      }),
    [kind, amount, label, date, selectedCategory, paymentMethod, partyName, note]
  );

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
    setLabel("");
    setAmount("");
    setCategory("");
    setPartyName("");
    setNote("");
  };

  return (
    <div className="space-y-5">
      <Header
        title={isEditing ? "Modifier la transaction" : "Ajouter une transaction"}
        subtitle="Choisissez un scénario; l'application prépare l'écriture comptable automatiquement."
        action={
          isEditing ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex min-h-10 items-center justify-center border border-black/10 bg-white px-4 text-sm font-bold text-ink hover:border-moss"
              style={{ borderRadius: 6 }}
            >
              Annuler
            </button>
          ) : undefined
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={submit} className="panel space-y-4 p-4">
          <div>
            <label className="label" htmlFor="kind">
              Type de transaction
            </label>
            <select id="kind" value={kind} onChange={(event) => setKind(event.target.value as TransactionKind)} className="input mt-2">
              {transactionTemplates.map((template) => (
                <option key={template.kind} value={template.kind}>
                  {template.title} ({template.english})
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-moss">{transactionTemplates.find((template) => template.kind === kind)?.helper}</p>
          </div>
          <div>
            <label className="label" htmlFor="category">
              Catégorie adaptée
            </label>
            {categoryOptions.length ? (
              <>
                <select id="category" value={selectedCategory} onChange={(event) => setCategory(event.target.value)} className="input mt-2">
                  {categoryChoices.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-moss">Suggestions pour le profil: {businessProfile.profile}.</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-moss">
                Aucune catégorie recommandée pour ce type de transaction. La logique comptable reste inchangée.
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" id="date">
              <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input" required />
            </Field>
            <Field label="Montant en FCFA" id="amount">
              <input id="amount" type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="input" placeholder="Ex: 25 000" required />
            </Field>
          </div>
          <Field label="Description" id="label">
            <input id="label" value={label} onChange={(event) => setLabel(event.target.value)} className="input" placeholder="Ex: Assemblage meuble IKEA, Achat essence" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Méthode de paiement" id="payment-method">
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                className="input"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Client ou fournisseur facultatif" id="party-name">
              <input
                id="party-name"
                value={partyName}
                onChange={(event) => setPartyName(event.target.value)}
                className="input"
                placeholder="Ex: Client Dupont, Fournisseur quincaillerie"
              />
            </Field>
          </div>
          <Field label="Note facultative" id="note">
            <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} className="input min-h-24 resize-y" placeholder="Détail utile pour vous relire plus tard" />
          </Field>
          <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-ink px-4 text-sm font-bold text-white" style={{ borderRadius: 6 }}>
            <CheckCircle2 size={17} aria-hidden />
            {isEditing ? "Enregistrer les modifications" : "Enregistrer la transaction"}
          </button>
        </form>

        <AccountingExplanation transaction={preview} />
      </div>
    </div>
  );
}

function Reports({
  transactions,
  periodBalances,
  balanceBalances,
  balanceSummary,
  periodLabel
}: {
  transactions: Transaction[];
  periodBalances: ReturnType<typeof calculateAccountBalances>;
  balanceBalances: ReturnType<typeof calculateAccountBalances>;
  balanceSummary: ReturnType<typeof calculateSummary>;
  periodLabel: string;
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
        <p>Rapports comptables</p>
        <p>Période affichée : {periodLabel}</p>
      </div>
      <Header
        title="Rapports"
        subtitle="Trois rapports essentiels générés depuis vos écritures de journal."
        action={
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-4 text-sm font-bold text-white"
            style={{ borderRadius: 6 }}
          >
            <Printer size={17} aria-hidden />
            Imprimer les rapports
          </button>
        }
      />
      <p className="panel p-4 text-sm font-semibold text-moss">Période affichée : {periodLabel}</p>
      {!transactions.length ? (
        <p className="panel p-4 text-sm font-semibold text-moss">
          Aucune transaction pour cette période. Ajoutez une transaction ou changez le filtre de période.
        </p>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel p-4">
          <ReportTitle title="État des résultats" english="Income Statement" />
          <ReportLine label="Revenus (Revenue)" value={revenue} />
          <ReportLine label="Dépenses (Expenses)" value={expenses} />
          <ReportLine label="Bénéfice net (Net Income)" value={revenue - expenses} strong />
        </section>

        <section className="panel p-4">
          <ReportTitle title="Bilan" english="Balance Sheet" />
          <ReportGroup title="Actifs (Assets)" lines={assets} />
          <ReportLine label="Total actifs (Total Assets)" value={balanceSummary.assets} strong />
          <ReportGroup title="Passifs (Liabilities)" lines={liabilities} />
          <ReportLine label="Total passifs (Total Liabilities)" value={balanceSummary.liabilities} strong />
          <ReportGroup title="Capitaux propres (Equity)" lines={equity} />
          <ReportLine label="Bénéfices non répartis (Retained Earnings)" value={balanceSummary.retainedEarnings} />
          <ReportLine label="Total capitaux propres (Total Equity)" value={balanceSummary.equity} strong />
          <ReportLine label="Passifs + capitaux propres" value={balanceSummary.liabilities + balanceSummary.equity} strong />
        </section>
      </div>

      <section className="panel overflow-hidden p-4">
        <ReportTitle title="Balance de vérification" english="Trial Balance" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase text-moss">
              <tr>
                <th className="py-3 pr-3">Compte</th>
                <th className="py-3 pr-3">Type</th>
                <th className="py-3 pr-3">Solde normal</th>
                <th className="py-3 pr-3 text-right">Débit (Debit)</th>
                <th className="py-3 pr-3 text-right">Crédit (Credit)</th>
              </tr>
            </thead>
            <tbody>
              {periodBalances.length ? (
                periodBalances.map((line) => (
                  <tr key={line.account} className="border-b border-black/5">
                    <td className="py-3 pr-3 font-semibold">{line.account}</td>
                    <td className="py-3 pr-3">{accountTypeLabels[line.accountType]}</td>
                    <td className="py-3 pr-3">
                      {accountNormalSide[line.accountType] === "debit" ? "Solde débiteur" : "Solde créditeur"}:{" "}
                      {formatCurrency(line.balance)}
                    </td>
                    <td className="py-3 pr-3 text-right">{formatCurrency(line.debit)}</td>
                    <td className="py-3 pr-3 text-right">{formatCurrency(line.credit)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-sm text-moss">
                    Aucune transaction pour cette période. Ajoutez une transaction ou changez le filtre de période.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="font-bold">
              <tr>
                <td className="py-3 pr-3" colSpan={3}>
                  Totaux
                </td>
                <td className="py-3 pr-3 text-right">{formatCurrency(totalDebits)}</td>
                <td className="py-3 pr-3 text-right">{formatCurrency(totalCredits)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className={`mt-3 text-sm font-semibold ${trialBalanceBalanced ? "text-moss" : "text-clay"}`}>
          Balance {trialBalanceBalanced ? "équilibrée" : "non équilibrée"}: total des débits {formatCurrency(totalDebits)} et
          total des crédits {formatCurrency(totalCredits)} ({transactions.length} transaction(s)).
        </p>
      </section>
    </div>
  );
}

function Learning() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const question = quizQuestions[questionIndex];
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
    setQuestionIndex((current) => (current + 1) % quizQuestions.length);
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
      <Header title="Mode apprentissage" subtitle="Des leçons courtes pour comprendre ce que chaque transaction fait à vos comptes." />
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => {
          const Icon = lesson.icon;
          return (
            <article key={lesson.title} className="panel p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-ink">
                  <Icon size={19} aria-hidden />
                </div>
                <h2 className="text-base font-bold">{lesson.title}</h2>
              </div>
              <p className="text-sm leading-6 text-moss">{lesson.text}</p>
            </article>
          );
        })}
      </div>

      <section className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="label">Quiz comptable</p>
            <h2 className="mt-1 text-xl font-bold">Pratiquez les bases</h2>
            <p className="mt-2 text-sm text-moss">
              Question {questionIndex + 1} sur {quizQuestions.length} · {question.type}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <ScoreItem label="Bonnes réponses" value={correctAnswers} />
            <ScoreItem label="Répondues" value={answeredQuestions} />
            <ScoreItem label="Réussite" value={`${successRate}%`} />
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
                  ? "border-moss bg-mint text-ink"
                  : choiceIsSelected
                    ? "border-clay bg-white text-clay"
                    : "border-black/10 bg-white text-moss"
                : "border-black/10 bg-white text-ink hover:border-moss hover:bg-mint";

              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => answerQuestion(choice)}
                  disabled={hasAnswered}
                  className={`min-h-12 border px-4 py-3 text-left text-sm font-semibold transition ${answerClass}`}
                  style={{ borderRadius: 6 }}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        {hasAnswered ? (
          <div className={`border p-4 ${isCorrect ? "border-moss bg-mint" : "border-clay bg-white"}`} style={{ borderRadius: 8 }}>
            <p className={`font-bold ${isCorrect ? "text-ink" : "text-clay"}`}>
              {isCorrect ? "Correct." : `Incorrect. La bonne réponse est : ${question.correctAnswer}`}
            </p>
            <p className="mt-2 text-sm leading-6 text-moss">{question.explanation}</p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={restartQuiz}
            className="inline-flex min-h-10 items-center justify-center border border-black/10 bg-white px-4 text-sm font-bold text-ink hover:border-moss"
            style={{ borderRadius: 6 }}
          >
            Recommencer le quiz
          </button>
          <button
            type="button"
            onClick={nextQuestion}
            disabled={!hasAnswered}
            className="inline-flex min-h-10 items-center justify-center bg-ink px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderRadius: 6 }}
          >
            Question suivante
          </button>
        </div>
      </section>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-20 border border-black/10 bg-white px-2 py-2" style={{ borderRadius: 6 }}>
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-[10px] font-semibold uppercase leading-4 text-moss">{label}</p>
    </div>
  );
}

function BusinessProfileView({
  profile,
  setProfile
}: {
  profile: BusinessProfile;
  setProfile: (profile: BusinessProfile) => void;
}) {
  const selectedProfile = getBusinessProfileDefinition(profile);

  return (
    <div className="space-y-5">
      <Header
        title="Profil d'entreprise"
        subtitle="Ce profil aide Ma Petite Compta à proposer des catégories adaptées à votre activité."
      />

      <section className="panel p-4">
        <label className="label" htmlFor="business-profile">
          Type de business
        </label>
        <select
          id="business-profile"
          value={profile}
          onChange={(event) => setProfile(event.target.value as BusinessProfile)}
          className="input mt-2 max-w-xl"
        >
          {businessProfiles.map((definition) => (
            <option key={definition.profile} value={definition.profile}>
              {definition.profile}
            </option>
          ))}
        </select>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <CategoryPanel title="Revenus proposés" categories={selectedProfile.revenues} />
        <CategoryPanel title="Dépenses proposées" categories={selectedProfile.expenses} />
      </div>
    </div>
  );
}

function CategoryPanel({ title, categories }: { title: string; categories: string[] }) {
  return (
    <section className="panel p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span key={category} className="border border-black/10 bg-mint px-3 py-2 text-sm font-semibold text-ink" style={{ borderRadius: 6 }}>
            {category}
          </span>
        ))}
      </div>
    </section>
  );
}

function Header({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <header className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="label">Application MVP</p>
        <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">{subtitle}</p>
      </div>
      {action}
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

function TransactionList({
  transactions,
  emptyMessage = "Aucune transaction enregistrée.",
  onEditTransaction,
  onDeleteTransaction
}: {
  transactions: Transaction[];
  emptyMessage?: string;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}) {
  if (!transactions.length) {
    return <p className="text-sm text-moss">{emptyMessage}</p>;
  }

  const confirmDelete = (transaction: Transaction) => {
    const confirmed = window.confirm(`Supprimer la transaction "${transaction.label}" ? Cette action est irréversible.`);

    if (confirmed) {
      onDeleteTransaction(transaction.id);
    }
  };

  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => (
        <article key={transaction.id} className="border border-black/10 bg-white p-3" style={{ borderRadius: 8 }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{transaction.label}</p>
                {transaction.isSample ? (
                  <span className="border border-moss/30 bg-mint px-2 py-1 text-[10px] font-bold uppercase text-moss" style={{ borderRadius: 6 }}>
                    Exemple
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-moss">
                {formatFrenchDate(transaction.date)} - {transactionTemplates.find((template) => template.kind === transaction.kind)?.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-moss">
                {transaction.category ? (
                  <span className="border border-black/10 bg-mint px-2 py-1" style={{ borderRadius: 6 }}>
                    Catégorie: {transaction.category}
                  </span>
                ) : null}
                <span className="border border-black/10 bg-white px-2 py-1" style={{ borderRadius: 6 }}>
                  Paiement: {transaction.paymentMethod}
                </span>
                {transaction.partyName ? (
                  <span className="border border-black/10 bg-white px-2 py-1" style={{ borderRadius: 6 }}>
                    Client/fournisseur: {transaction.partyName}
                  </span>
                ) : null}
              </div>
              {transaction.note ? <p className="mt-2 text-sm leading-6 text-moss">Note: {transaction.note}</p> : null}
            </div>
            <div className="flex items-center gap-3 self-start">
              <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditTransaction(transaction)}
                  className="inline-flex min-h-9 items-center justify-center border border-black/10 bg-white px-3 text-sm font-semibold text-ink hover:border-moss"
                  style={{ borderRadius: 6 }}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(transaction)}
                  className="inline-flex min-h-9 items-center justify-center border border-black/10 bg-white px-3 text-sm font-semibold text-clay hover:border-clay"
                  style={{ borderRadius: 6 }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-moss">{transaction.generated.explanation}</p>
        </article>
      ))}
    </div>
  );
}

function AccountingExplanation({ transaction }: { transaction: Transaction }) {
  const debitTotal = sum(transaction.generated.journal.map((line) => line.debit));
  const creditTotal = sum(transaction.generated.journal.map((line) => line.credit));

  return (
    <section className="panel space-y-4 p-4">
      <div>
        <p className="label">Explication automatique</p>
        <h2 className="mt-1 text-xl font-bold">Ce que la transaction change</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-moss">
          {transaction.category ? (
            <span className="border border-black/10 bg-mint px-2 py-1" style={{ borderRadius: 6 }}>
              Catégorie: {transaction.category}
            </span>
          ) : null}
          <span className="border border-black/10 bg-white px-2 py-1" style={{ borderRadius: 6 }}>
            Paiement: {transaction.paymentMethod}
          </span>
          {transaction.partyName ? (
            <span className="border border-black/10 bg-white px-2 py-1" style={{ borderRadius: 6 }}>
              Client/fournisseur: {transaction.partyName}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-moss">{transaction.generated.explanation}</p>
      </div>

      <div>
        <h3 className="mb-2 font-bold">Comptes affectés</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {transaction.generated.affectedAccounts.map((account) => (
            <div key={`${account.name}-${account.movement}`} className="border border-black/10 bg-white p-3" style={{ borderRadius: 8 }}>
              <p className="font-semibold">{account.name}</p>
              <p className="text-sm text-moss">{accountTypeLabels[account.type]}</p>
              <p className="text-sm text-moss">{account.movement}</p>
            </div>
          ))}
        </div>
      </div>

      <JournalTable journal={transaction.generated.journal} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-black/10 bg-white p-3" style={{ borderRadius: 8 }}>
          <p className="label">Vérification</p>
          <p className="mt-1 font-bold">
            {formatCurrency(debitTotal)} = {formatCurrency(creditTotal)}
          </p>
          <p className="text-sm text-moss">{transaction.generated.debitsEqualCredits ? "Total des débits = total des crédits" : "Les totaux ne sont pas équilibrés"}</p>
        </div>
        <div className="border border-black/10 bg-white p-3" style={{ borderRadius: 8 }}>
          <p className="label">États financiers affectés</p>
          <p className="mt-1 text-sm leading-6 text-moss">{transaction.generated.affectedStatements.join(", ")}</p>
        </div>
      </div>
    </section>
  );
}

function JournalTable({ journal }: { journal: { account: string; accountType: AccountType; debit: number; credit: number }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-black/10 text-xs uppercase text-moss">
          <tr>
            <th className="py-3 pr-3">Compte</th>
            <th className="py-3 pr-3">Type</th>
            <th className="py-3 pr-3 text-right">Débit</th>
            <th className="py-3 pr-3 text-right">Crédit</th>
          </tr>
        </thead>
        <tbody>
          {journal.map((line) => (
            <tr key={`${line.account}-${line.debit}-${line.credit}`} className="border-b border-black/5">
              <td className="py-3 pr-3 font-semibold">{line.account}</td>
              <td className="py-3 pr-3">{accountTypeLabels[line.accountType]}</td>
              <td className="py-3 pr-3 text-right">{line.debit ? formatCurrency(line.debit) : "-"}</td>
              <td className="py-3 pr-3 text-right">{line.credit ? formatCurrency(line.credit) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportTitle({ title, english }: { title: string; english: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-moss">({english})</p>
    </div>
  );
}

function ReportGroup({ title, lines }: { title: string; lines: ReturnType<typeof calculateAccountBalances> }) {
  return (
    <div className="mb-3">
      <p className="label mb-2">{title}</p>
      {lines.length ? lines.map((line) => <ReportLine key={line.account} label={line.account} value={line.balance} />) : <p className="text-sm text-moss">Aucun compte.</p>}
    </div>
  );
}

function ReportLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-black/5 py-2 ${strong ? "font-bold text-ink" : "text-sm text-moss"}`}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
