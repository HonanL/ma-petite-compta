"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeEuro,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileBarChart2,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  Plus,
  ReceiptText,
  RotateCcw,
  Scale,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  AccountType,
  accountTypeLabels,
  calculateAccountBalances,
  calculateSummary,
  createTransaction,
  formatMoney,
  getMonthKey,
  sum,
  Transaction,
  TransactionKind,
  transactionTemplates
} from "@/lib/accounting";
import { useTransactions } from "@/lib/useTransactions";

type Tab = "dashboard" | "add" | "reports" | "learn";

const navigation = [
  { id: "dashboard" as Tab, label: "Tableau de bord", icon: LayoutDashboard },
  { id: "add" as Tab, label: "Ajouter", icon: Plus },
  { id: "reports" as Tab, label: "Rapports", icon: FileBarChart2 },
  { id: "learn" as Tab, label: "Apprentissage", icon: GraduationCap }
];

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

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { transactions, loaded, addTransaction, clearTransactions } = useTransactions();
  const summary = useMemo(() => calculateSummary(transactions), [transactions]);
  const balances = useMemo(() => calculateAccountBalances(transactions), [transactions]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:flex-row lg:py-6">
        <aside className="panel flex flex-col gap-5 p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
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
                  onClick={() => setTab(item.id)}
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
            <button
              type="button"
              onClick={clearTransactions}
              className="mt-3 inline-flex min-h-10 items-center gap-2 border border-black/10 bg-white px-3 text-sm font-semibold text-ink hover:border-clay hover:text-clay"
              style={{ borderRadius: 6 }}
            >
              <RotateCcw size={16} aria-hidden />
              Réinitialiser
            </button>
          </div>
        </aside>

        <section className="flex-1">
          {!loaded ? (
            <div className="panel p-8">Chargement...</div>
          ) : (
            <>
              {tab === "dashboard" && <Dashboard summary={summary} transactions={transactions} setTab={setTab} />}
              {tab === "add" && <AddTransaction onAdd={addTransaction} />}
              {tab === "reports" && <Reports transactions={transactions} balances={balances} summary={summary} />}
              {tab === "learn" && <Learning />}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Dashboard({
  summary,
  transactions,
  setTab
}: {
  summary: ReturnType<typeof calculateSummary>;
  transactions: Transaction[];
  setTab: (tab: Tab) => void;
}) {
  const cards = [
    { label: "Argent disponible", english: "Cash Available", value: summary.cash, icon: Banknote },
    { label: "Revenus du mois", english: "Monthly Revenue", value: summary.revenue, icon: ArrowUpRight },
    { label: "Dépenses du mois", english: "Monthly Expenses", value: summary.expenses, icon: ArrowDownRight },
    { label: "Bénéfice net", english: "Net Income", value: summary.netIncome, icon: Scale },
    { label: "Dettes", english: "Liabilities", value: summary.liabilities, icon: Landmark },
    { label: "Capitaux propres", english: "Equity", value: summary.equity, icon: Building2 }
  ];

  return (
    <div className="space-y-5">
      <Header
        title="Tableau de bord"
        subtitle="Vue rapide de votre petite entreprise avec les bases comptables visibles."
        action={
          <button
            type="button"
            onClick={() => setTab("add")}
            className="inline-flex min-h-11 items-center gap-2 bg-ink px-4 text-sm font-bold text-white"
            style={{ borderRadius: 6 }}
          >
            <Plus size={17} aria-hidden />
            Nouvelle transaction
          </button>
        }
      />

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
              <p className="mt-4 text-2xl font-bold text-ink">{formatMoney(card.value)}</p>
            </article>
          );
        })}
      </div>

      <section className="panel p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Dernières transactions</h2>
            <p className="text-sm text-moss">Mois courant: {getMonthKey()}</p>
          </div>
        </div>
        <TransactionList transactions={transactions.slice(0, 6)} />
      </section>
    </div>
  );
}

