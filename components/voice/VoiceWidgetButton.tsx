"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { Loader2, Mic } from "lucide-react";

interface VoiceWidgetButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function VoiceWidgetButton({
  isLoading,
  onClick,
  disabled = false,
}: VoiceWidgetButtonProps) {
  return (
    <motion.button
      layoutId="voice-widget"
      key="collapsed"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", duration: 0.35 }}
      className="px-6 py-3 shadow-lg border border-[#8b7d70]/20 hover:shadow-xl hover:border-[#8b7d70]/40 pointer-events-auto flex items-center gap-4 rounded-[24px] bg-[#fdfcfb]/95 backdrop-blur-xl"
      style={{
        height: "56px",
        minWidth: "fit-content",
      }}
      disabled={disabled || isLoading}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-[#8b7d70] to-[#5a5550] rounded-full flex items-center justify-center shadow-md">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </div>
      {isLoading ? (
        <span className="text-[#37322f] font-semibold">
          Connecting to AI Assistant...
        </span>
      ) : (
        <span className="text-[#37322f] font-semibold">
          Talk to AI Assistant
        </span>
      )}
    </motion.button>
  );
}

export default memo(VoiceWidgetButton);
