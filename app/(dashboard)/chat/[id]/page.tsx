"use client";

import ChatPrompt from "@/components/chat/chat-prompt";
import { Message } from "@/components/chat/message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  model?: string;
}

export default function ChatConversation() {
  const { id } = useParams();
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // TODO: Replace with actual data fetching from your backend
  useEffect(() => {
    // Mock messages - replace with API call
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Explain the derivative of x^2",
      },
      {
        id: "2",
        role: "assistant",
        content: "The derivative of x² is 2x. Here's why:\n\nUsing the power rule: d/dx(x^n) = nx^(n-1)\n\nFor x²:\n- n = 2\n- So the derivative = 2x^(2-1) = 2x^1 = 2x\n\nThis means the rate of change of x² at any point x is 2x.",
        model: "gpt-4o",
      },
    ];
    setMessages(mockMessages);
  }, [id]);

  // Auto-scroll to bottom when new messages arrive or thinking state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  const handleAppend = async (message: string) => {
    if (!id) {
      return router.push("/chat");
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show thinking indicator
    setIsThinking(true);

    // TODO: Integrate with your backend API to get AI response
    // For now, add a mock response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a mock response. Integrate with your backend API to get real AI responses.",
        model: "gpt-4o",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <>
      <ChatPrompt
        input={input}
        setInput={setInput}
        append={handleAppend}
      />
      <div
        ref={chatContainerRef}
        className="absolute inset-0 overflow-y-scroll sm:pt-3.5 pb-[144px] smooth-scroll"
        style={{ scrollbarGutter: "stable both-edges" }}
      >
        <div
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 py-10"
        >
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message.content}
              messageId={message.id}
              role={message.role}
              model={message.model}
            />
          ))}
          {isThinking && <TypingIndicator />}
        </div>
      </div>
    </>
  );
}
