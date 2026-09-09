export type { ApiResponse, ApiErrorPayload, PaginationMeta, Paginated } from "./api";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type CategoryType = "INCOME" | "EXPENSE";
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type BudgetPeriod = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface User {
  publicId: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface Wallet {
  publicId: string;
  name: string;
  balance: number;
  currency: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  publicId: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  publicId: string;
  type: TransactionType;
  title: string;
  amount: number;
  note: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  wallet: { publicId: string; name: string; currency: string };
  category: {
    publicId: string;
    name: string;
    icon: string | null;
    color: string | null;
    type: CategoryType;
  } | null;
}

export interface Budget {
  publicId: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  walletId: string | null;
  categoryId: string | null;
}

export interface SavingsContribution {
  publicId: string;
  amount: number;
  note: string | null;
  contributionDate: string;
  createdAt: string;
  updatedAt: string;
  savingsGoal: { publicId: string; name: string };
  wallet: { publicId: string; name: string; currency: string } | null;
}

export interface SavingsGoal {
  publicId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  isAchieved: boolean;
  contributions: SavingsContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  publicId: string;
  title: string;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  interval: number;
  nextRunDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  wallet: { publicId: string; name: string };
  category: {
    publicId: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

export interface Attachment {
  publicId: string;
  transactionId: string | null;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: string;
  createdAt: string;
}
