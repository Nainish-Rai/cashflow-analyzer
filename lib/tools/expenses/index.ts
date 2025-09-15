import { tool } from "ai";
import { z } from "zod";
import { PrismaClient } from "../../generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { decimalToNumber, getDateRange } from "../../shared/utils";

const prisma = new PrismaClient();

export const getExpenseSummaryTool = tool({
  description:
    "Get comprehensive expense analysis including categories and trends",
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
    groupBy: z
      .enum(["category", "month", "vendor"])
      .default("category")
      .describe("How to group the expense data"),
  }),
  execute: async ({ period = "last_90_days", startDate, endDate, groupBy }) => {
    const { startDate: calculatedStartDate, endDate: calculatedEndDate } =
      getDateRange(period, startDate, endDate);

    // Get total expenses
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
      _count: {
        _all: true,
      },
      _avg: {
        amount: true,
      },
    });

    // Get recurring vs one-time expenses
    const recurringExpenses = await prisma.expenseTransaction.aggregate({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
        isRecurring: true,
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    // Get expenses by grouping
    let groupedExpenses;
    if (groupBy === "category") {
      groupedExpenses = await prisma.expenseTransaction.groupBy({
        by: ["category"],
        where: {
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
      });
    } else if (groupBy === "month") {
      const transactions = await prisma.expenseTransaction.findMany({
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

      // Group by month manually
      const monthlyData = transactions.reduce((acc, transaction) => {
        const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { amount: 0, count: 0 };
        }
        acc[month].amount += decimalToNumber(transaction.amount);
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

      groupedExpenses = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        _sum: { amount: data.amount },
        _count: { _all: data.count },
      }));
    } else {
      groupedExpenses = await prisma.expenseTransaction.groupBy({
        by: ["vendor"],
        where: {
          date: {
            gte: calculatedStartDate,
            lte: calculatedEndDate,
          },
          vendor: {
            not: null,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      });
    }

    return {
      period: startDate || endDate ? "custom" : period,
      dateRange: { startDate: calculatedStartDate, endDate: calculatedEndDate },
      totalExpenses: totalExpenses._sum.amount
        ? decimalToNumber(totalExpenses._sum.amount)
        : 0,
      totalTransactions: totalExpenses._count._all,
      averageTransactionAmount: totalExpenses._avg.amount
        ? decimalToNumber(totalExpenses._avg.amount)
        : 0,
      recurringExpenses: {
        total: recurringExpenses._sum.amount
          ? decimalToNumber(recurringExpenses._sum.amount)
          : 0,
        count: recurringExpenses._count._all,
      },
      groupedData: groupedExpenses.map((item) => ({
        ...item,
        _sum: item._sum.amount
          ? { amount: decimalToNumber(item._sum.amount as Decimal) }
          : { amount: 0 },
      })),
    };
  },
});
