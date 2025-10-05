import { memo } from "react";

function VoiceWidgetTip() {
  return (
    <div className="mt-8 text-center">
      <p className="text-xs text-[#8b7d70]/60">
        💡 Speak naturally - I can hear you clearly
      </p>
    </div>
  );
}

export default memo(VoiceWidgetTip);
