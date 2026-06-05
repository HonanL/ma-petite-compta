export type AccountType = "actif" | "passif" | "capitaux propres" | "revenu" | "dépense";

export type StatementType =
  | "État des résultats (Income Statement)"
  | "Bilan (Balance Sheet)"
  | "Balance de vérification (Trial Balance)";

export type TransactionKind =
  | "owner-investment"
  | "client-payment"
  | "cash-expense"
  | "equipment-purchase"
  | "supplies-credit"
  | "supplier-payment"
  | "owner-withdrawal"
  | "bank-loan";

export type PaymentMethod =
  | "Espèces"
  | "Carte bancaire"
  | "Mobile Money"
  | "Virement"
  | "Chèque"
  | "Plateforme en ligne"
  | "Autre";

export type JournalLine = {
  account: string;
  accountType: AccountType;
  debit: number;
  credit: number;
};

export type GeneratedAccounting = {
  explanation: string;
  affectedAccounts: { name: string; type: AccountType; movement: string }[];
  journal: JournalLine[];
  affectedStatements: StatementType[];
  debitsEqualCredits: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  kind: TransactionKind;
  label: string;
  amount: number;
  category?: string;
  paymentMethod: PaymentMethod;
  partyName?: string;
  note?: string;
  isSample?: boolean;
  generated: GeneratedAccounting;
};

export type TransactionTemplate = {
  kind: TransactionKind;
  title: string;
  english: string;
  helper: string;
};

export const paymentMethods: PaymentMethod[] = [
  "Espèces",
  "Carte bancaire",
  "Mobile Money",
  "Virement",
  "Chèque",
  "Plateforme en ligne",
  "Autre"
];

export const transactionTemplates: TransactionTemplate[] = [
  {
    kind: "owner-investment",
    title: "Investissement du propriétaire",
    english: "Owner investment",
    helper: "Le propriétaire met de l'argent dans l'entreprise."
  },
  {
    kind: "client-payment",
    title: "Paiement reçu d'un client",
    english: "Client payment",
    helper: "Un client paie pour un service ou une vente."
  },
  {
    kind: "cash-expense",
    title: "Dépense payée en argent",
    english: "Cash expense",
    helper: "L'entreprise paie une dépense immédiatement."
  },
  {
    kind: "equipment-purchase",
    title: "Achat d'équipement",
    english: "Equipment purchase",
    helper: "L'entreprise achète un outil, un ordinateur ou du matériel durable."
  },
  {
    kind: "supplies-credit",
    title: "Achat de fournitures à crédit",
    english: "Supplies on credit",
    helper: "L'entreprise reçoit des fournitures et paiera plus tard."
  },
  {
    kind: "supplier-payment",
    title: "Paiement d'un fournisseur",
    english: "Supplier payment",
    helper: "L'entreprise rembourse une dette fournisseur."
  },
  {
    kind: "owner-withdrawal",
    title: "Retrait du propriétaire",
    english: "Owner withdrawal",
    helper: "Le propriétaire retire de l'argent pour usage personnel."
  },
  {
    kind: "bank-loan",
    title: "Emprunt bancaire",
    english: "Bank loan",
    helper: "La banque prête de l'argent à l'entreprise."
  }
];

const statements = {
  income: "État des résultats (Income Statement)" as StatementType,
  balance: "Bilan (Balance Sheet)" as StatementType,
  trial: "Balance de vérification (Trial Balance)" as StatementType
};

const makeGenerated = (
  explanation: string,
  journal: JournalLine[],
  affectedStatements: StatementType[]
): GeneratedAccounting => {
  const debitTotal = sum(journal.map((line) => line.debit));
  const creditTotal = sum(journal.map((line) => line.credit));

  return {
    explanation,
    affectedAccounts: journal.map((line) => ({
      name: line.account,
      type: line.accountType,
      movement: line.debit > 0 ? "Débit (Debit)" : "Crédit (Credit)"
    })),
    journal,
    affectedStatements,
    debitsEqualCredits: debitTotal === creditTotal
  };
};

