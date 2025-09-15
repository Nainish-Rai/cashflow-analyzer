import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMetrics } from "@/lib/contexts/metrics-context";
import {
  Loader2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface AnalysisMetrics {
  totalRevenue?: number;
  totalExpenses?: number;
  netCashflow?: number;
  plansAnalyzed?: number;
  anomaliesFound?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  metrics?: AnalysisMetrics;
  timestamp: Date;
}

interface AgentChatProps {
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export function AgentChat({
  isCompact = false,
  onToggleCompact,
}: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateMetrics, refreshData, setLoading } = useMetrics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to get analysis");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        toolsUsed: data.toolsUsed,
        metrics: data.analysisMetrics,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update dashboard metrics if analysis returned metrics
      if (data.analysisMetrics) {
        updateMetrics({
          totalRevenue: data.analysisMetrics.totalRevenue,
          totalExpenses: data.analysisMetrics.totalExpenses,
          netCashflow: data.analysisMetrics.netCashflow,
          plansAnalyzed: data.analysisMetrics.plansAnalyzed,
          anomaliesFound: data.analysisMetrics.anomaliesFound,
        });
      }

      // Refresh dashboard data to reflect any changes from AI analysis
      await refreshData();
    } catch (error) {
      console.error("Failed to analyze cashflow data:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while analyzing your cashflow data. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
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
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>

                {message.role === "assistant" &&
                  (message.toolsUsed || message.metrics) && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      {/* Tools Used */}
                      {message.toolsUsed && message.toolsUsed.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium mb-2">
                            Tools Used:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.toolsUsed.map((tool) => (
                              <Badge
                                key={tool}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tool.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metrics */}
                      {message.metrics &&
                        Object.keys(message.metrics).length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">
                              Updated Metrics:
                            </p>
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              {message.metrics.totalRevenue && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-green-500" />
                                  <span>
                                    Revenue:{" "}
                                    {formatCurrency(
                                      message.metrics.totalRevenue
                                    )}
                                  </span>
                                </div>
                              )}
                              {message.metrics.totalExpenses && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-red-500" />
                                  <span>
                                    Expenses:{" "}
                                    {formatCurrency(
                                      message.metrics.totalExpenses
                                    )}
                                  </span>
                                </div>
                              )}
                              {message.metrics.netCashflow !== undefined && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp
                                    className={`h-3 w-3 ${
                                      message.metrics.netCashflow >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }`}
                                  />
                                  <span>
                                    Net:{" "}
                                    {formatCurrency(
                                      message.metrics.netCashflow
                                    )}
                                  </span>
                                </div>
                              )}
                              {message.metrics.anomaliesFound && (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                  <span>
                                    Anomalies: {message.metrics.anomaliesFound}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                <div className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your cashflow data...</span>
                </div>
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
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </CardContent>
    </Card>
  );
}
