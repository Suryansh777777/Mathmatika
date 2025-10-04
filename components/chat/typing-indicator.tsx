"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-slide-up">
      <div className="bg-[#e8e4df]/70 rounded-xl px-4 py-3 shadow-elegant">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#8b7d70] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-[#8b7d70] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-[#8b7d70] rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
