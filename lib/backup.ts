import { BusinessProfile, isBusinessProfile } from "@/lib/businessProfile";
import { Transaction, formatLocalDateInput } from "@/lib/accounting";
import { Language, isLanguage } from "@/lib/i18n";
import { normalizeTransactionsWithReport } from "@/lib/useTransactions";

export type AppBackup = {
  app: "Ma Petite Compta";
  schemaVersion: 1;
  exportedAt: string;
  transactions: Transaction[];
  businessProfile: BusinessProfile;
  language?: Language;
  ignoredTransactionCount?: number;
};

export const createBackup = (transactions: Transaction[], businessProfile: BusinessProfile, language: Language): AppBackup => ({
  app: "Ma Petite Compta",
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  transactions,
  businessProfile,
  language
});

export const getBackupFilename = () => `ma-petite-compta-sauvegarde-${formatLocalDateInput()}.json`;

export const parseBackup = (value: unknown): AppBackup | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AppBackup>;
  const transactionsReport = normalizeTransactionsWithReport(candidate.transactions);
  const language = isLanguage(candidate.language) ? candidate.language : undefined;

  if (
    candidate.app !== "Ma Petite Compta" ||
    candidate.schemaVersion !== 1 ||
    typeof candidate.exportedAt !== "string" ||
    !transactionsReport ||
    !isBusinessProfile(candidate.businessProfile)
  ) {
    return null;
  }

  return {
    app: "Ma Petite Compta",
    schemaVersion: 1,
    exportedAt: candidate.exportedAt,
    transactions: transactionsReport.transactions,
    businessProfile: candidate.businessProfile,
    language,
    ignoredTransactionCount: transactionsReport.ignoredCount
  };
};
