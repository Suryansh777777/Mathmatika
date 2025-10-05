"use client";

import { memo, useMemo } from "react";
import { motion } from "motion/react";
import AIOrb from "@/components/ui/AIOrb";
import VoiceWidgetHeader from "./VoiceWidgetHeader";
import VoiceWidgetInfo from "./VoiceWidgetInfo";
import VoiceWidgetControls from "./VoiceWidgetControls";
import VoiceWidgetTip from "./VoiceWidgetTip";

interface VoiceWidgetDialogProps {
  orbStatus: "idle" | "listening" | "processing";
  isListening: boolean;
  connected: boolean;
  onClose: () => void;
  onMicToggle: () => void;
  onEndCall: () => void;
}

// Memoize the static tip component to prevent re-renders
const MemoizedTip = memo(() => <VoiceWidgetTip />);
MemoizedTip.displayName = "MemoizedTip";

function VoiceWidgetDialog({
  orbStatus,
  isListening,
  connected,
  onClose,
  onMicToggle,
  onEndCall,
}: VoiceWidgetDialogProps) {
  // Memoize the motion transition to prevent object recreation
  const motionTransition = useMemo(() => ({ duration: 0.4 }), []);

  return (
    <motion.div
      key="expanded"
      layoutId="voice-widget"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={motionTransition}
      className="relative bg-[#fdfcfb] rounded-[24px] border border-[#8b7d70]/20 p-6 sm:p-8 max-w-md w-full mx-auto shadow-xl overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <VoiceWidgetHeader onClose={onClose} />

      <div className="text-center">
        <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 relative">
          <AIOrb status={orbStatus} size={128} />
        </div>

        <VoiceWidgetInfo />

        <VoiceWidgetControls
          isListening={isListening}
          connected={connected}
          onMicToggle={onMicToggle}
          onEndCall={onEndCall}
        />

        <MemoizedTip />
      </div>
    </motion.div>
  );
}

export default memo(VoiceWidgetDialog);
