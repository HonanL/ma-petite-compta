import { AccountType, PaymentMethod, StatementType, TransactionKind } from "@/lib/accounting";

export type Language = "fr" | "en";

export const defaultLanguage: Language = "fr";

export const isLanguage = (value: unknown): value is Language => value === "fr" || value === "en";

export const translations = {
  fr: {
    appName: "Ma Petite Compta",
    appSubtitle: "Comptabilité simple",
    language: "Langue",
    applicationMvp: "Application MVP",
    nav: {
      dashboard: "Tableau de bord",
      add: "Ajouter",
      reports: "Rapports",
      learn: "Apprentissage",
      profile: "Profil d'entreprise"
    },
    actions: {
      newTransaction: "Nouvelle transaction",
      saveTransaction: "Enregistrer la transaction",
      saveChanges: "Enregistrer les modifications",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      reset: "Réinitialiser",
      exportCsv: "Exporter les transactions en CSV",
      printReports: "Imprimer les rapports",
      exportBackup: "Exporter une sauvegarde",
      importBackup: "Importer une sauvegarde",
      addSamples: "Ajouter des exemples",
      removeSamples: "Supprimer les exemples",
      nextQuestion: "Question suivante",
      restartQuiz: "Recommencer le quiz"
    },
    dashboard: {
      title: "Tableau de bord",
      subtitle: "Vue rapide de votre petite entreprise avec les bases comptables visibles.",
      cash: "Argent sur la période",
      revenue: "Revenus de la période",
      expenses: "Dépenses de la période",
      netIncome: "Bénéfice net de la période",
      liabilities: "Dettes de la période",
      equity: "Capitaux propres de la période",
      recent: "Dernières transactions"
    },
    add: {
      title: "Ajouter une transaction",
      editTitle: "Modifier la transaction",
      subtitle: "Choisissez un scénario; l'application prépare l'écriture comptable automatiquement.",
      type: "Type de transaction",
      category: "Catégorie adaptée",
      date: "Date",
      amount: "Montant en FCFA",
      description: "Description",
      payment: "Méthode de paiement",
      party: "Client ou fournisseur facultatif",
      note: "Note facultative",
      categoryUnavailable: "Aucune catégorie recommandée pour ce type de transaction. La logique comptable reste inchangée.",
      categorySuggestion: "Suggestions pour le profil"
    },
    reports: {
      title: "Rapports",
      subtitle: "Trois rapports essentiels générés depuis vos écritures de journal.",
      income: "État des résultats",
      balance: "Bilan",
      trial: "Balance de vérification",
      periodShown: "Période affichée",
      accountingReports: "Rapports comptables",
      revenue: "Revenus",
      expenses: "Dépenses",
      netIncome: "Bénéfice net",
      totalAssets: "Total actifs",
      totalLiabilities: "Total passifs",
      retainedEarnings: "Bénéfices non répartis",
      totalEquity: "Total capitaux propres",
      liabilitiesPlusEquity: "Passifs + capitaux propres",
      account: "Compte",
      type: "Type",
      normalBalance: "Solde normal",
      debitBalance: "Solde débiteur",
      creditBalance: "Solde créditeur",
      totals: "Totaux",
      balanced: "Balance équilibrée",
      unbalanced: "Balance non équilibrée",
      totalDebits: "total des débits",
      totalCredits: "total des crédits",
      noAccount: "Aucun compte."
    },
    learn: {
      title: "Mode apprentissage",
      subtitle: "Des leçons courtes pour comprendre ce que chaque transaction fait à vos comptes.",
      quiz: "Quiz comptable",
      practice: "Pratiquez les bases",
      correct: "Correct.",
      incorrect: "Incorrect. La bonne réponse est",
      score: "Bonnes réponses",
      answered: "Répondues",
      success: "Réussite",
      question: "Question",
      of: "sur"
    },
    profile: {
      title: "Profil d'entreprise",
      subtitle: "Ce profil aide Ma Petite Compta à proposer des catégories adaptées à votre activité.",
      type: "Type de business",
      revenues: "Revenus proposés",
      expenses: "Dépenses proposées"
    },
    onboarding: {
      label: "Bienvenue",
      title: "Bienvenue dans Ma Petite Compta",
      text: "Commencez par choisir votre profil d'entreprise, puis ajoutez votre première transaction.",
      step1: "Étape 1: Choisissez votre profil d'entreprise",
      step2: "Étape 2: Ajoutez une transaction",
      step3: "Étape 3: Consultez vos rapports et apprenez la comptabilité",
      step1Text: "Ma Petite Compta proposera des catégories adaptées à votre activité.",
      step2Text: "Enregistrez un revenu, une dépense, un investissement ou un achat.",
      step3Text: "Vos écritures alimentent automatiquement le tableau de bord et les rapports."
    },
    periods: {
      all: "Toutes les transactions",
      "current-month": "Ce mois-ci",
      "last-month": "Mois dernier",
      "current-year": "Cette année",
      custom: "Période personnalisée",
      start: "Date de début",
      end: "Date de fin"
    },
    empty: "Aucune transaction pour cette période. Ajoutez une transaction ou changez le filtre de période.",
    storage: "Stockage",
    localStorage: "Les données restent dans ce navigateur avec localStorage.",
    profileLabel: "Profil",
    sampleBadge: "Exemple",
    loading: "Chargement...",
    sampleDataTitle: "Données d'exemple",
    sampleDataText: "Ajoutez quelques transactions fictives pour tester les rapports sans modifier vos données réelles.",
    chooseProfile: "Choisir le profil",
    viewReports: "Voir les rapports",
    transactionDetails: {
      category: "Catégorie",
      payment: "Paiement",
      party: "Client/fournisseur",
      note: "Note",
      explanation: "Explication automatique",
      changed: "Ce que la transaction change",
      affectedAccounts: "Comptes affectés",
      verification: "Vérification",
      equal: "Total des débits = total des crédits",
      notEqual: "Les totaux ne sont pas équilibrés",
      statements: "États financiers affectés"
    },
    confirmations: {
      clearAll: "Êtes-vous sûr de vouloir supprimer toutes les transactions ? Cette action est irréversible.",
      deleteOne: "Supprimer la transaction",
      irreversible: "Cette action est irréversible.",
      importBackup: "Importer cette sauvegarde remplacera vos données actuelles. Voulez-vous continuer ?"
    },
    messages: {
      backupExported: "La sauvegarde a été exportée.",
      invalidBackup: "Ce fichier n'est pas une sauvegarde valide de Ma Petite Compta.",
      backupImported: "La sauvegarde a été importée avec succès.",
      invalidJson: "Impossible de lire ce fichier. Vérifiez qu'il contient un JSON valide."
    },
    accountTypes: {
      actif: "Actif",
      passif: "Passif",
      "capitaux propres": "Capitaux propres",
      revenu: "Revenu",
      dépense: "Dépense"
    } satisfies Record<AccountType, string>,
    sides: {
      debit: "Débit",
      credit: "Crédit"
    }
  },
  en: {
    appName: "Ma Petite Compta",
    appSubtitle: "Simple accounting",
    language: "Language",
    applicationMvp: "MVP app",
    nav: {
      dashboard: "Dashboard",
      add: "Add",
      reports: "Reports",
      learn: "Learn",
      profile: "Business profile"
    },
    actions: {
      newTransaction: "New transaction",
      saveTransaction: "Save transaction",
      saveChanges: "Save changes",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      reset: "Reset",
      exportCsv: "Export transactions as CSV",
      printReports: "Print reports",
      exportBackup: "Export backup",
      importBackup: "Import backup",
      addSamples: "Add examples",
      removeSamples: "Remove examples",
      nextQuestion: "Next question",
      restartQuiz: "Restart quiz"
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "A quick view of your small business with accounting basics visible.",
      cash: "Cash for the period",
      revenue: "Revenue for the period",
      expenses: "Expenses for the period",
      netIncome: "Net income for the period",
      liabilities: "Liabilities for the period",
      equity: "Owner's equity for the period",
      recent: "Recent transactions"
    },
    add: {
      title: "Add transaction",
      editTitle: "Edit transaction",
      subtitle: "Choose a scenario; the app prepares the accounting entry automatically.",
      type: "Transaction type",
      category: "Suggested category",
      date: "Date",
      amount: "Amount in FCFA",
      description: "Description",
      payment: "Payment method",
      party: "Optional client or supplier",
      note: "Optional notes",
      categoryUnavailable: "No suggested category for this transaction type. The accounting logic stays unchanged.",
      categorySuggestion: "Suggestions for profile"
    },
    reports: {
      title: "Reports",
      subtitle: "Three essential reports generated from your journal entries.",
      income: "Income Statement",
      balance: "Balance Sheet",
      trial: "Trial Balance",
      periodShown: "Displayed period",
      accountingReports: "Accounting reports",
      revenue: "Revenue",
      expenses: "Expenses",
      netIncome: "Net income",
      totalAssets: "Total assets",
      totalLiabilities: "Total liabilities",
      retainedEarnings: "Retained earnings",
      totalEquity: "Total equity",
      liabilitiesPlusEquity: "Liabilities + equity",
      account: "Account",
      type: "Type",
      normalBalance: "Normal balance",
      debitBalance: "Debit balance",
      creditBalance: "Credit balance",
      totals: "Totals",
      balanced: "Balanced trial balance",
      unbalanced: "Unbalanced trial balance",
      totalDebits: "total debits",
      totalCredits: "total credits",
      noAccount: "No account."
    },
    learn: {
      title: "Learn mode",
      subtitle: "Short lessons to understand what each transaction does to your accounts.",
      quiz: "Accounting quiz",
      practice: "Practice the basics",
      correct: "Correct.",
      incorrect: "Incorrect. The correct answer is",
      score: "Correct answers",
      answered: "Answered",
      success: "Success",
      question: "Question",
      of: "of"
    },
    profile: {
      title: "Business profile",
      subtitle: "This profile helps Ma Petite Compta suggest categories that fit your activity.",
      type: "Business type",
      revenues: "Suggested revenue categories",
      expenses: "Suggested expense categories"
    },
    onboarding: {
      label: "Welcome",
      title: "Welcome to Ma Petite Compta",
      text: "Start by choosing your business profile, then add your first transaction.",
      step1: "Step 1: Choose your business profile",
      step2: "Step 2: Add a transaction",
      step3: "Step 3: Review your reports and learn accounting",
      step1Text: "Ma Petite Compta will suggest categories that fit your activity.",
      step2Text: "Record revenue, expenses, investments, or purchases.",
      step3Text: "Your entries automatically feed the dashboard and reports."
    },
    periods: {
      all: "All transactions",
      "current-month": "This month",
      "last-month": "Last month",
      "current-year": "This year",
      custom: "Custom period",
      start: "Start date",
      end: "End date"
    },
    empty: "No transactions for this period. Add a transaction or change the period filter.",
    storage: "Storage",
    localStorage: "Data stays in this browser with localStorage.",
    profileLabel: "Profile",
    sampleBadge: "Example",
    loading: "Loading...",
    sampleDataTitle: "Example data",
    sampleDataText: "Add a few sample transactions to test reports without changing your real data.",
    chooseProfile: "Choose profile",
    viewReports: "View reports",
    transactionDetails: {
      category: "Category",
      payment: "Payment",
      party: "Client/supplier",
      note: "Note",
      explanation: "Automatic explanation",
      changed: "What the transaction changes",
      affectedAccounts: "Affected accounts",
      verification: "Verification",
      equal: "Total debits = total credits",
      notEqual: "The totals are not balanced",
      statements: "Affected financial statements"
    },
    confirmations: {
      clearAll: "Are you sure you want to delete all transactions? This action is irreversible.",
      deleteOne: "Delete transaction",
      irreversible: "This action is irreversible.",
      importBackup: "Importing this backup will replace your current data. Do you want to continue?"
    },
    messages: {
      backupExported: "The backup has been exported.",
      invalidBackup: "This file is not a valid Ma Petite Compta backup.",
      backupImported: "The backup was imported successfully.",
      invalidJson: "Unable to read this file. Check that it contains valid JSON."
    },
    accountTypes: {
      actif: "Asset",
      passif: "Liability",
      "capitaux propres": "Owner's Equity",
      revenu: "Revenue",
      dépense: "Expense"
    } satisfies Record<AccountType, string>,
    sides: {
      debit: "Debit",
      credit: "Credit"
    }
  }
};

