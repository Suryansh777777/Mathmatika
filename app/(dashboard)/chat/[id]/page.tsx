"use client";

import ChatPrompt from "@/components/chat/chat-prompt";
import { Message } from "@/components/chat/message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useChatStream } from "@/lib/api/hooks";

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
  const [streamingContent, setStreamingContent] = useState("");
  const chat = useChatStream();

  // Check for initial message from chat home page
  useEffect(() => {
    if (id) {
      const initialMessage = sessionStorage.getItem(`chat-initial-${id}`);
      if (initialMessage) {
        sessionStorage.removeItem(`chat-initial-${id}`);
        handleAppend(initialMessage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-scroll to bottom when new messages arrive or streaming content changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingContent, chat.isStreaming]);

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

    // Reset streaming content
    setStreamingContent("");

    // Stream AI response
    await chat.sendMessage(message, {
      onChunk: (content) => {
        flushSync(() => {
          setStreamingContent((prev) => prev + content);
        });
      },
      onComplete: (fullResponse) => {
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: fullResponse,
          model: "llama-4-scout-17b",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setStreamingContent("");
      },
      onError: (error) => {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Error: ${error.message}`,
          model: "error",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingContent("");
      },
    });
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
          {chat.isStreaming && streamingContent && (
            <Message
              key="streaming"
              message={streamingContent}
              messageId="streaming"
              role="assistant"
              model="llama-4-scout-17b"
            />
          )}
          {chat.isStreaming && !streamingContent && <TypingIndicator />}
        </div>
      </div>
    </>
  );
}
