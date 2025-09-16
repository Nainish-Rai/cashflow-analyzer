"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Minimize2,
  Maximize2,
  StopCircle,
} from "lucide-react";
import { useState } from "react";
import type { UIMessage, ToolUIPart } from "ai";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;

    setLoading(true);
    sendMessage({ text: input.trim() });
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
              <ToolOutput output={toolPart.output} errorText={undefined} />
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

  return (
    <Card className={`flex flex-col ${isCompact ? "h-96" : "h-full"}`}>
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
        {/* Messages */}
        <div
          className={`flex-1 space-y-4 mb-4 overflow-y-auto ${
            isCompact ? "max-h-48" : "max-h-96"
          }`}
        >
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium mb-2">
                Start analyzing your cashflow
              </p>
              <p className="text-xs">
                Ask me to analyze your data, find trends, or optimize plans.
              </p>

              {!isCompact && (
                <div className="mt-4">
                  <p className="text-xs font-medium mb-2">Try asking:</p>
                  <div className="grid gap-1">
                    {suggestedQuestions
                      .slice(0, isCompact ? 2 : 5)
                      .map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(question)}
                          className="text-left text-xs p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
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
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-lg p-3"
                    : "bg-transparent"
                }`}
              >
                {/* Render message content */}
                <div
                  className={message.role === "assistant" ? "space-y-3" : ""}
                >
                  {message.parts.map((part, index) => {
                    // Render text parts
                    if (part.type === "text") {
                      return (
                        <div
                          key={index}
                          className={
                            message.role === "assistant"
                              ? "bg-muted rounded-lg p-3"
                              : ""
                          }
                        >
                          {message.role === "assistant" ? (
                            <Response className="text-sm">{part.text}</Response>
                          ) : (
                            <div className="whitespace-pre-wrap text-sm">
                              {part.text}
                            </div>
                          )}
                          {message.role === "assistant" && (
                            <div className="mt-2 text-xs opacity-70">
                              {new Date().toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Render tool parts
                    const toolComponent = renderToolPart(part, index);
                    if (toolComponent !== null && toolComponent !== undefined) {
                      return toolComponent as React.ReactNode;
                    }

                    return null;
                  })}
                </div>

                {/* Show timestamp for user messages */}
                {message.role === "user" && (
                  <div className="mt-2 text-xs opacity-70">
                    {new Date().toLocaleTimeString()}
                  </div>
                )}

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
                            <div className="grid grid-cols-1 gap-1 text-xs">
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
              </div>
            </div>
          ))}

          {/* Loading State */}
          {(status === "streaming" || status === "submitted") && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
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
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-start">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
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
              </div>
            </div>
          )}
        </div>

        <Separator className="mb-3" />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your cashflow analysis..."
            className={`flex-1 resize-none ${
              isCompact ? "min-h-[40px]" : "min-h-[60px]"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={status === "streaming"}
          />
          <Button
            type="submit"
            disabled={!input.trim() || status === "streaming"}
            className="px-4"
          >
            {status === "streaming" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </CardContent>
    </Card>
  );
}
