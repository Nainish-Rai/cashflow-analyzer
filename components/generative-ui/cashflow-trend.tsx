"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react";

interface CashflowTrendProps {
  totalRevenue: number;
  totalExpenses: number;
  totalNetCashflow: number;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    expenses: number;
    netCashflow: number;
  }>;
  averageMonthlyRevenue: number;
  averageMonthlyExpenses: number;
}

export function CashflowTrend({
  totalRevenue,
  totalExpenses,
  totalNetCashflow,
  period,
  dateRange,
  monthlyTrends,
  averageMonthlyRevenue,
  averageMonthlyExpenses,
}: CashflowTrendProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isPositive = totalNetCashflow >= 0;
  const trendColor = isPositive ? "text-emerald-400" : "text-red-400";
  const bgColor = isPositive
    ? "from-gray-900 via-gray-900 to-emerald-950/30"
    : "from-gray-900 via-gray-900 to-red-950/30";

  // Calculate trend direction
  const recentTrends = monthlyTrends.slice(-3);
  const trendDirection =
    recentTrends.length >= 2
      ? recentTrends[recentTrends.length - 1].netCashflow >
        recentTrends[0].netCashflow
        ? "up"
        : "down"
      : "stable";

  return (
    <Card
      className={`w-full max-w-4xl bg-gradient-to-br ${bgColor} border-gray-800/50`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className={`flex items-center gap-2 ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            Cashflow Trend Analysis
          </CardTitle>
          <Badge
            variant="secondary"
            className={
              isPositive
                ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/50"
                : "bg-red-950/50 text-red-300 border-red-800/50"
            }
          >
            {period.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
        <p
          className={`text-sm ${
            isPositive ? "text-emerald-400/80" : "text-red-400/80"
          }`}
        >
          Analysis from {formatDate(dateRange.startDate)} to{" "}
          {formatDate(dateRange.endDate)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-gray-300">
                Total Expenses
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm font-medium text-gray-300">
                Net Cashflow
              </span>
            </div>
            <p className={`text-2xl font-bold ${trendColor}`}>
              {formatCurrency(totalNetCashflow)}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Trend</span>
            </div>
            <div className="flex items-center gap-1">
              {trendDirection === "up" && (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              )}
              {trendDirection === "down" && (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  trendDirection === "up"
                    ? "text-emerald-400"
                    : trendDirection === "down"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {trendDirection === "up"
                  ? "Improving"
                  : trendDirection === "down"
                  ? "Declining"
                  : "Stable"}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        {monthlyTrends && monthlyTrends.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="font-semibold text-gray-300">Monthly Trends</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {monthlyTrends
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map((trend, index) => {
                    const monthlyIsPositive = trend.netCashflow >= 0;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {new Date(trend.month + "-01").toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "long" }
                            )}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>
                              Revenue: {formatCurrency(trend.revenue)}
                            </span>
                            <span>
                              Expenses: {formatCurrency(trend.expenses)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              monthlyIsPositive
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatCurrency(trend.netCashflow)}
                          </p>
                          <div className="flex items-center justify-end gap-1">
                            {monthlyIsPositive ? (
                              <TrendingUp className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Averages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Avg Monthly Revenue
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-400">
              {formatCurrency(averageMonthlyRevenue)}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Avg Monthly Expenses
              </span>
            </div>
            <p className="text-xl font-bold text-red-400">
              {formatCurrency(averageMonthlyExpenses)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
