"use client";

/**
 * Enhanced Chat Implementation Example
 *
 * This file demonstrates the best practices for implementing
 * chat streaming + Manim video generation with TanStack Query
 *
 * Key Features:
 * - Real-time SSE streaming with proper error handling
 * - Conversation history management per chat thread
 * - Optimistic UI updates
 * - Automatic retry logic for video generation
 * - LaTeX rendering with react-markdown + KaTeX
 * - Type-safe API calls with openapi-fetch
 */

import { useState, useEffect, useRef } from "react";
import { useChatStream, useManimGeneration } from "@/lib/api/hooks";
import { Message } from "@/components/chat/message";
import { VideoPanel, type VideoState, type VideoQuality } from "@/components/chat/video-panel";

interface EnhancedChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  model?: string;
}

export function EnhancedChatExample() {
  // State management
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [input, setInput] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("low");
  const [videoState, setVideoState] = useState<VideoState>({ status: "idle" });
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const chat = useChatStream();
  const manimGeneration = useManimGeneration();

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingContent]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, userMessage]);
    const messageContent = input;
    setInput("");
    setStreamingContent("");

    // Start video generation if enabled
    if (videoEnabled) {
      setVideoState({ status: "generating", progress: 0 });

      manimGeneration.mutate(
        {
          concept: messageContent,
          quality: videoQuality,
          use_ai: true,
        },
        {
          onSuccess: (data) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            setVideoState({
              status: "ready",
              videoUrl: `${apiUrl}${data.video_url}`,
            });
          },
          onError: (error: Error) => {
            setVideoState({
              status: "error",
              error: error.message,
            });
          },
        }
      );
    }

    // Stream chat response
    await chat.sendMessage(messageContent, {
      // Pass conversation history for context
      conversationHistory: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      // Real-time chunk handling
      onChunk: (chunk) => {
          setStreamingContent((prev) => prev + chunk);
      },
      // On completion, save to messages
      onComplete: (fullResponse) => {
        const aiMessage: EnhancedChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now(),
          model: "llama-4-scout-17b",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setStreamingContent("");
      },
      // Error handling
      onError: (error) => {
        const errorMessage: EnhancedChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `**Error**: ${error.message}`,
          timestamp: Date.now(),
          model: "error",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingContent("");
      },
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 transition-all ${
          videoEnabled ? "w-[60%]" : "w-full"
        }`}
      >
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg.content}
            messageId={msg.id}
            role={msg.role}
            model={msg.model}
          />
        ))}

        {/* Streaming message */}
        {chat.isStreaming && streamingContent && (
          <Message
            message={streamingContent}
            messageId="streaming"
            role="assistant"
            model="llama-4-scout-17b"
          />
        )}
      </div>

      {/* Video Panel */}
      {videoEnabled && (
        <div className="w-[40%]">
          <VideoPanel
            videoState={videoState}
            quality={videoQuality}
            onQualityChange={setVideoQuality}
            onRegenerate={() => {
              // Re-generate with last user message
              const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
              if (lastUserMsg) {
                setVideoState({ status: "generating", progress: 0 });
                manimGeneration.mutate(
                  {
                    concept: lastUserMsg.content,
                    quality: videoQuality,
                    use_ai: true,
                  },
                  {
                    onSuccess: (data) => {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                      setVideoState({
                        status: "ready",
                        videoUrl: `${apiUrl}${data.video_url}`,
                      });
                    },
                    onError: (error: Error) => {
                      setVideoState({
                        status: "error",
                        error: error.message,
                      });
                    },
                  }
                );
              }
            }}
            onClose={() => setVideoEnabled(false)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a math question..."
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={chat.isStreaming}
          />
          <button
            onClick={handleSendMessage}
            disabled={chat.isStreaming || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {chat.isStreaming ? "Streaming..." : "Send"}
          </button>
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`px-4 py-2 rounded-lg ${
              videoEnabled ? "bg-purple-500 text-white" : "bg-gray-200"
            }`}
          >
            🎬 Video
          </button>
        </div>
      </div>
    </div>
  );
}