function AddTransaction({ onAdd }: { onAdd: (transaction: Transaction) => void }) {
  const [kind, setKind] = useState<TransactionKind>("client-payment");
  const [amount, setAmount] = useState("250");
  const [label, setLabel] = useState("Nouvelle vente");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const preview = useMemo(() => createTransaction({ kind, amount: Number(amount) || 0, label, date, note }), [kind, amount, label, date, note]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;
    onAdd(createTransaction({ kind, amount: numericAmount, label, date, note }));
    setLabel("");
    setAmount("");
    setNote("");
  };

  return (
    <div className="space-y-5">
      <Header title="Ajouter une transaction" subtitle="Choisissez un scénario; l'application prépare l'écriture comptable automatiquement." />
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" id="date">
              <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input" required />
            </Field>
            <Field label="Montant" id="amount">
              <input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="input" required />
            </Field>
          </div>
          <Field label="Libellé" id="label">
            <input id="label" value={label} onChange={(event) => setLabel(event.target.value)} className="input" placeholder="Ex: Paiement client Dupont" required />
          </Field>
          <Field label="Note facultative" id="note">
            <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} className="input min-h-24 resize-y" placeholder="Détail utile pour vous relire plus tard" />
          </Field>
          <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-ink px-4 text-sm font-bold text-white" style={{ borderRadius: 6 }}>
            <CheckCircle2 size={17} aria-hidden />
            Enregistrer la transaction
          </button>
        </form>

        <AccountingExplanation transaction={preview} />
      </div>
    </div>
  );
}

function Reports({
  transactions,
  balances,
  summary
}: {
  transactions: Transaction[];
  balances: ReturnType<typeof calculateAccountBalances>;
  summary: ReturnType<typeof calculateSummary>;
}) {
  const revenue = sum(balances.filter((line) => line.accountType === "revenu").map((line) => line.balance));
  const expenses = sum(balances.filter((line) => line.accountType === "dépense").map((line) => line.balance));
  const assets = balances.filter((line) => line.accountType === "actif");
  const liabilities = balances.filter((line) => line.accountType === "passif");
  const equity = balances.filter((line) => line.accountType === "capitaux propres");
  const totalDebits = sum(balances.map((line) => line.debit));
  const totalCredits = sum(balances.map((line) => line.credit));

  return (
    <div className="space-y-5">
      <Header title="Rapports" subtitle="Trois rapports essentiels générés depuis vos écritures de journal." />
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
          <ReportLine label="Total actifs (Total Assets)" value={summary.assets} strong />
          <ReportGroup title="Passifs (Liabilities)" lines={liabilities} />
          <ReportLine label="Total passifs (Total Liabilities)" value={summary.liabilities} strong />
          <ReportGroup title="Capitaux propres (Equity)" lines={equity} />
          <ReportLine label="Bénéfices non répartis (Retained Earnings)" value={summary.retainedEarnings} />
          <ReportLine label="Total capitaux propres (Total Equity)" value={summary.equity} strong />
          <ReportLine label="Passifs + capitaux propres" value={summary.liabilities + summary.equity} strong />
        </section>
      </div>

      <section className="panel overflow-hidden p-4">
        <ReportTitle title="Balance de vérification" english="Trial Balance" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase text-moss">
              <tr>
                <th className="py-3 pr-3">Compte</th>
                <th className="py-3 pr-3">Type</th>
                <th className="py-3 pr-3 text-right">Débit (Debit)</th>
                <th className="py-3 pr-3 text-right">Crédit (Credit)</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((line) => (
                <tr key={line.account} className="border-b border-black/5">
                  <td className="py-3 pr-3 font-semibold">{line.account}</td>
                  <td className="py-3 pr-3">{accountTypeLabels[line.accountType]}</td>
                  <td className="py-3 pr-3 text-right">{formatMoney(line.debit)}</td>
                  <td className="py-3 pr-3 text-right">{formatMoney(line.credit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold">
              <tr>
                <td className="py-3 pr-3" colSpan={2}>
                  Totaux
                </td>
                <td className="py-3 pr-3 text-right">{formatMoney(totalDebits)}</td>
                <td className="py-3 pr-3 text-right">{formatMoney(totalCredits)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-sm font-semibold text-moss">
          Vérification: {totalDebits === totalCredits ? "débits = crédits" : "écart à corriger"} ({transactions.length} transaction(s)).
        </p>
      </section>
    </div>
  );
}

function Learning() {
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
    </div>
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

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return <p className="text-sm text-moss">Aucune transaction enregistrée.</p>;
  }

  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => (
        <article key={transaction.id} className="border border-black/10 bg-white p-3" style={{ borderRadius: 8 }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-bold">{transaction.label}</p>
              <p className="text-sm text-moss">
                {transaction.date} - {transactionTemplates.find((template) => template.kind === transaction.kind)?.title}
              </p>
            </div>
            <p className="text-lg font-bold">{formatMoney(transaction.amount)}</p>
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
            {formatMoney(debitTotal)} = {formatMoney(creditTotal)}
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
              <td className="py-3 pr-3 text-right">{line.debit ? formatMoney(line.debit) : "-"}</td>
              <td className="py-3 pr-3 text-right">{line.credit ? formatMoney(line.credit) : "-"}</td>
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
      <span>{formatMoney(value)}</span>
    </div>
  );
}
