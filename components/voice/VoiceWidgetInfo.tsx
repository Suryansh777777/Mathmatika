import { memo } from "react";

function VoiceWidgetInfo() {
  return (
    <div className="space-y-2 mb-8">
      <h3 className="text-lg font-semibold text-[#37322f]">
        Your AI Math Mentor
      </h3>
      <p className="text-[#5a5550] text-sm leading-relaxed">
        Ask me anything about mathematics
      </p>
    </div>
  );
}

export default memo(VoiceWidgetInfo);