export const generateAccounting = (kind: TransactionKind, amount: number): GeneratedAccounting => {
  switch (kind) {
    case "owner-investment":
      return makeGenerated(
        "Le propriétaire ajoute de l'argent à l'entreprise. L'argent disponible augmente et les capitaux propres augmentent aussi.",
        [
          { account: "Encaisse (Cash)", accountType: "actif", debit: amount, credit: 0 },
          { account: "Capital du propriétaire (Owner's Capital)", accountType: "capitaux propres", debit: 0, credit: amount }
        ],
        [statements.balance, statements.trial]
      );
    case "client-payment":
      return makeGenerated(
        "Un client paie l'entreprise. L'argent augmente et un revenu est reconnu.",
        [
          { account: "Encaisse (Cash)", accountType: "actif", debit: amount, credit: 0 },
          { account: "Revenus de services (Service Revenue)", accountType: "revenu", debit: 0, credit: amount }
        ],
        [statements.income, statements.balance, statements.trial]
      );
    case "cash-expense":
      return makeGenerated(
        "L'entreprise paie une dépense tout de suite. Les dépenses augmentent et l'argent disponible diminue.",
        [
          { account: "Dépenses générales (General Expense)", accountType: "dépense", debit: amount, credit: 0 },
          { account: "Encaisse (Cash)", accountType: "actif", debit: 0, credit: amount }
        ],
        [statements.income, statements.balance, statements.trial]
      );
    case "equipment-purchase":
      return makeGenerated(
        "L'entreprise échange de l'argent contre de l'équipement. Un actif augmente pendant que l'encaisse diminue.",
        [
          { account: "Équipement (Equipment)", accountType: "actif", debit: amount, credit: 0 },
          { account: "Encaisse (Cash)", accountType: "actif", debit: 0, credit: amount }
        ],
        [statements.balance, statements.trial]
      );
    case "supplies-credit":
      return makeGenerated(
        "L'entreprise reçoit des fournitures maintenant et paiera plus tard. Les actifs augmentent et une dette fournisseur apparaît.",
        [
          { account: "Fournitures (Supplies)", accountType: "actif", debit: amount, credit: 0 },
          { account: "Comptes fournisseurs (Accounts Payable)", accountType: "passif", debit: 0, credit: amount }
        ],
        [statements.balance, statements.trial]
      );
    case "supplier-payment":
      return makeGenerated(
        "L'entreprise paie un fournisseur. La dette diminue et l'argent disponible diminue aussi.",
        [
          { account: "Comptes fournisseurs (Accounts Payable)", accountType: "passif", debit: amount, credit: 0 },
          { account: "Encaisse (Cash)", accountType: "actif", debit: 0, credit: amount }
        ],
        [statements.balance, statements.trial]
      );
    case "owner-withdrawal":
      return makeGenerated(
        "Le propriétaire retire de l'argent de l'entreprise. Ce n'est pas une dépense: cela réduit les capitaux propres.",
        [
          { account: "Retraits du propriétaire (Owner's Drawings)", accountType: "capitaux propres", debit: amount, credit: 0 },
          { account: "Encaisse (Cash)", accountType: "actif", debit: 0, credit: amount }
        ],
        [statements.balance, statements.trial]
      );
    case "bank-loan":
      return makeGenerated(
        "La banque prête de l'argent à l'entreprise. L'encaisse augmente et une dette bancaire est créée.",
        [
          { account: "Encaisse (Cash)", accountType: "actif", debit: amount, credit: 0 },
          { account: "Emprunt bancaire (Bank Loan)", accountType: "passif", debit: 0, credit: amount }
        ],
        [statements.balance, statements.trial]
      );
  }
};

export const createTransaction = (
  input: Pick<
    Transaction,
    "date" | "kind" | "label" | "amount" | "category" | "paymentMethod" | "partyName" | "note" | "isSample"
  >
): Transaction => ({
  ...input,
  id: crypto.randomUUID(),
  generated: generateAccounting(input.kind, input.amount)
});

export const sum = (numbers: number[]) => numbers.reduce((total, value) => total + value, 0);

export const formatCurrency = (amount: number) => `${new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0
}).format(amount)} FCFA`;

export const formatLocalDateInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getMonthKey = (date = new Date()) => formatLocalDateInput(date).slice(0, 7);

export const formatFrenchDate = (dateInput: string) => {
  const [year, month, day] = dateInput.split("-").map(Number);
  if (!year || !month || !day) {
    return dateInput;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
};

export const formatFrenchMonth = (monthInput: string) => {
  const [year, month] = monthInput.split("-").map(Number);
  if (!year || !month) {
    return monthInput;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, 1));
};

export const accountNormalSide: Record<AccountType, "debit" | "credit"> = {
  actif: "debit",
  dépense: "debit",
  passif: "credit",
  "capitaux propres": "credit",
  revenu: "credit"
};

export const accountTypeLabels: Record<AccountType, string> = {
  actif: "Actif (Asset)",
  passif: "Passif (Liability)",
  "capitaux propres": "Capitaux propres (Equity)",
  revenu: "Revenu (Revenue)",
  dépense: "Dépense (Expense)"
};

