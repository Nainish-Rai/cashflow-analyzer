import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { decimalToNumber, getDateRange } from "@/lib/shared/utils";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "last_90_days";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

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
      _sum: { amount: true },
      _count: { _all: true },
    });

    // Get total expenses
    const totalExpenses = await prisma.expenseTransaction.aggregate({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });

    // Get unique customers (active accounts)
    const activeAccounts = await prisma.revenueTransaction.findMany({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
        customerId: { not: null },
      },
      select: { customerId: true },
      distinct: ["customerId"],
    });

    // Get monthly trends for chart
    const monthlyRevenue = await prisma.revenueTransaction.groupBy({
      by: ["date"],
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      _sum: { amount: true },
    });

    const monthlyExpenses = await prisma.expenseTransaction.groupBy({
      by: ["date"],
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      _sum: { amount: true },
    });

    // Process monthly data for chart
    const monthlyData: Record<
      string,
      { revenue: number; expenses: number; netCashflow: number }
    > = {};

    monthlyRevenue.forEach((item) => {
      const month = item.date.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0, netCashflow: 0 };
      }
      monthlyData[month].revenue += item._sum.amount
        ? decimalToNumber(item._sum.amount)
        : 0;
    });

    monthlyExpenses.forEach((item) => {
      const month = item.date.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0, netCashflow: 0 };
      }
      monthlyData[month].expenses += item._sum.amount
        ? decimalToNumber(item._sum.amount)
        : 0;
    });

    // Calculate net cashflow for each month
    Object.keys(monthlyData).forEach((month) => {
      monthlyData[month].netCashflow =
        monthlyData[month].revenue - monthlyData[month].expenses;
    });

    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        date: month + "-01",
        revenue: data.revenue,
        expenses: data.expenses,
        netCashflow: data.netCashflow,
      }));

    // Get transaction data for table
    const recentTransactions = await prisma.revenueTransaction.findMany({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      take: 50,
      orderBy: { date: "desc" },
      select: {
        id: true,
        amount: true,
        date: true,
        planId: true,
        category: true,
        description: true,
        customerId: true,
      },
    });

    const recentExpenses = await prisma.expenseTransaction.findMany({
      where: {
        date: {
          gte: calculatedStartDate,
          lte: calculatedEndDate,
        },
      },
      take: 50,
      orderBy: { date: "desc" },
      select: {
        id: true,
        amount: true,
        date: true,
        category: true,
        description: true,
        vendor: true,
        isRecurring: true,
      },
    });

    // Combine and format transactions for table
    const tableData = [
      ...recentTransactions.map((t) => ({
        id: `rev-${t.id}`,
        type: "Revenue",
        amount: decimalToNumber(t.amount),
        date: t.date.toISOString().split("T")[0],
        category: t.category || t.planId,
        description: t.description || `Revenue from ${t.planId}`,
        status: "Completed",
        source: t.customerId || t.planId,
      })),
      ...recentExpenses.map((t) => ({
        id: `exp-${t.id}`,
        type: "Expense",
        amount: -decimalToNumber(t.amount),
        date: t.date.toISOString().split("T")[0],
        category: t.category,
        description: t.description || `Expense - ${t.category}`,
        status: t.isRecurring ? "Recurring" : "One-time",
        source: t.vendor || "Internal",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const revenueAmount = totalRevenue._sum.amount
      ? decimalToNumber(totalRevenue._sum.amount)
      : 0;
    const expenseAmount = totalExpenses._sum.amount
      ? decimalToNumber(totalExpenses._sum.amount)
      : 0;
    const netCashflow = revenueAmount - expenseAmount;

    return NextResponse.json({
      metrics: {
        totalRevenue: revenueAmount,
        totalExpenses: expenseAmount,
        netCashflow,
        activeAccounts: activeAccounts.length,
        growthRate: 15.2, // Calculate from historical data if needed
        anomaliesFound: 0,
        lastUpdated: new Date().toISOString(),
      },
      chartData,
      tableData: tableData.slice(0, 100), // Limit to 100 most recent
      period: {
        startDate: calculatedStartDate.toISOString(),
        endDate: calculatedEndDate.toISOString(),
        label: period,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
