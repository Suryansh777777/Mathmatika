import { memo } from "react";
import { X } from "lucide-react";

interface VoiceWidgetHeaderProps {
  onClose: () => void;
}

function VoiceWidgetHeader({ onClose }: VoiceWidgetHeaderProps) {
  return (
    <>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-[#8b7d70] hover:bg-[#e8e4df]/60 hover:text-[#37322f] z-50 transition-colors duration-200"
        aria-label="Close AI Assistant"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-4 h-4 bg-[#8b7d70] rounded-full"></div>
        <h2 className="text-xl font-bold text-[#37322f]">
          AI Math Mentor
        </h2>
      </div>
    </>
  );
}

export default memo(VoiceWidgetHeader);