export const accountNameTranslations: Record<string, Record<Language, string>> = {
  "Encaisse (Cash)": { fr: "Caisse", en: "Cash" },
  "Comptes fournisseurs (Accounts Payable)": { fr: "Comptes fournisseurs", en: "Accounts Payable" },
  "Capital du propriétaire (Owner's Capital)": { fr: "Capital du propriétaire", en: "Owner's Capital" },
  "Retraits du propriétaire (Owner's Drawings)": { fr: "Retraits du propriétaire", en: "Owner's Drawings" },
  "Revenus de services (Service Revenue)": { fr: "Revenus de service", en: "Service Revenue" },
  "Dépenses générales (General Expense)": { fr: "Dépense générale", en: "General Expense" },
  "Équipement (Equipment)": { fr: "Équipement", en: "Equipment" },
  "Fournitures (Supplies)": { fr: "Fournitures", en: "Supplies" },
  "Emprunt bancaire (Bank Loan)": { fr: "Emprunt bancaire", en: "Bank Loan" }
};

export const statementNameTranslations: Record<StatementType, Record<Language, string>> = {
  "État des résultats (Income Statement)": { fr: "État des résultats", en: "Income Statement" },
  "Bilan (Balance Sheet)": { fr: "Bilan", en: "Balance Sheet" },
  "Balance de vérification (Trial Balance)": { fr: "Balance de vérification", en: "Trial Balance" }
};