export const calculateAccountBalances = (transactions: Transaction[]) => {
  const balances = new Map<string, { account: string; accountType: AccountType; debit: number; credit: number; balance: number }>();

  transactions.forEach((transaction) => {
    transaction.generated.journal.forEach((line) => {
      const current = balances.get(line.account) ?? {
        account: line.account,
        accountType: line.accountType,
        debit: 0,
        credit: 0,
        balance: 0
      };
      current.debit += line.debit;
      current.credit += line.credit;
      current.balance =
        accountNormalSide[line.accountType] === "debit"
          ? current.debit - current.credit
          : current.credit - current.debit;
      balances.set(line.account, current);
    });
  });

  return Array.from(balances.values()).sort((a, b) => a.account.localeCompare(b.account, "fr"));
};

export const calculateSummary = (transactions: Transaction[], monthKey: string | null = getMonthKey()) => {
  const balances = calculateAccountBalances(transactions);
  const monthly = monthKey ? transactions.filter((transaction) => transaction.date.startsWith(monthKey)) : transactions;
  const monthlyLines = monthly.flatMap((transaction) => transaction.generated.journal);

  const revenue = sum(
    monthlyLines.filter((line) => line.accountType === "revenu").map((line) => line.credit - line.debit)
  );
  const expenses = sum(
    monthlyLines.filter((line) => line.accountType === "dépense").map((line) => line.debit - line.credit)
  );
  const cash = balances.find((balance) => balance.account === "Encaisse (Cash)")?.balance ?? 0;
  const liabilities = sum(balances.filter((balance) => balance.accountType === "passif").map((balance) => balance.balance));
  const assets = sum(balances.filter((balance) => balance.accountType === "actif").map((balance) => balance.balance));
  const equityAccounts = sum(
    balances.filter((balance) => balance.accountType === "capitaux propres").map((balance) => balance.balance)
  );
  const retainedEarnings =
    sum(balances.filter((balance) => balance.accountType === "revenu").map((balance) => balance.balance)) -
    sum(balances.filter((balance) => balance.accountType === "dépense").map((balance) => balance.balance));

  return {
    cash,
    revenue,
    expenses,
    netIncome: revenue - expenses,
    liabilities,
    equity: equityAccounts + retainedEarnings,
    assets,
    retainedEarnings
  };
};

export const demoTransactions = (): Transaction[] => [
  createTransaction({
    date: formatLocalDateInput(),
    kind: "owner-investment",
    label: "Apport initial",
    amount: 2500,
    paymentMethod: "Virement",
    note: "Capital de départ"
  }),
  createTransaction({
    date: formatLocalDateInput(),
    kind: "client-payment",
    label: "Mission de conseil",
    amount: 900,
    category: "Revenus de service",
    paymentMethod: "Virement",
    partyName: "Client exemple",
    note: "Facture client payée"
  }),
  createTransaction({
    date: formatLocalDateInput(),
    kind: "cash-expense",
    label: "Abonnement logiciel",
    amount: 120,
    category: "Logiciels",
    paymentMethod: "Carte bancaire",
    note: "Outil de gestion"
  })
];

export const createSampleTransactions = (): Transaction[] => [
  createTransaction({
    date: formatLocalDateInput(),
    kind: "owner-investment",
    label: "Investissement du propriétaire",
    amount: 100000,
    category: "",
    paymentMethod: "Virement",
    partyName: "Propriétaire",
    note: "Transaction d'exemple",
    isSample: true
  }),
  createTransaction({
    date: formatLocalDateInput(),
    kind: "client-payment",
    label: "Assemblage meuble",
    amount: 25000,
    category: "Revenus de service",
    paymentMethod: "Mobile Money",
    partyName: "Client exemple",
    note: "Transaction d'exemple",
    isSample: true
  }),
  createTransaction({
    date: formatLocalDateInput(),
    kind: "cash-expense",
    label: "Essence déplacement",
    amount: 5000,
    category: "Essence / déplacement",
    paymentMethod: "Espèces",
    partyName: "Station-service",
    note: "Transaction d'exemple",
    isSample: true
  }),
  createTransaction({
    date: formatLocalDateInput(),
    kind: "equipment-purchase",
    label: "Perceuse",
    amount: 40000,
    category: "Outils",
    paymentMethod: "Carte bancaire",
    partyName: "Fournisseur quincaillerie",
    note: "Transaction d'exemple",
    isSample: true
  }),
  createTransaction({
    date: formatLocalDateInput(),
    kind: "client-payment",
    label: "Installation étagère",
    amount: 15000,
    category: "Revenus de service",
    paymentMethod: "Mobile Money",
    partyName: "Client exemple",
    note: "Transaction d'exemple",
    isSample: true
  })
];
