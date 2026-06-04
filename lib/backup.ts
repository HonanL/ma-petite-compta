import { BusinessProfile, isBusinessProfile } from "@/lib/businessProfile";
import { Transaction, formatLocalDateInput } from "@/lib/accounting";
import { normalizeTransactions } from "@/lib/useTransactions";

export type AppBackup = {
  app: "Ma Petite Compta";
  schemaVersion: 1;
  exportedAt: string;
  transactions: Transaction[];
  businessProfile: BusinessProfile;
};

export const createBackup = (transactions: Transaction[], businessProfile: BusinessProfile): AppBackup => ({
  app: "Ma Petite Compta",
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  transactions,
  businessProfile
});

export const getBackupFilename = () => `ma-petite-compta-sauvegarde-${formatLocalDateInput()}.json`;

export const parseBackup = (value: unknown): AppBackup | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AppBackup>;
  const transactions = normalizeTransactions(candidate.transactions);

  if (
    candidate.app !== "Ma Petite Compta" ||
    candidate.schemaVersion !== 1 ||
    typeof candidate.exportedAt !== "string" ||
    !transactions ||
    !isBusinessProfile(candidate.businessProfile)
  ) {
    return null;
  }

  return {
    app: "Ma Petite Compta",
    schemaVersion: 1,
    exportedAt: candidate.exportedAt,
    transactions,
    businessProfile: candidate.businessProfile
  };
};
