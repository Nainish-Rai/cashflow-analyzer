import { NextRequest, NextResponse } from "next/server";
import { cashflowAgent } from "@/lib/cashflow-agent";

export const maxDuration = 60; // Allow up to 60 seconds for complex analysis

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Call the cashflow agent
    const result = await cashflowAgent(prompt, {
      onStep: (message) => {
        console.log("Agent step:", message);
      },
      onError: (error) => {
        console.error("Agent error:", error);
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cashflow agent error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze cashflow",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
