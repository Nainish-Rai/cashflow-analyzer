"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface CashflowMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netCashflow: number;
  growthRate: number;
  activeAccounts: number;
  plansAnalyzed?: number;
  anomaliesFound?: number;
  lastUpdated?: Date;
}

export interface DashboardData {
  metrics: CashflowMetrics;
  chartData: Array<{
    date: string;
    revenue: number;
    expenses: number;
    netCashflow: number;
  }>;
  tableData: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    category: string;
    description: string;
    status: string;
    source: string;
  }>;
  period: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
}

interface MetricsContextType {
  metrics: CashflowMetrics;
  chartData: DashboardData["chartData"];
  tableData: DashboardData["tableData"];
  period: DashboardData["period"];
  updateMetrics: (newMetrics: Partial<CashflowMetrics>) => void;
  updateDashboardData: (data: Partial<DashboardData>) => void;
  refreshData: (period?: string) => Promise<void>;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
}

const defaultMetrics: CashflowMetrics = {
  totalRevenue: 0,
  totalExpenses: 0,
  netCashflow: 0,
  growthRate: 0,
  activeAccounts: 0,
};

const defaultDashboardData: DashboardData = {
  metrics: defaultMetrics,
  chartData: [],
  tableData: [],
  period: {
    startDate: new Date(),
    endDate: new Date(),
    label: "last_90_days",
  },
};

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<CashflowMetrics>(defaultMetrics);
  const [chartData, setChartData] = useState<DashboardData["chartData"]>([]);
  const [tableData, setTableData] = useState<DashboardData["tableData"]>([]);
  const [period, setPeriod] = useState<DashboardData["period"]>(
    defaultDashboardData.period
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (timePeriod = "last_90_days") => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard?period=${timePeriod}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DashboardData = await response.json();

      setMetrics(data.metrics);
      setChartData(data.chartData);
      setTableData(data.tableData);
      setPeriod(data.period);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateMetrics = (newMetrics: Partial<CashflowMetrics>) => {
    setMetrics((prev) => ({
      ...prev,
      ...newMetrics,
      lastUpdated: new Date(),
    }));
  };

  const updateDashboardData = (data: Partial<DashboardData>) => {
    if (data.metrics) {
      setMetrics((prev) => ({
        ...prev,
        ...data.metrics,
        lastUpdated: new Date(),
      }));
    }
    if (data.chartData) {
      setChartData(data.chartData);
    }
    if (data.tableData) {
      setTableData(data.tableData);
    }
    if (data.period) {
      setPeriod(data.period);
    }
  };

  const refreshData = async (timePeriod?: string) => {
    await fetchDashboardData(timePeriod || period.label);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        chartData,
        tableData,
        period,
        updateMetrics,
        updateDashboardData,
        refreshData,
        isLoading,
        setLoading,
        error,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
}
