"use client";

import { memo, useMemo } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";

interface VoiceWidgetControlsProps {
  isListening: boolean;
  connected: boolean;
  onMicToggle: () => void;
  onEndCall: () => void;
}

// Memoize the mic button separately
const MicButton = memo(({
  isListening,
  connected,
  onMicToggle
}: {
  isListening: boolean;
  connected: boolean;
  onMicToggle: () => void;
}) => {
  const className = useMemo(() =>
    `w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${isListening
      ? "bg-gradient-to-br from-[#8b7d70] to-[#5a5550] text-white shadow-[#8b7d70]/30"
      : "bg-white border-2 border-[#8b7d70]/30 text-[#8b7d70] hover:border-[#8b7d70]/50 hover:text-[#5a5550]"
    }`, [isListening]);

  const ariaLabel = useMemo(() =>
    isListening ? "Mute microphone" : "Unmute microphone",
    [isListening]
  );

  return (
    <button
      onClick={onMicToggle}
      className={className}
      aria-pressed={!isListening}
      aria-label={ariaLabel}
      disabled={!connected}
    >
      {isListening ? (
        <Mic className="w-6 h-6" />
      ) : (
        <MicOff className="w-6 h-6" />
      )}
    </button>
  );
});
MicButton.displayName = "MicButton";

// Memoize the end call button separately
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

function VoiceWidgetControls({
  isListening,
  connected,
  onMicToggle,
  onEndCall,
}: VoiceWidgetControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <MicButton
        isListening={isListening}
        connected={connected}
        onMicToggle={onMicToggle}
      />
      <EndCallButton onEndCall={onEndCall} />
    </div>
  );
}

export default memo(VoiceWidgetControls);
