import { Decimal } from "@prisma/client/runtime/library";

export interface DateRangeParams {
  period?: string;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface BaseResponse {
  period: string;
  dateRange: DateRange;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionAmount: number;
}

export interface ExpenseMetrics {
  totalExpenses: number;
  totalTransactions: number;
  averageTransactionAmount: number;
}

export interface PlanSummary {
  planId: string;
  totalRevenue: number;
  transactionCount: number;
  averageTransactionAmount: number;
}

export interface GroupedData {
  _sum: { amount: number };
  _count: { _all: number };
}

// Anomaly detection types
export interface TransactionAnomaly {
  type: "revenue" | "expense";
  transactionId: string;
  amount: number;
  date: Date;
  planId?: string;
  category?: string;
  deviation: number;
  description: string;
}

export interface DataGapAnomaly {
  type: "data_gap";
  category: string;
  startDate: Date;
  endDate: Date;
  daysMissing: number;
  description: string;
}

export type Anomaly = TransactionAnomaly | DataGapAnomaly;

export interface Transaction {
  id: string;
  amount: Decimal;
  date: Date;
  planId?: string;
  category?: string;
}
