"use client";

import { useState } from "react";
import { EnhancedChatExample } from "@/components/chat/enhanced-chat-example";
import { RAGPanel } from "@/components/testing/rag-panel";
import { VoicePanel } from "@/components/testing/voice-panel";

export default function TestingPage() {
  const [activePanel, setActivePanel] = useState<"none" | "rag" | "voice">("none");

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Panel Controls */}
      <div className="bg-white border-b p-3 flex items-center gap-3">
        <h1 className="text-lg font-bold">🧪 Testing Suite</h1>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setActivePanel(activePanel === "rag" ? "none" : "rag")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activePanel === "rag"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            📚 RAG
          </button>
          <button
            onClick={() => setActivePanel(activePanel === "voice" ? "none" : "voice")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activePanel === "voice"
                ? "bg-purple-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            🎙️ Voice
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div
          className={`transition-all duration-300 ${
            activePanel === "none" ? "w-full" : "w-1/2"
          }`}
        >
          <EnhancedChatExample />
        </div>

        {/* Side Panels */}
        {activePanel === "rag" && (
          <div className="w-1/2 overflow-hidden">
            <RAGPanel />
          </div>
        )}

        {activePanel === "voice" && (
          <div className="w-1/2 overflow-hidden">
            <VoicePanel />
          </div>
        )}
      </div>
    </div>
  );
}
