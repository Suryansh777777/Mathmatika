"use client";

import { memo } from "react";

interface VoiceStatusProps {
  status: string;
  error?: string;
}

function VoiceStatus({ status, error }: VoiceStatusProps) {
  if (error) {
    return (
      <div className="mb-6 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  const statusMessages: Record<string, string> = {
    idle: "Ready to connect",
    connecting: "Connecting to voice assistant...",
    connected: "Connected - Start speaking",
    listening: "Listening...",
    speaking: "AI is speaking...",
    error: "Connection error",
  };

  const statusColors: Record<string, string> = {
    idle: "text-gray-500",
    connecting: "text-blue-500",
    connected: "text-green-500",
    listening: "text-blue-600",
    speaking: "text-purple-600",
    error: "text-red-500",
  };

  return (
    <div className="mb-6">
      <p className={`text-sm font-medium ${statusColors[status]}`}>
        {statusMessages[status]}
      </p>
    </div>
  );
}

export default memo(VoiceStatus);
