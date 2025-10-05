"use client";

import { memo, useMemo } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";

interface VoiceControlsProps {
  isMuted: boolean;
  isConnected: boolean;
  onMicToggle: () => void;
  onEndCall: () => void;
}

const MicButton = memo(
  ({
    isMuted,
    isConnected,
    onMicToggle,
  }: {
    isMuted: boolean;
    isConnected: boolean;
    onMicToggle: () => void;
  }) => {
    const className = useMemo(
      () =>
        `w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
          !isMuted
            ? "bg-gradient-to-br from-[#4F9ECA] to-[#224F73] text-white shadow-[#4F9ECA]/30"
            : "bg-white border-2 border-[rgba(84,137,177,0.35)] text-[#75A6C7] hover:border-[#4F9ECA]/50 hover:text-[#4F9ECA]"
        }`,
      [isMuted]
    );

    const ariaLabel = useMemo(
      () => (isMuted ? "Unmute microphone" : "Mute microphone"),
      [isMuted]
    );

    return (
      <button
        onClick={onMicToggle}
        className={className}
        aria-pressed={isMuted}
        aria-label={ariaLabel}
        disabled={!isConnected}
      >
        {!isMuted ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>
    );
  }
);
MicButton.displayName = "MicButton";

const EndCallButton = memo(({ onEndCall }: { onEndCall: () => void }) => (
  <button
    onClick={onEndCall}
    className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 flex items-center justify-center shadow-lg shadow-red-500/30"
    title="End conversation"
  >
    <PhoneOff className="w-5 h-5" />
  </button>
));
EndCallButton.displayName = "EndCallButton";

function VoiceControls({
  isMuted,
  isConnected,
  onMicToggle,
  onEndCall,
}: VoiceControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <MicButton
        isMuted={isMuted}
        isConnected={isConnected}
        onMicToggle={onMicToggle}
      />
      <EndCallButton onEndCall={onEndCall} />
    </div>
  );
}

export default memo(VoiceControls);
