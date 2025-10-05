"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import AIOrb from "@/components/ui/AIOrb";
import VoiceControls from "./VoiceControls";
import VoiceStatus from "./VoiceStatus";
import { type VoiceStatus as VoiceStatusType } from "@/lib/voice";

interface VoicePanelProps {
  threadId: string;
  onClose: () => void;
}

export default function VoicePanel({ threadId, onClose }: VoicePanelProps) {
  const {
    isConnected,
    isConnecting,
    isMuted,
    isAgentSpeaking,
    error,
    connect,
    disconnect,
    toggleMute,
  } = useLiveKitVoice({
    threadId,
    onError: (err) => console.error("Voice error:", err),
  });

  // Auto-connect when component mounts
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Determine voice status for UI
  const voiceStatus: VoiceStatusType = useMemo(() => {
    if (error) return "error";
    if (isConnecting) return "connecting";
    if (!isConnected) return "idle";
    if (isAgentSpeaking) return "speaking";
    if (!isMuted) return "listening";
    return "connected";
  }, [isConnected, isConnecting, isMuted, isAgentSpeaking, error]);

  // Map to AIOrb status
  const orbStatus = useMemo(() => {
    if (isAgentSpeaking) return "processing";
    if (!isMuted && isConnected) return "listening";
    return "idle";
  }, [isAgentSpeaking, isMuted, isConnected]);

  const handleEndCall = () => {
    disconnect();
    onClose();
  };

  return (
    <div className="relative h-full bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="relative p-6 border-b border-gray-200">
        <button
          onClick={handleEndCall}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
          aria-label="Close Voice Assistant"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-4 bg-[#4F9ECA] rounded-full"></div>
          <h2 className="text-xl font-bold text-[#0e4369]">Voice Assistant</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* AI Orb */}
        <div className="w-32 h-32 mb-8">
          <AIOrb status={orbStatus} size={128} />
        </div>

        {/* Info */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-[#0e4369] mb-2">
            AI Math Mentor
          </h3>
          <p className="text-[#0e4369] text-sm leading-relaxed mb-4">
            Ask me anything about mathematics
          </p>
          <VoiceStatus status={voiceStatus} error={error} />
        </div>

        {/* Controls */}
        <VoiceControls
          isMuted={isMuted}
          isConnected={isConnected}
          onMicToggle={toggleMute}
          onEndCall={handleEndCall}
        />

        {/* Tip */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            💡 Speak naturally - I can hear you clearly
          </p>
        </div>
      </div>
    </div>
  );
}
