import { tool } from "ai";
import { z } from "zod";
import { PrismaClient } from "../../generated/prisma";
import { decimalToNumber, getDateRange } from "../../shared/utils";
import type { Anomaly, Transaction } from "../../shared/types";

const prisma = new PrismaClient();

// Tool: Calculate Profitability for Plan
export const calculateProfitabilityForPlanTool = tool({
  description:
    "Calculate detailed profitability metrics for a specific pricing plan",
  inputSchema: z.object({
    planId: z.string().describe("The pricing plan ID to analyze"),
    period: z
      .string()
      .optional()
      .describe(
        "Predefined time period: last_30_days, last_90_days, last_6_months, last_year, current_month, current_year, yesterday, last_week, last_month, last_quarter"
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        "Custom start date in YYYY-MM-DD format. Overrides period if provided."
      ),
    endDate: z
      .string()
      .optional()
      .describe(
        "Custom end date in YYYY-MM-DD format. Defaults to current date if not provided with startDate."
      ),
  }),
  execute: async ({ planId, period = "last_90_days", startDate, endDate }) => {
    const { startDate: calculatedStartDate, endDate: calculatedEndDate } =
      getDateRange(period, startDate, endDate);

    // Get revenue for this plan
    const planRevenue = await prisma.revenueTransaction.aggregate({
      where: {
        planId,
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
      _avg: {
        amount: true,
      },
    });

    // Get total company expenses (allocated proportionally)
    const totalExpenses = await prisma.expenseTransaction.aggregate({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get total company revenue for allocation calculation
    const totalRevenue = await prisma.revenueTransaction.aggregate({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const planRevenueAmount = planRevenue._sum.amount
      ? decimalToNumber(planRevenue._sum.amount)
      : 0;
    const totalRevenueAmount = totalRevenue._sum.amount
      ? decimalToNumber(totalRevenue._sum.amount)
      : 0;
    const totalExpenseAmount = totalExpenses._sum.amount
      ? decimalToNumber(totalExpenses._sum.amount)
      : 0;

    // Calculate allocated expenses (proportional to revenue share)
    const revenueShare =
      totalRevenueAmount > 0 ? planRevenueAmount / totalRevenueAmount : 0;
    const allocatedExpenses = totalExpenseAmount * revenueShare;

    // Calculate profitability metrics
    const profit = planRevenueAmount - allocatedExpenses;
    const profitMargin =
      planRevenueAmount > 0 ? (profit / planRevenueAmount) * 100 : 0;

    return {
      planId,
      period: startDate || endDate ? "custom" : period,
      dateRange: { startDate: calculatedStartDate, endDate: calculatedEndDate },
      revenue: planRevenueAmount,
      allocatedExpenses,
      profit,
      profitMargin,
      revenueShare: revenueShare * 100,
      transactionCount: planRevenue._count._all,
      averageTransactionAmount: planRevenue._avg.amount
        ? decimalToNumber(planRevenue._avg.amount)
        : 0,
    };
  },
});

// Tool: Calculate Cashflow Trend
export const calculateCashflowTrendTool = tool({
  description: "Analyze cashflow trends over time with monthly breakdown",
  inputSchema: z.object({
    period: z
      .string()
      .optional()
      .describe(
        "Predefined time period: last_30_days, last_90_days, last_6_months, last_year, current_month, current_year, yesterday, last_week, last_month, last_quarter"
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        "Custom start date in YYYY-MM-DD format. Overrides period if provided."
      ),
    endDate: z
      .string()
      .optional()
      .describe(
        "Custom end date in YYYY-MM-DD format. Defaults to current date if not provided with startDate."
      ),
  }),
  execute: async ({ period = "last_6_months", startDate, endDate }) => {
    const { startDate: calculatedStartDate, endDate: calculatedEndDate } =
      getDateRange(period, startDate, endDate);

    // Get monthly revenue
    const revenueTransactions = await prisma.revenueTransaction.findMany({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    // Get monthly expenses
    const expenseTransactions = await prisma.expenseTransaction.findMany({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    // Group by month
    const monthlyData: Record<
      string,
      { revenue: number; expenses: number; netCashflow: number }
    > = {};

    revenueTransactions.forEach((transaction) => {
      const month = transaction.date.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0, netCashflow: 0 };
      }
      monthlyData[month].revenue += decimalToNumber(transaction.amount);
    });

    expenseTransactions.forEach((transaction) => {
      const month = transaction.date.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0, netCashflow: 0 };
      }
      monthlyData[month].expenses += decimalToNumber(transaction.amount);
    });

    // Calculate net cashflow for each month
    Object.keys(monthlyData).forEach((month) => {
      monthlyData[month].netCashflow =
        monthlyData[month].revenue - monthlyData[month].expenses;
    });

    // Sort by month and calculate trends
    const sortedMonths = Object.keys(monthlyData).sort();
    const trends = sortedMonths.map((month) => ({
      month,
      ...monthlyData[month],
    }));

    // Calculate overall metrics
    const totalRevenue = Object.values(monthlyData).reduce(
      (sum, data) => sum + data.revenue,
      0
    );
    const totalExpenses = Object.values(monthlyData).reduce(
      (sum, data) => sum + data.expenses,
      0
    );
    const totalNetCashflow = totalRevenue - totalExpenses;

    return {
      period: startDate || endDate ? "custom" : period,
      dateRange: { startDate: calculatedStartDate, endDate: calculatedEndDate },
      totalRevenue,
      totalExpenses,
      totalNetCashflow,
      monthlyTrends: trends,
      averageMonthlyRevenue:
        trends.length > 0 ? totalRevenue / trends.length : 0,
      averageMonthlyExpenses:
        trends.length > 0 ? totalExpenses / trends.length : 0,
    };
  },
});

// Tool: Find Data Anomalies
export const findDataAnomaliesTool = tool({
  description: "Detect anomalies and unusual patterns in financial data",
  inputSchema: z.object({
    period: z
      .string()
      .optional()
      .describe(
        "Predefined time period: last_30_days, last_90_days, last_6_months, last_year, current_month, current_year, yesterday, last_week, last_month, last_quarter"
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        "Custom start date in YYYY-MM-DD format. Overrides period if provided."
      ),
    endDate: z
      .string()
      .optional()
      .describe(
        "Custom end date in YYYY-MM-DD format. Defaults to current date if not provided with startDate."
      ),
    sensitivity: z
      .enum(["low", "medium", "high"])
      .default("medium")
      .describe("Sensitivity level for anomaly detection"),
  }),
  execute: async ({
    period = "last_90_days",
    startDate,
    endDate,
    sensitivity,
  }) => {
    const { startDate: calculatedStartDate, endDate: calculatedEndDate } =
      getDateRange(period, startDate, endDate);

    // Get all transactions for analysis
    const revenueTransactions = await prisma.revenueTransaction.findMany({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
    });

    const expenseTransactions = await prisma.expenseTransaction.findMany({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
    });

    // Calculate statistics for anomaly detection
    const revenueAmounts = revenueTransactions.map((t) =>
      decimalToNumber(t.amount)
    );
    const expenseAmounts = expenseTransactions.map((t) =>
      decimalToNumber(t.amount)
    );

    const calculateStats = (amounts: number[]) => {
      if (amounts.length === 0) return { mean: 0, stdDev: 0 };
      const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const variance =
        amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) /
        amounts.length;
      const stdDev = Math.sqrt(variance);
      return { mean, stdDev };
    };

    const revenueStats = calculateStats(revenueAmounts);
    const expenseStats = calculateStats(expenseAmounts);

    // Set thresholds based on sensitivity
    const thresholdMultiplier =
      sensitivity === "low" ? 3 : sensitivity === "medium" ? 2 : 1.5;

    // Find anomalies
    const anomalies: Anomaly[] = [];

    // Revenue anomalies
    revenueTransactions.forEach((transaction) => {
      const amount = decimalToNumber(transaction.amount);
      if (
        Math.abs(amount - revenueStats.mean) >
        thresholdMultiplier * revenueStats.stdDev
      ) {
        anomalies.push({
          type: "revenue",
          transactionId: transaction.id,
          amount,
          date: transaction.date,
          planId: transaction.planId,
          deviation: Math.abs(amount - revenueStats.mean) / revenueStats.stdDev,
          description:
            amount > revenueStats.mean
              ? "Unusually high revenue"
              : "Unusually low revenue",
        });
      }
    });

    // Expense anomalies
    expenseTransactions.forEach((transaction) => {
      const amount = decimalToNumber(transaction.amount);
      if (
        Math.abs(amount - expenseStats.mean) >
        thresholdMultiplier * expenseStats.stdDev
      ) {
        anomalies.push({
          type: "expense",
          transactionId: transaction.id,
          amount,
          date: transaction.date,
          category: transaction.category,
          deviation: Math.abs(amount - expenseStats.mean) / expenseStats.stdDev,
          description:
            amount > expenseStats.mean
              ? "Unusually high expense"
              : "Unusually low expense",
        });
      }
    });

    // Check for missing data patterns (gaps in transactions)
    const checkForGaps = (
      transactions: Transaction[],
      type: string
    ): Anomaly[] => {
      const dates = transactions
        .map((t) => t.date)
        .sort((a, b) => a.getTime() - b.getTime());
      const gaps: Anomaly[] = [];

      for (let i = 1; i < dates.length; i++) {
        const daysDiff =
          (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 7) {
          // More than 7 days gap
          gaps.push({
            type: "data_gap",
            category: type,
            startDate: dates[i - 1],
            endDate: dates[i],
            daysMissing: Math.floor(daysDiff),
            description: `${Math.floor(daysDiff)} day gap in ${type} data`,
          });
        }
      }
      return gaps;
    };

    const revenueGaps = checkForGaps(
      revenueTransactions as Transaction[],
      "revenue"
    );
    const expenseGaps = checkForGaps(
      expenseTransactions as Transaction[],
      "expenses"
    );

    return {
      period: startDate || endDate ? "custom" : period,
      dateRange: { startDate: calculatedStartDate, endDate: calculatedEndDate },
      sensitivity,
      anomaliesFound:
        anomalies.length + revenueGaps.length + expenseGaps.length,
      statistics: {
        revenue: revenueStats,
        expenses: expenseStats,
      },
      anomalies: [...anomalies, ...revenueGaps, ...expenseGaps].sort((a, b) => {
        const dateA = a.type === "data_gap" ? a.endDate : a.date;
        const dateB = b.type === "data_gap" ? b.endDate : b.date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }),
    };
  },
});
