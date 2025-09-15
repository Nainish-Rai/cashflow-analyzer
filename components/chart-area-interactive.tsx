"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { useMetrics } from "@/lib/contexts/metrics-context";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

export const description = "An interactive cashflow chart";

const chartConfig = {
  cashflow: {
    label: "Cashflow",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
  netCashflow: {
    label: "Net Cashflow",
    color: "hsl(var(--color-chart-5))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const { chartData, isLoading, refreshData, period } = useMetrics();
  const [timeRange, setTimeRange] = React.useState(
    period.label || "last_90_days"
  );

  React.useEffect(() => {
    if (isMobile && timeRange !== "last_30_days") {
      setTimeRange("last_30_days");
      refreshData("last_30_days");
    }
  }, [isMobile, timeRange, refreshData]);

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    refreshData(newRange);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "last_30_days":
        return "Last 30 days";
      case "last_90_days":
        return "Last 3 months";
      case "last_6_months":
        return "Last 6 months";
      case "last_year":
        return "Last year";
      default:
        return "Last 3 months";
    }
  };

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="aspect-auto h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Cashflow Analysis</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Revenue, expenses, and net cashflow trends
          </span>
          <span className="@[540px]/card:hidden">Cashflow trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="last_6_months">
              Last 6 months
            </ToggleGroupItem>
            <ToggleGroupItem value="last_90_days">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="last_30_days">Last 30 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a time range"
            >
              <SelectValue placeholder={getTimeRangeLabel(timeRange)} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="last_6_months" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="last_90_days" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="last_30_days" className="rounded-lg">
                Last 30 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-5)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-5)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === "revenue"
                        ? "Revenue"
                        : name === "expenses"
                        ? "Expenses"
                        : "Net Cashflow",
                    ]}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="expenses"
                type="natural"
                fill="url(#fillExpenses)"
                stroke="var(--color-expenses)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                stackId="b"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
