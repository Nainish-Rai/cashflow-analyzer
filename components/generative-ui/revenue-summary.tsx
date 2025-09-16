"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, BarChart3, Calendar } from "lucide-react";

interface RevenueSummaryProps {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  groupedData: Array<{
    planId?: string;
    month?: string;
    category?: string;
    _sum: { amount: number };
    _count: { _all: number };
  }>;
}

export function RevenueSummary({
  totalRevenue,
  totalTransactions,
  averageTransactionAmount,
  period,
  dateRange,
  groupedData,
}: RevenueSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGroupLabel = (item: RevenueSummaryProps["groupedData"][0]) => {
    if (item.planId) return `Plan ${item.planId}`;
    if (item.month)
      return new Date(item.month + "-01").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    if (item.category) return item.category;
    return "Unknown";
  };

  return (
    <Card className="w-full max-w-4xl bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 border-gray-800/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="h-5 w-5" />
            Revenue Analysis
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-emerald-950/50 text-emerald-300 border-emerald-800/50"
          >
            {period.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-emerald-400/80">
          Analysis from {formatDate(dateRange.startDate)} to{" "}
          {formatDate(dateRange.endDate)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
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
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">
                Transactions
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {totalTransactions.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">
                Avg Transaction
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(averageTransactionAmount)}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        {groupedData && groupedData.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="font-semibold text-gray-300">Revenue Breakdown</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {groupedData
                  .sort((a, b) => b._sum.amount - a._sum.amount)
                  .slice(0, 10)
                  .map((item, index) => {
                    const percentage = (item._sum.amount / totalRevenue) * 100;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {getGroupLabel(item)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item._count._all} transactions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(item._sum.amount)}
                          </p>
                          <p className="text-xs text-emerald-400">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