export const paymentMethodLabels: Record<PaymentMethod, Record<Language, string>> = {
  Espèces: { fr: "Espèces", en: "Cash" },
  "Carte bancaire": { fr: "Carte bancaire", en: "Bank card" },
  "Mobile Money": { fr: "Mobile Money", en: "Mobile Money" },
  Virement: { fr: "Virement", en: "Bank transfer" },
  Chèque: { fr: "Chèque", en: "Check" },
  "Plateforme en ligne": { fr: "Plateforme en ligne", en: "Online platform" },
  Autre: { fr: "Autre", en: "Other" }
};

export const translateAccountName = (account: string, language: Language) =>
  accountNameTranslations[account]?.[language] ?? account;

export const translatePaymentMethod = (method: PaymentMethod, language: Language) =>
  paymentMethodLabels[method]?.[language] ?? method;

export const translateStatementName = (statement: StatementType, language: Language) =>
  statementNameTranslations[statement]?.[language] ?? statement;

export const transactionKindLabels: Record<TransactionKind, Record<Language, string>> = {
  "owner-investment": { fr: "Investissement du propriétaire", en: "Owner investment" },
  "client-payment": { fr: "Paiement reçu d'un client", en: "Client payment" },
  "cash-expense": { fr: "Dépense payée en argent", en: "Cash expense" },
  "equipment-purchase": { fr: "Achat d'équipement", en: "Equipment purchase" },
  "supplies-credit": { fr: "Achat de fournitures à crédit", en: "Supplies bought on credit" },
  "supplier-payment": { fr: "Paiement d'un fournisseur", en: "Supplier payment" },
  "owner-withdrawal": { fr: "Retrait du propriétaire", en: "Owner withdrawal" },
  "bank-loan": { fr: "Emprunt bancaire", en: "Bank loan" }
};
