import { tool } from "ai";
import { z } from "zod";
import { PrismaClient } from "../../generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { decimalToNumber, getDateRange } from "../../shared/utils";
import type { PlanSummary } from "../../shared/types";

const prisma = new PrismaClient();

// Tool 1: List Pricing Plans
export const listPricingPlansTool = tool({
  description: "Get a list of all pricing plans with basic statistics",
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
  execute: async ({ period = "last_90_days", startDate, endDate }) => {
    const { startDate: calculatedStartDate, endDate: calculatedEndDate } =
      getDateRange(period, startDate, endDate);

    const plans = await prisma.revenueTransaction.groupBy({
      by: ["planId"],
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

    return {
      period: startDate || endDate ? "custom" : period,
      dateRange: { startDate: calculatedStartDate, endDate: calculatedEndDate },
      totalPlans: plans.length,
      plans: plans.map(
        (plan): PlanSummary => ({
          planId: plan.planId,
          totalRevenue: plan._sum.amount
            ? decimalToNumber(plan._sum.amount)
            : 0,
          transactionCount: plan._count._all,
          averageTransactionAmount: plan._avg.amount
            ? decimalToNumber(plan._avg.amount)
            : 0,
        })
      ),
    };
  },
});

// Tool 2: Get Revenue Summary
export const getRevenueSummaryTool = tool({
  description:
    "Get comprehensive revenue analysis including trends and breakdowns",
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
      .enum(["plan", "month", "category"])
      .default("plan")
      .describe("How to group the revenue data"),
  }),
  execute: async ({ period = "last_90_days", startDate, endDate, groupBy }) => {
    const { startDate: calculatedStartDate, endDate: calculatedEndDate } =
      getDateRange(period, startDate, endDate);

    // Get total revenue
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
      _count: {
        _all: true,
      },
      _avg: {
        amount: true,
      },
    });

    // Get revenue by grouping
    let groupedRevenue;
    if (groupBy === "plan") {
      groupedRevenue = await prisma.revenueTransaction.groupBy({
        by: ["planId"],
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
      const transactions = await prisma.revenueTransaction.findMany({
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

      groupedRevenue = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        _sum: { amount: data.amount },
        _count: { _all: data.count },
      }));
    } else {
      groupedRevenue = await prisma.revenueTransaction.groupBy({
        by: ["category"],
        where: {
          date: {
            gte: calculatedStartDate,
            lte: calculatedEndDate,
          },
          category: {
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
      totalRevenue: totalRevenue._sum.amount
        ? decimalToNumber(totalRevenue._sum.amount)
        : 0,
      totalTransactions: totalRevenue._count._all,
      averageTransactionAmount: totalRevenue._avg.amount
        ? decimalToNumber(totalRevenue._avg.amount)
        : 0,
      groupedData: groupedRevenue.map((item) => ({
        ...item,
        _sum:
          item._sum.amount && item._sum.amount instanceof Decimal
            ? { amount: decimalToNumber(item._sum.amount) }
            : {
                amount:
                  typeof item._sum.amount === "number" ? item._sum.amount : 0,
              },
      })),
    };
  },
});
