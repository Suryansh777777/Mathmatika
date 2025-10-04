"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MessageProps {
  message: string;
  messageId: string;
  role: "user" | "assistant";
  model?: string;
}

export function Message({ message, messageId, role, model }: MessageProps) {
  const isUser = role === "user";
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div
      data-message-id={messageId}
      className={cn("flex justify-start", isUser && "justify-end")}
    >
      <div
        role="article"
        aria-label={isUser ? "Your message" : "Assistant message"}
        className={cn(
          "group relative inline-block break-words",
          isUser &&
            "border border-[#d4cfc8]/50 bg-[#e8e4df]/50 max-w-[80%] rounded-xl px-4 py-3 text-left",
          !isUser && "w-full max-w-full"
        )}
      >
        <span className="sr-only">
          {isUser ? "Your message: " : "Assistant Reply: "}
        </span>
        <div className="prose prose-stone max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
          <p className="whitespace-pre-wrap text-[#37322f]">{message}</p>
        </div>
        <div
          className={cn(
            "absolute mt-2 -ml-0.5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100",
            isUser && "right-0 mt-5 ml-0",
            !isUser && "left-0"
          )}
        >
          <Button
            variant="ghost"
            className="text-xs h-8 w-8 rounded-lg p-0"
            aria-label="Copy message"
            onClick={handleCopy}
          >
            <div className="relative size-4">
              <Icon
                name="copy"
                className={cn(
                  "absolute inset-0 transition-all duration-200 ease-snappy scale-100 opacity-100",
                  isCopied && "scale-0 opacity-0"
                )}
              />
              <Icon
                name="check"
                className={cn(
                  "absolute inset-0 transition-all duration-200 ease-snappy scale-0 opacity-0",
                  isCopied && "scale-100 opacity-100"
                )}
              />
            </div>
          </Button>
          {!isUser && model && (
            <div className="flex items-center gap-1 text-xs text-[#8b7d70]">
              <span>{model}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
