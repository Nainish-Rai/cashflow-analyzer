"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetrics } from "@/lib/contexts/metrics-context";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Response } from "@/components/ai-elements/response";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Actions, Action } from "@/components/ai-elements/actions";
import {
  Loader2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Minimize2,
  Maximize2,
  StopCircle,
  Copy,
} from "lucide-react";
import { useState, Fragment } from "react";
import type { UIMessage, ToolUIPart } from "ai";
import { RevenueSummary } from "@/components/generative-ui/revenue-summary";
import { ExpenseSummary } from "@/components/generative-ui/expense-summary";
import { CashflowTrend } from "@/components/generative-ui/cashflow-trend";
import { PricingPlans } from "@/components/generative-ui/pricing-plans";
import { ProfitabilityAnalysis } from "@/components/generative-ui/profitability-analysis";
import { AnomalyDetection } from "@/components/generative-ui/anomaly-detection";

interface AnalysisMetrics {
  totalRevenue?: number;
  totalExpenses?: number;
  netCashflow?: number;
  plansAnalyzed?: number;
  anomaliesFound?: number;
}

interface AgentChatProps {
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export function AgentChat({
  isCompact = false,
  onToggleCompact,
}: AgentChatProps) {
  const [input, setInput] = useState("");
  const { updateMetrics, refreshData, setLoading } = useMetrics();

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent",
    }),
    onFinish: async ({ message }) => {
      // Extract metrics from tool results in the message
      const toolParts = message.parts.filter(
        (part) =>
          part.type.startsWith("tool-") && "output" in part && part.output
      ) as ToolUIPart[];

      const analysisMetrics: AnalysisMetrics = {};

      // Process tool results to extract metrics
      toolParts.forEach((toolPart) => {
        if (
          toolPart.type.startsWith("tool-") &&
          "output" in toolPart &&
          toolPart.output
        ) {
          const toolName = toolPart.type.replace("tool-", "");
          const result = toolPart.output;

          if (toolName === "get_revenue_summary" && result) {
            const revenueResult = result as { totalRevenue?: number };
            if (revenueResult.totalRevenue) {
              analysisMetrics.totalRevenue = revenueResult.totalRevenue;
            }
          }

          if (toolName === "get_expense_summary" && result) {
            const expenseResult = result as { totalExpenses?: number };
            if (expenseResult.totalExpenses) {
              analysisMetrics.totalExpenses = expenseResult.totalExpenses;
            }
          }

          if (toolName === "calculate_cashflow_trend" && result) {
            const cashflowResult = result as { totalNetCashflow?: number };
            if (cashflowResult.totalNetCashflow !== undefined) {
              analysisMetrics.netCashflow = cashflowResult.totalNetCashflow;
            }
          }

          if (toolName === "list_pricing_plans" && result) {
            const plansResult = result as { totalPlans?: number };
            if (plansResult.totalPlans) {
              analysisMetrics.plansAnalyzed = plansResult.totalPlans;
            }
          }

          if (toolName === "find_data_anomalies" && result) {
            const anomaliesResult = result as { anomaliesFound?: number };
            if (anomaliesResult.anomaliesFound) {
              analysisMetrics.anomaliesFound = anomaliesResult.anomaliesFound;
            }
          }
        }
      });

      // Update dashboard metrics if analysis returned metrics
      if (Object.keys(analysisMetrics).length > 0) {
        updateMetrics(analysisMetrics);
      }

      // Refresh dashboard data to reflect any changes from AI analysis
      await refreshData();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Failed to analyze cashflow data:", error);
      setLoading(false);
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText || status === "streaming") return;

    setLoading(true);
    sendMessage({ text: message.text! });
    setInput("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const suggestedQuestions = [
    "Analyze my cashflow trends for the last 6 months",
    "Which pricing plan is most profitable?",
    "Find any anomalies in my financial data",
    "What are my biggest expense categories?",
    "How is my revenue distributed across pricing plans?",
  ];

  // Extract metrics from tool results in a message
  const getMetricsFromMessage = (message: UIMessage) => {
    const toolParts = message.parts.filter(
      (part) => part.type.startsWith("tool-") && "output" in part && part.output
    ) as ToolUIPart[];
    const metrics: AnalysisMetrics = {};

    toolParts.forEach((toolPart) => {
      if (
        toolPart.type.startsWith("tool-") &&
        "output" in toolPart &&
        toolPart.output
      ) {
        const toolName = toolPart.type.replace("tool-", "");
        const result = toolPart.output;

        if (toolName === "get_revenue_summary" && result) {
          const revenueResult = result as { totalRevenue?: number };
          if (revenueResult.totalRevenue)
            metrics.totalRevenue = revenueResult.totalRevenue;
        }

        if (toolName === "get_expense_summary" && result) {
          const expenseResult = result as { totalExpenses?: number };
          if (expenseResult.totalExpenses)
            metrics.totalExpenses = expenseResult.totalExpenses;
        }

        if (toolName === "calculate_cashflow_trend" && result) {
          const cashflowResult = result as { totalNetCashflow?: number };
          if (cashflowResult.totalNetCashflow !== undefined)
            metrics.netCashflow = cashflowResult.totalNetCashflow;
        }

        if (toolName === "find_data_anomalies" && result) {
          const anomaliesResult = result as { anomaliesFound?: number };
          if (anomaliesResult.anomaliesFound)
            metrics.anomaliesFound = anomaliesResult.anomaliesFound;
        }
      }
    });

    return metrics;
  };

  // Render tool parts with proper UI components
  const renderToolPart = (part: UIMessage["parts"][0], index: number) => {
    // Handle tool parts with the proper type checking
    if (part.type.startsWith("tool-")) {
      const toolPart = part as ToolUIPart;

      return (
        <Tool key={`${toolPart.toolCallId}-${index}`} className="mb-2">
          <ToolHeader type={toolPart.type} state={toolPart.state} />
          <ToolContent>
            {(toolPart.state === "input-streaming" ||
              toolPart.state === "input-available") &&
              "input" in toolPart &&
              toolPart.input && <ToolInput input={toolPart.input} />}
            {toolPart.state === "output-available" && "output" in toolPart && (
              <>
                <ToolOutput output={toolPart.output} errorText={undefined} />
                {/* Render generative UI components for specific tools */}
                {renderGenerativeUI(toolPart)}
              </>
            )}
            {toolPart.state === "output-error" && "errorText" in toolPart && (
              <ToolOutput output={undefined} errorText={toolPart.errorText} />
            )}
          </ToolContent>
        </Tool>
      );
    }

    return null;
  };

  // Render generative UI components based on tool type and output
  const renderGenerativeUI = (toolPart: ToolUIPart) => {
    if (
      toolPart.state !== "output-available" ||
      !("output" in toolPart) ||
      !toolPart.output
    ) {
      return null;
    }

    const toolName = toolPart.type.replace("tool-", "");
    const output = toolPart.output as any;

    try {
      switch (toolName) {
        case "get_revenue_summary":
          if (output.totalRevenue !== undefined) {
            return (
              <div className="mt-4">
                <RevenueSummary
                  totalRevenue={output.totalRevenue}
                  totalTransactions={output.totalTransactions || 0}
                  averageTransactionAmount={
                    output.averageTransactionAmount || 0
                  }
                  period={output.period || "unknown"}
                  dateRange={output.dateRange || { startDate: "", endDate: "" }}
                  groupedData={output.groupedData || []}
                />
              </div>
            );
          }
          break;

        case "get_expense_summary":
          if (output.totalExpenses !== undefined) {
            return (
              <div className="mt-4">
                <ExpenseSummary
                  totalExpenses={output.totalExpenses}
                  totalTransactions={output.totalTransactions || 0}
                  averageTransactionAmount={
                    output.averageTransactionAmount || 0
                  }
                  period={output.period || "unknown"}
                  dateRange={output.dateRange || { startDate: "", endDate: "" }}
                  recurringExpenses={
                    output.recurringExpenses || { total: 0, count: 0 }
                  }
                  groupedData={output.groupedData || []}
                />
              </div>
            );
          }
          break;

        case "calculate_cashflow_trend":
          if (output.totalRevenue !== undefined) {
            return (
              <div className="mt-4">
                <CashflowTrend
                  totalRevenue={output.totalRevenue}
                  totalExpenses={output.totalExpenses || 0}
                  totalNetCashflow={output.totalNetCashflow || 0}
                  period={output.period || "unknown"}
                  dateRange={output.dateRange || { startDate: "", endDate: "" }}
                  monthlyTrends={output.monthlyTrends || []}
                  averageMonthlyRevenue={output.averageMonthlyRevenue || 0}
                  averageMonthlyExpenses={output.averageMonthlyExpenses || 0}
                />
              </div>
            );
          }
          break;

        case "list_pricing_plans":
          if (output.totalPlans !== undefined) {
            return (
              <div className="mt-4">
                <PricingPlans
                  totalPlans={output.totalPlans}
                  period={output.period || "unknown"}
                  dateRange={output.dateRange || { startDate: "", endDate: "" }}
                  plans={output.plans || []}
                />
              </div>
            );
          }
          break;

        case "calculate_profitability_for_plan":
          if (output.planId !== undefined && output.revenue !== undefined) {
            return (
              <div className="mt-4">
                <ProfitabilityAnalysis
                  planId={output.planId}
                  period={output.period || "unknown"}
                  dateRange={output.dateRange || { startDate: "", endDate: "" }}
                  revenue={output.revenue}
                  allocatedExpenses={output.allocatedExpenses || 0}
                  profit={output.profit || 0}
                  profitMargin={output.profitMargin || 0}
                  revenueShare={output.revenueShare || 0}
                  transactionCount={output.transactionCount || 0}
                  averageTransactionAmount={
                    output.averageTransactionAmount || 0
                  }
                />
              </div>
            );
          }
          break;

        case "find_data_anomalies":
          if (output.anomaliesFound !== undefined) {
            return (
              <div className="mt-4">
                <AnomalyDetection
                  anomaliesFound={output.anomaliesFound}
                  period={output.period || "unknown"}
                  dateRange={output.dateRange || { startDate: "", endDate: "" }}
                  sensitivity={output.sensitivity || "medium"}
                  statistics={
                    output.statistics || {
                      revenue: { mean: 0, stdDev: 0 },
                      expenses: { mean: 0, stdDev: 0 },
                    }
                  }
                  anomalies={output.anomalies || []}
                />
              </div>
            );
          }
          break;

        default:
          return null;
      }
    } catch (error) {
      console.error(`Error rendering generative UI for ${toolName}:`, error);
      return null;
    }

    return null;
  };

  return (
    <Card className={`flex flex-col bg-black`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Cashflow AI Agent
          </CardTitle>
          {onToggleCompact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCompact}
              className="h-8 w-8 p-0"
            >
              {isCompact ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Ask me anything about your cashflow analysis, pricing plans, and
          financial data.
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* AI Elements Conversation */}
        <div className={`flex-1 ${isCompact ? "h-48" : "h-96"}`}>
          <Conversation className="h-full">
            <ConversationContent>
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Start analyzing your cashflow
                  </p>
                  <p className="text-sm mb-6">
                    Ask me to analyze your data, find trends, or optimize plans.
                  </p>

                  {!isCompact && (
                    <div className="max-w-md mx-auto">
                      <p className="text-sm font-medium mb-3">Try asking:</p>
                      <div className="grid gap-2">
                        {suggestedQuestions
                          .slice(0, isCompact ? 2 : 5)
                          .map((question, index) => (
                            <button
                              key={index}
                              onClick={() => setInput(question)}
                              className="text-left text-sm p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                            >
                              &quot;{question}&quot;
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {messages.map((message) => (
                <Fragment key={message.id}>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response>{part.text}</Response>
                              </MessageContent>
                            </Message>
                            {message.role === "assistant" && (
                              <Actions className="mt-2">
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <Copy className="size-3" />
                                </Action>
                              </Actions>
                            )}
                          </Fragment>
                        );
                      default:
                        // Render tool parts
                        const toolComponent = renderToolPart(part, i);
                        if (toolComponent) {
                          return toolComponent;
                        }
                        return null;
                    }
                  })}

                  {/* Analysis summary for assistant messages */}
                  {message.role === "assistant" && (
                    <div className="mt-3">
                      {(() => {
                        const metrics = getMetricsFromMessage(message);
                        return (
                          Object.keys(metrics).length > 0 && (
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-xs font-medium mb-2">
                                Analysis Summary:
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {metrics.totalRevenue && (
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span>
                                      Revenue:{" "}
                                      {formatCurrency(metrics.totalRevenue)}
                                    </span>
                                  </div>
                                )}
                                {metrics.totalExpenses && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-red-500" />
                                    <span>
                                      Expenses:{" "}
                                      {formatCurrency(metrics.totalExpenses)}
                                    </span>
                                  </div>
                                )}
                                {metrics.netCashflow !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <TrendingUp
                                      className={`h-3 w-3 ${
                                        metrics.netCashflow >= 0
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    />
                                    <span>
                                      Net: {formatCurrency(metrics.netCashflow)}
                                    </span>
                                  </div>
                                )}
                                {metrics.anomaliesFound && (
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                    <span>
                                      Anomalies: {metrics.anomaliesFound}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        );
                      })()}
                    </div>
                  )}
                </Fragment>
              ))}

              {/* Loading State */}
              {(status === "streaming" || status === "submitted") && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {status === "submitted"
                          ? "Submitting your query..."
                          : "Analyzing your cashflow data..."}
                      </span>
                      {status === "streaming" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stop}
                          className="h-6 w-6 p-0 ml-2"
                        >
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </MessageContent>
                </Message>
              )}

              {/* Error State */}
              {error && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="text-sm text-destructive mb-2">
                      Something went wrong. Please try again.
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="h-7 px-3 text-xs"
                    >
                      Retry
                    </Button>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>

        {/* AI Elements Prompt Input */}
        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Ask about your cashflow analysis..."
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              {/* Future: Add attachment support here if needed */}
            </PromptInputTools>
            <PromptInputSubmit disabled={!input.trim()} status={status} />
          </PromptInputToolbar>
        </PromptInput>

        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </CardContent>
    </Card>
  );
}
