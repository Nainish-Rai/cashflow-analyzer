"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface AnomalyDetectionProps {
  anomaliesFound: number;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  sensitivity: string;
  statistics: {
    revenue: {
      mean: number;
      stdDev: number;
    };
    expenses: {
      mean: number;
      stdDev: number;
    };
  };
  anomalies: Array<{
    type: string;
    transactionId?: string;
    amount?: number;
    date?: string;
    planId?: string;
    category?: string;
    deviation?: number;
    description: string;
    startDate?: string;
    endDate?: string;
    daysMissing?: number;
  }>;
}

export function AnomalyDetection({
  anomaliesFound,
  period,
  dateRange,
  sensitivity,
  statistics,
  anomalies,
}: AnomalyDetectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSeverityColor = (anomaly: AnomalyDetectionProps["anomalies"][0]) => {
    if (anomaly.type === "data_gap")
      return "border-yellow-500/20 bg-yellow-950/20";
    if (anomaly.deviation && anomaly.deviation > 3)
      return "border-red-500/20 bg-red-950/20";
    if (anomaly.deviation && anomaly.deviation > 2)
      return "border-orange-500/20 bg-orange-950/20";
    return "border-blue-500/20 bg-blue-950/20";
  };

  const getSeverityIcon = (anomaly: AnomalyDetectionProps["anomalies"][0]) => {
    if (anomaly.type === "data_gap")
      return <Calendar className="h-4 w-4 text-yellow-400" />;
    if (anomaly.deviation && anomaly.deviation > 3)
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    if (anomaly.deviation && anomaly.deviation > 2)
      return <AlertCircle className="h-4 w-4 text-orange-400" />;
    return <Search className="h-4 w-4 text-blue-400" />;
  };

  const getSeverityLevel = (anomaly: AnomalyDetectionProps["anomalies"][0]) => {
    if (anomaly.type === "data_gap") return "Data Gap";
    if (anomaly.deviation && anomaly.deviation > 3) return "Critical";
    if (anomaly.deviation && anomaly.deviation > 2) return "High";
    return "Medium";
  };

  const revenueAnomalies = anomalies.filter((a) => a.type === "revenue");
  const expenseAnomalies = anomalies.filter((a) => a.type === "expense");
  const dataGaps = anomalies.filter((a) => a.type === "data_gap");

  return (
    <Card className="w-full max-w-4xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-800/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <AlertTriangle className="h-5 w-5" />
            Anomaly Detection Report
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant="secondary"
              className="bg-orange-950/50 text-orange-300 border-orange-800/50"
            >
              {sensitivity.toUpperCase()} Sensitivity
            </Badge>
            <Badge
              variant="secondary"
              className="bg-orange-950/50 text-orange-300 border-orange-800/50"
            >
              {period.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-orange-400/80">
          Analysis from {formatDate(dateRange.startDate)} to{" "}
          {formatDate(dateRange.endDate)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">
                Total Anomalies
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{anomaliesFound}</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">
                Revenue Anomalies
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {revenueAnomalies.length}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-gray-300">
                Expense Anomalies
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {expenseAnomalies.length}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">
                Data Gaps
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{dataGaps.length}</p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4">
          <h3 className="font-semibold text-orange-300 mb-3">
            Statistical Baseline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-300 mb-2">
                Revenue Statistics
              </p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">Mean:</span>{" "}
                  <span className="text-white">
                    {formatCurrency(statistics.revenue.mean)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Std Dev:</span>{" "}
                  <span className="text-white">
                    {formatCurrency(statistics.revenue.stdDev)}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 mb-2">
                Expense Statistics
              </p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-400">Mean:</span>{" "}
                  <span className="text-white">
                    {formatCurrency(statistics.expenses.mean)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Std Dev:</span>{" "}
                  <span className="text-white">
                    {formatCurrency(statistics.expenses.stdDev)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Anomalies List */}
        {anomalies && anomalies.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="font-semibold text-orange-300">
                Detected Anomalies
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {anomalies.slice(0, 20).map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(
                      anomaly
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(anomaly)}
                          <span className="font-medium text-white">
                            {anomaly.description}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-gray-700/50 text-gray-300 border-gray-600/50"
                          >
                            {getSeverityLevel(anomaly)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {anomaly.type !== "data_gap" && (
                            <>
                              <div>
                                <span className="text-gray-400">Amount:</span>
                                <p className="font-semibold text-white">
                                  {anomaly.amount
                                    ? formatCurrency(anomaly.amount)
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Date:</span>
                                <p className="font-semibold text-white">
                                  {anomaly.date
                                    ? formatDate(anomaly.date)
                                    : "N/A"}
                                </p>
                              </div>
                              {anomaly.planId && (
                                <div>
                                  <span className="text-gray-400">Plan:</span>
                                  <p className="font-semibold text-white">
                                    Plan {anomaly.planId}
                                  </p>
                                </div>
                              )}
                              {anomaly.category && (
                                <div>
                                  <span className="text-gray-400">
                                    Category:
                                  </span>
                                  <p className="font-semibold text-white">
                                    {anomaly.category}
                                  </p>
                                </div>
                              )}
                              {anomaly.deviation && (
                                <div>
                                  <span className="text-gray-400">
                                    Deviation:
                                  </span>
                                  <p className="font-semibold text-white">
                                    {anomaly.deviation.toFixed(1)}σ
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          {anomaly.type === "data_gap" && (
                            <>
                              <div>
                                <span className="text-gray-400">
                                  Gap Period:
                                </span>
                                <p className="font-semibold text-white">
                                  {anomaly.startDate &&
                                    formatDate(anomaly.startDate)}{" "}
                                  -{" "}
                                  {anomaly.endDate &&
                                    formatDate(anomaly.endDate)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  Missing Days:
                                </span>
                                <p className="font-semibold text-white">
                                  {anomaly.daysMissing} days
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {anomalies.length > 20 && (
                  <div className="text-center text-sm text-gray-400 pt-3 border-t border-gray-700/50">
                    Showing first 20 of {anomalies.length} anomalies
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Anomalies Found */}
        {anomaliesFound === 0 && (
          <div className="bg-green-950/20 rounded-lg border border-green-800/50 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Search className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-300">
                No Anomalies Detected
              </span>
            </div>
            <p className="text-sm text-green-400/80">
              Your financial data appears consistent with no unusual patterns
              detected at {sensitivity} sensitivity level.
            </p>
          </div>
        )}

        {/* Recommendations */}
        {anomaliesFound > 0 && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4">
            <h3 className="font-semibold text-orange-300 mb-3">
              Recommendations
            </h3>
            <div className="space-y-2 text-sm">
              {revenueAnomalies.length > 0 && (
                <p className="text-blue-300 bg-blue-950/30 border border-blue-800/50 p-2 rounded">
                  💡 {revenueAnomalies.length} revenue anomalies detected.
                  Review these transactions for data entry errors or unusual
                  business events.
                </p>
              )}
              {expenseAnomalies.length > 0 && (
                <p className="text-purple-300 bg-purple-950/30 border border-purple-800/50 p-2 rounded">
                  🔍 {expenseAnomalies.length} expense anomalies found. Verify
                  these expenses and check for unauthorized or incorrect
                  charges.
                </p>
              )}
              {dataGaps.length > 0 && (
                <p className="text-yellow-300 bg-yellow-950/30 border border-yellow-800/50 p-2 rounded">
                  📅 {dataGaps.length} data gaps identified. Ensure consistent
                  data entry to maintain accurate financial records.
                </p>
              )}
              <p className="text-gray-300 bg-gray-800/50 border border-gray-600/50 p-2 rounded">
                Consider adjusting sensitivity level if too many or too few
                anomalies are detected for your analysis needs.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
