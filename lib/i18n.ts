import { AccountType, PaymentMethod, StatementType, TransactionKind } from "@/lib/accounting";

export type Language = "fr" | "en";

export const defaultLanguage: Language = "fr";

export const isLanguage = (value: unknown): value is Language => value === "fr" || value === "en";

export const translations = {
  fr: {
    appName: "Ma Petite Compta",
    appSubtitle: "Comptabilité simple",
    heroTagline: "La comptabilité simple pour apprendre et gérer votre petit business.",
    language: "Langue",
    applicationMvp: "Application MVP",
    nav: {
      dashboard: "Tableau de bord",
      add: "Ajouter",
      transactions: "Transactions",
      reports: "Rapports",
      learn: "Apprentissage",
      profile: "Profil d'entreprise",
      settings: "Paramètres"
    },
    mobileMenu: {
      menu: "Menu",
      close: "Fermer",
      dashboard: "Accueil",
      transactions: "Transactions",
      add: "Ajouter",
      reports: "Rapports",
      learn: "Apprendre",
      settings: "Paramètres"
    },
    landing: {
      eyebrow: "Bienvenue",
      start: "Commencer",
      addTransaction: "Ajouter une transaction",
      benefitsTitle: "Gérez votre activité simplement",
      benefits: {
        transactions: "Enregistrez vos transactions",
        journal: "Comprenez vos écritures comptables",
        reports: "Consultez vos rapports"
      }
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
      cash: "Argent disponible",
      revenue: "Revenus de la période",
      expenses: "Dépenses de la période",
      netIncome: "Bénéfice net de la période",
      liabilities: "Dettes",
      equity: "Capitaux propres",
      recent: "Dernières transactions",
      filterClarification: "Les revenus, dépenses et bénéfice net affichent la période sélectionnée. Les soldes affichent la situation cumulée."
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
      categorySuggestion: "Suggestions pour le profil",
      mainInfo: "Informations principales",
      paymentDetails: "Détails de paiement",
      notesSection: "Notes",
      editMode: "Mode modification",
      descriptionPlaceholder: "Ex: Assemblage meuble IKEA, Achat essence",
      amountPlaceholder: "Ex: 25 000",
      partyPlaceholder: "Ex: Client Dupont, Fournisseur quincaillerie",
      notePlaceholder: "Détail utile pour vous relire plus tard"
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
      step3Text: "Vos écritures alimentent automatiquement le tableau de bord et les rapports.",
      sampleTitle: "Vous voulez tester sans risque ?",
      sampleText: "Ajoutez des exemples fictifs pour voir le tableau de bord, les rapports et la balance de vérification se remplir.",
      sampleActive: "Des exemples sont actifs. Vous pouvez les supprimer quand vous êtes prêt à utiliser vos vraies données."
    },
    emptyStates: {
      dashboardTitle: "Votre tableau de bord est prêt.",
      dashboardText: "Ajoutez une transaction ou utilisez les données d'exemple pour voir vos chiffres apparaître.",
      transactionsTitle: "Aucune transaction à afficher.",
      transactionsText: "Ajoutez votre première transaction, utilisez les exemples ou changez le filtre de période.",
      reportsTitle: "Vos rapports apparaîtront ici.",
      reportsText: "Ajoutez une transaction ou des exemples pour générer l'état des résultats, le bilan et la balance de vérification.",
      learnTitle: "Apprenez pendant que vous pratiquez.",
      learnText: "Commencez par une leçon courte, puis testez-vous avec le quiz comptable."
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
    empty: "Aucune transaction pour cette période.",
    emptyHelp: "Ajoutez votre première transaction pour voir vos rapports, ou utilisez les données d'exemple pour tester l'application.",
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
      invalidJson: "Impossible de lire ce fichier. Vérifiez qu'il contient un JSON valide.",
      ignoredInvalidTransactions: "Certaines transactions invalides ont été ignorées."
    },
    warnings: {
      supplierOverpayment: "Attention: ce paiement dépasse le solde actuel des comptes fournisseurs.",
      negativeCash: "Attention: cette transaction peut rendre votre encaisse négative."
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
    heroTagline: "Simple accounting to learn and manage your small business.",
    language: "Language",
    applicationMvp: "MVP app",
    nav: {
      dashboard: "Dashboard",
      add: "Add",
      transactions: "Transactions",
      reports: "Reports",
      learn: "Learn",
      profile: "Business profile",
      settings: "Settings"
    },
    mobileMenu: {
      menu: "Menu",
      close: "Close",
      dashboard: "Home",
      transactions: "Transactions",
      add: "Add",
      reports: "Reports",
      learn: "Learn",
      settings: "Settings"
    },
    landing: {
      eyebrow: "Welcome",
      start: "Get Started",
      addTransaction: "Add a transaction",
      benefitsTitle: "Manage your activity simply",
      benefits: {
        transactions: "Record your transactions",
        journal: "Understand your journal entries",
        reports: "View your reports"
      }
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
      cash: "Cash available",
      revenue: "Revenue for the period",
      expenses: "Expenses for the period",
      netIncome: "Net income for the period",
      liabilities: "Liabilities",
      equity: "Owner's equity",
      recent: "Recent transactions",
      filterClarification: "Revenue, expenses, and net income show the selected period. Balances show the cumulative position."
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
      categorySuggestion: "Suggestions for profile",
      mainInfo: "Main information",
      paymentDetails: "Payment details",
      notesSection: "Notes",
      editMode: "Edit mode",
      descriptionPlaceholder: "Ex: IKEA furniture assembly, fuel purchase",
      amountPlaceholder: "Ex: 25 000",
      partyPlaceholder: "Ex: Client Dupont, hardware supplier",
      notePlaceholder: "Useful detail for later review"
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
      step3Text: "Your entries automatically feed the dashboard and reports.",
      sampleTitle: "Want to test safely?",
      sampleText: "Add fictional examples to see the dashboard, reports, and trial balance fill in.",
      sampleActive: "Examples are active. You can remove them when you are ready to use your real data."
    },
    emptyStates: {
      dashboardTitle: "Your dashboard is ready.",
      dashboardText: "Add a transaction or use example data to see your numbers appear.",
      transactionsTitle: "No transactions to show.",
      transactionsText: "Add your first transaction, use examples, or change the period filter.",
      reportsTitle: "Your reports will appear here.",
      reportsText: "Add a transaction or examples to generate the income statement, balance sheet, and trial balance.",
      learnTitle: "Learn while you practice.",
      learnText: "Start with a short lesson, then test yourself with the accounting quiz."
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
    empty: "No transactions for this period.",
    emptyHelp: "Add your first transaction to see reports, or use example data to test the app.",
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
      invalidJson: "Unable to read this file. Check that it contains valid JSON.",
      ignoredInvalidTransactions: "Some invalid transactions were ignored."
    },
    warnings: {
      supplierOverpayment: "Warning: this payment exceeds the current accounts payable balance.",
      negativeCash: "Warning: this transaction may make your cash balance negative."
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

export const businessProfileTranslations: Record<string, Record<Language, string>> = {
  "Assemblage de meubles": { fr: "Assemblage de meubles", en: "Furniture assembly" },
  Nettoyage: { fr: "Nettoyage", en: "Cleaning" },
  Livraison: { fr: "Livraison", en: "Delivery" },
  "Services informatiques": { fr: "Services informatiques", en: "IT services" },
  "Vente en ligne": { fr: "Vente en ligne", en: "Online sales" },
  Autre: { fr: "Autre", en: "Other" }
};

export const categoryTranslations: Record<string, Record<Language, string>> = {
  "Revenus de service": { fr: "Revenus de service", en: "Service revenue" },
  Pourboires: { fr: "Pourboires", en: "Tips" },
  "Frais de déplacement facturés": { fr: "Frais de déplacement facturés", en: "Billed travel fees" },
  Outils: { fr: "Outils", en: "Tools" },
  Fournitures: { fr: "Fournitures", en: "Supplies" },
  "Essence / déplacement": { fr: "Essence / déplacement", en: "Fuel / travel" },
  Publicité: { fr: "Publicité", en: "Advertising" },
  Téléphone: { fr: "Téléphone", en: "Phone" },
  Assurance: { fr: "Assurance", en: "Insurance" },
  "Frais de plateforme": { fr: "Frais de plateforme", en: "Platform fees" },
  "Contrats réguliers": { fr: "Contrats réguliers", en: "Regular contracts" },
  "Produits de nettoyage": { fr: "Produits de nettoyage", en: "Cleaning products" },
  Transport: { fr: "Transport", en: "Transportation" },
  Équipement: { fr: "Équipement", en: "Equipment" },
  "Revenus de livraison": { fr: "Revenus de livraison", en: "Delivery revenue" },
  Bonus: { fr: "Bonus", en: "Bonus" },
  Essence: { fr: "Essence", en: "Fuel" },
  "Entretien véhicule": { fr: "Entretien véhicule", en: "Vehicle maintenance" },
  Consultation: { fr: "Consultation", en: "Consulting" },
  "Support technique": { fr: "Support technique", en: "Technical support" },
  Logiciels: { fr: "Logiciels", en: "Software" },
  "Matériel informatique": { fr: "Matériel informatique", en: "Computer hardware" },
  Internet: { fr: "Internet", en: "Internet" },
  Formation: { fr: "Formation", en: "Training" },
  "Ventes de produits": { fr: "Ventes de produits", en: "Product sales" },
  "Frais d'expédition facturés": { fr: "Frais d'expédition facturés", en: "Billed shipping fees" },
  Inventaire: { fr: "Inventaire", en: "Inventory" },
  Emballage: { fr: "Emballage", en: "Packaging" },
  Expédition: { fr: "Expédition", en: "Shipping" },
  Ventes: { fr: "Ventes", en: "Sales" }
};

export const translateBusinessProfileName = (profile: string, language: Language) =>
  businessProfileTranslations[profile]?.[language] ?? profile;

export const translateCategoryName = (category: string, language: Language) =>
  categoryTranslations[category]?.[language] ?? category;

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
