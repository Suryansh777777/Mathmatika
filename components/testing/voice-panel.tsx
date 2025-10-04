"use client";

import { useState } from "react";
import EmbedAgentClient from "@/components/voice/embed/agent-client";
import { VOICE_CONFIG_DEFAULTS } from "@/app-config";
import type { AppConfig } from "@/lib/voice/types";

export function VoicePanel() {
  const [selectedIndex, setSelectedIndex] = useState("pdf-index");

  // Extend app config with selected index
  const appConfig: AppConfig = {
    ...VOICE_CONFIG_DEFAULTS,
    // Pass index name as metadata (will be sent in connection request)
    sandboxId: selectedIndex,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l p-4 space-y-4 overflow-y-auto">
      <h2 className="text-xl font-bold">🎙️ Voice Mentor</h2>

      {/* Index Selector */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <h3 className="font-semibold">Select Knowledge Base</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">RAG Index</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="pdf-index">pdf-index (default)</option>
            {/* Add more indexes as needed */}
          </select>
          <p className="text-xs text-gray-500">
            The mentor will answer questions using documents from this index
          </p>
        </div>
      </div>

      {/* LiveKit Voice Agent Embed */}
      <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col">
        <h3 className="font-semibold mb-3">Talk to Your Mentor</h3>

        {/* LiveKit Embed Client */}
        <div className="flex-1 flex items-center justify-center">
          <EmbedAgentClient appConfig={appConfig} />
        </div>

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>• Click "Talk to Mentor" to start a voice session</p>
          <p>• Ask questions about the uploaded PDFs</p>
          <p>• The mentor will respond using RAG context</p>
          <p>• Click "End Call" when you're done</p>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Active Index:</span> {selectedIndex}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Make sure you've uploaded PDFs to this index first using the RAG panel
        </p>
      </div>
    </div>
  );
}
