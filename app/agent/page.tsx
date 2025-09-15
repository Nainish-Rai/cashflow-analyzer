"use client";

import { AgentChat } from "@/components/agent-chat";

export default function AgentPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <AgentChat />
      </div>
    </div>
  );
}
