import React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useMetrics } from "@/lib/contexts/metrics-context";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  const { metrics, isLoading } = useMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getChangeIcon = (isPositive: boolean) => {
    return isPositive ? IconTrendingUp : IconTrendingDown;
  };

  const getChangeColor = (isPositive: boolean) => {
    return isPositive ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const netCashflowIsPositive = metrics.netCashflow >= 0;
  const revenueGrowth = 12.5; // This could be calculated from historical data
  const expenseGrowth = -8.2; // Negative growth in expenses is good

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(metrics.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingUp className="size-3" />+{revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month{" "}
            <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            {metrics.lastUpdated
              ? `Updated ${new Date(metrics.lastUpdated).toLocaleTimeString()}`
              : "Revenue from all sources"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(metrics.totalExpenses)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingDown className="size-3" />
              {expenseGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Expenses optimized{" "}
            <IconTrendingDown className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            Operating costs under control
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Net Cashflow</CardDescription>
          <CardTitle
            className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${getChangeColor(
              netCashflowIsPositive
            )}`}
          >
            {formatCurrency(metrics.netCashflow)}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                netCashflowIsPositive ? "text-green-600" : "text-red-600"
              }
            >
              {React.createElement(getChangeIcon(netCashflowIsPositive), {
                className: "size-3",
              })}
              {netCashflowIsPositive ? "+" : ""}
              {((metrics.netCashflow / metrics.totalRevenue) * 100).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {netCashflowIsPositive ? "Positive cashflow" : "Needs attention"}
            {React.createElement(getChangeIcon(netCashflowIsPositive), {
              className: `size-4 ${getChangeColor(netCashflowIsPositive)}`,
            })}
          </div>
          <div className="text-muted-foreground">Revenue minus expenses</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(metrics.activeAccounts)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingUp className="size-3" />+{metrics.growthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention{" "}
            <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            {metrics.anomaliesFound
              ? `${metrics.anomaliesFound} anomalies detected`
              : "Engagement meets targets"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
