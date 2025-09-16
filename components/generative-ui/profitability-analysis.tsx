"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

interface ProfitabilityAnalysisProps {
  planId: string;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  revenue: number;
  allocatedExpenses: number;
  profit: number;
  profitMargin: number;
  revenueShare: number;
  transactionCount: number;
  averageTransactionAmount: number;
}

export function ProfitabilityAnalysis({
  planId,
  period,
  dateRange,
  revenue,
  allocatedExpenses,
  profit,
  profitMargin,
  revenueShare,
  transactionCount,
  averageTransactionAmount,
}: ProfitabilityAnalysisProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isProfitable = profit >= 0;
  const profitabilityColor = isProfitable ? "text-emerald-400" : "text-red-400";
  const bgColor = isProfitable
    ? "from-gray-900 via-gray-900 to-emerald-950/30"
    : "from-gray-900 via-gray-900 to-red-950/30";
  const cardColor = isProfitable ? "text-emerald-400" : "text-red-400";

  // Determine performance level
  const getPerformanceLevel = (margin: number) => {
    if (margin >= 30)
      return {
        level: "Excellent",
        color: "bg-emerald-950/50 text-emerald-300 border-emerald-800/50",
      };
    if (margin >= 15)
      return {
        level: "Good",
        color: "bg-blue-950/50 text-blue-300 border-blue-800/50",
      };
    if (margin >= 5)
      return {
        level: "Fair",
        color: "bg-yellow-950/50 text-yellow-300 border-yellow-800/50",
      };
    if (margin >= 0)
      return {
        level: "Break-even",
        color: "bg-gray-700/50 text-gray-300 border-gray-600/50",
      };
    return {
      level: "Loss",
      color: "bg-red-950/50 text-red-300 border-red-800/50",
    };
  };

  const performance = getPerformanceLevel(profitMargin);

  return (
    <Card
      className={`w-full max-w-4xl bg-gradient-to-br ${bgColor} border-gray-800/50`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${cardColor}`}>
            <Target className="h-5 w-5" />
            Plan {planId} Profitability Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className={performance.color}>
              {performance.level}
            </Badge>
            <Badge
              variant="secondary"
              className={
                isProfitable
                  ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/50"
                  : "bg-red-950/50 text-red-300 border-red-800/50"
              }
            >
              {period.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </div>
        </div>
        <p
          className={`text-sm ${
            isProfitable ? "text-emerald-400/80" : "text-red-400/80"
          }`}
        >
          Analysis from {formatDate(dateRange.startDate)} to{" "}
          {formatDate(dateRange.endDate)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Revenue</span>
            </div>
            <p className="text-xl font-bold text-white">
              {formatCurrency(revenue)}
            </p>
            <p className="text-xs text-gray-400">
              {revenueShare.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-gray-300">
                Allocated Expenses
              </span>
            </div>
            <p className="text-xl font-bold text-white">
              {formatCurrency(allocatedExpenses)}
            </p>
            <p className="text-xs text-gray-400">Proportional allocation</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              {isProfitable ? (
                <DollarSign className="h-4 w-4 text-emerald-400" />
              ) : (
                <DollarSign className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm font-medium text-gray-300">
                Net Profit
              </span>
            </div>
            <p className={`text-xl font-bold ${profitabilityColor}`}>
              {formatCurrency(profit)}
            </p>
            <p className="text-xs text-gray-400">
              {isProfitable ? "Profitable" : "Loss-making"}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Profit Margin
              </span>
            </div>
            <p className={`text-xl font-bold ${profitabilityColor}`}>
              {profitMargin.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">
              Performance: {performance.level}
            </p>
          </div>
        </div>

        {/* Performance Visualization */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4">
          <h3 className="font-semibold text-gray-300 mb-4">
            Profitability Breakdown
          </h3>

          {/* Visual breakdown */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">
                  Revenue vs Expenses
                </span>
                <span className="text-sm text-gray-400">
                  {formatCurrency(revenue)} total
                </span>
              </div>
              <div className="h-8 bg-gray-700/50 rounded-lg overflow-hidden flex">
                <div
                  className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: revenue > 0 ? "100%" : "0%" }}
                >
                  Revenue
                </div>
              </div>
              <div className="h-8 bg-gray-700/50 rounded-lg overflow-hidden flex mt-2">
                <div
                  className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    width:
                      revenue > 0
                        ? `${(allocatedExpenses / revenue) * 100}%`
                        : "0%",
                  }}
                >
                  Expenses ({((allocatedExpenses / revenue) * 100).toFixed(1)}%)
                </div>
                <div
                  className={`${
                    isProfitable ? "bg-emerald-400" : "bg-red-600"
                  } flex items-center justify-center text-white text-xs font-medium`}
                  style={{
                    width:
                      revenue > 0
                        ? `${Math.abs(profit / revenue) * 100}%`
                        : "0%",
                  }}
                >
                  {isProfitable ? "Profit" : "Loss"} (
                  {Math.abs(profitMargin).toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Transaction details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Total Transactions
                  </p>
                  <p className="text-lg font-bold text-white">
                    {transactionCount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Average Transaction
                  </p>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(averageTransactionAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4">
          <h3 className="font-semibold text-gray-300 mb-3">Quick Insights</h3>
          <div className="space-y-2 text-sm">
            {profitMargin >= 30 && (
              <p className="text-emerald-300 bg-emerald-950/30 border border-emerald-800/50 p-2 rounded">
                🎉 Excellent performance! This plan is highly profitable with a{" "}
                {profitMargin.toFixed(1)}% margin.
              </p>
            )}
            {profitMargin >= 15 && profitMargin < 30 && (
              <p className="text-blue-300 bg-blue-950/30 border border-blue-800/50 p-2 rounded">
                👍 Good performance! This plan maintains healthy profitability.
              </p>
            )}
            {profitMargin >= 5 && profitMargin < 15 && (
              <p className="text-yellow-300 bg-yellow-950/30 border border-yellow-800/50 p-2 rounded">
                ⚠️ Fair performance. Consider optimizing pricing or reducing
                allocated costs.
              </p>
            )}
            {profitMargin >= 0 && profitMargin < 5 && (
              <p className="text-orange-300 bg-orange-950/30 border border-orange-800/50 p-2 rounded">
                🔄 Break-even territory. Immediate attention needed to improve
                profitability.
              </p>
            )}
            {profitMargin < 0 && (
              <p className="text-red-300 bg-red-950/30 border border-red-800/50 p-2 rounded">
                🚨 Loss-making plan. Consider repricing, cost reduction, or
                discontinuation.
              </p>
            )}
            <p className="text-gray-300 bg-gray-800/50 border border-gray-600/50 p-2 rounded">
              This plan represents {revenueShare.toFixed(1)}% of total company
              revenue with {transactionCount} transactions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
