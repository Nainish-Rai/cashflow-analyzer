"use client";

import { useState } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { CashflowDataTable } from "@/components/cashflow-data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { AgentChat } from "@/components/agent-chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MetricsProvider, useMetrics } from "@/lib/contexts/metrics-context";
import { MessageSquare, Bot, RefreshCw } from "lucide-react";

function DashboardContent() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const { refreshData, isLoading, error } = useMetrics();

  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Control Bar */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sheet open={isAgentOpen} onOpenChange={setIsAgentOpen}>
                      <SheetTrigger asChild>
                        <Button className="w-full sm:w-auto">
                          <Bot className="mr-2 h-4 w-4" />
                          Analyze Cashflow with AI
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-lg">
                        <SheetHeader>
                          <SheetTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Cashflow AI Agent
                          </SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 h-[calc(100vh-8rem)]">
                          <AgentChat />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="ml-auto"
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh Data
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="px-4 lg:px-6">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    <p className="text-sm font-medium">
                      Error loading dashboard data
                    </p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Metrics Cards */}
              <SectionCards />

              {/* Chart */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Data Table */}
              <div className="px-4 lg:px-6">
                <CashflowDataTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <MetricsProvider>
      <DashboardContent />
    </MetricsProvider>
  );
}
