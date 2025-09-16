"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, BarChart3, Calendar } from "lucide-react";

interface PricingPlansProps {
  totalPlans: number;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  plans: Array<{
    planId: string;
    totalRevenue: number;
    transactionCount: number;
    averageTransactionAmount: number;
  }>;
}

export function PricingPlans({
  totalPlans,
  period,
  dateRange,
  plans,
}: PricingPlansProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalRevenue = plans.reduce((sum, plan) => sum + plan.totalRevenue, 0);
  const totalTransactions = plans.reduce(
    (sum, plan) => sum + plan.transactionCount,
    0
  );

  return (
    <Card className="w-full max-w-4xl bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950/30 border-gray-800/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Package className="h-5 w-5" />
            Pricing Plans Overview
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-blue-950/50 text-blue-300 border-blue-800/50"
          >
            {period.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-blue-400/80">
          Analysis from {formatDate(dateRange.startDate)} to{" "}
          {formatDate(dateRange.endDate)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Total Plans
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{totalPlans}</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-400" />
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
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Total Transactions
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {totalTransactions.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Plans Breakdown */}
        {plans && plans.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="font-semibold text-gray-300">Plan Performance</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {plans
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .map((plan, index) => {
                    const revenuePercentage =
                      totalRevenue > 0
                        ? (plan.totalRevenue / totalRevenue) * 100
                        : 0;
                    const isTopPerformer = index < 3;

                    return (
                      <div key={plan.planId} className="relative">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 bg-gray-800/30 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-white">
                                Plan {plan.planId}
                              </h4>
                              {isTopPerformer && (
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-950/50 text-yellow-300 border-yellow-800/50 text-xs"
                                >
                                  Top {index + 1}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-gray-400">Revenue:</span>
                                <p className="font-semibold text-white">
                                  {formatCurrency(plan.totalRevenue)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Transactions:
                                </span>
                                <p className="font-semibold text-white">
                                  {plan.transactionCount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Avg Transaction:
                                </span>
                                <p className="font-semibold text-white">
                                  {formatCurrency(
                                    plan.averageTransactionAmount
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-white">
                              {revenuePercentage.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-400">
                              of total revenue
                            </p>
                          </div>
                        </div>

                        {/* Revenue percentage bar */}
                        <div className="mt-2 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                            style={{
                              width: `${Math.min(revenuePercentage, 100)}%`,
                            }}
                          />
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
