"use client";

import ChatPrompt from "@/components/chat/chat-prompt";
import { Message } from "@/components/chat/message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import {
  VideoPanel,
  type VideoState,
  type VideoQuality,
} from "@/components/chat/video-panel";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useChatStream, useManimGeneration, useRAGQuery } from "@/lib/api/hooks";
import { getThread, addMessageToThread } from "@/lib/chat-storage";
import { useSidebar } from "@/components/ui/sidebar";

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
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("medium");
  const [videoState, setVideoState] = useState<VideoState>({ status: "idle" });
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [uploadedPdf, setUploadedPdf] = useState<{
    filename: string;
    indexName: string;
  } | null>(null);
  // Hooks
  const chat = useChatStream();
  const ragQuery = useRAGQuery();
  const manimGeneration = useManimGeneration();
  const { setOpen, open } = useSidebar();

  // Load thread messages on mount
  useEffect(() => {
    if (id) {
      const thread = getThread(id as string);
      if (thread && thread.messages.length > 0) {
        // Load existing messages
        setMessages(
          thread.messages.map((msg) => ({
            id: msg.id,
            role: msg.role as Role,
            content: msg.content,
            model: msg.model,
          }))
        );
      } else {
        // Check for initial message AND PDF info from chat home page
        const initialMessage = sessionStorage.getItem(`chat-initial-${id}`);
        const pdfInfo = sessionStorage.getItem(`chat-pdf-${id}`);

        let parsedPdfInfo = null;
        if (pdfInfo) {
          parsedPdfInfo = JSON.parse(pdfInfo);
          console.log("📎 [CONV] Retrieved PDF info from session:", parsedPdfInfo);
          setUploadedPdf(parsedPdfInfo);
          sessionStorage.removeItem(`chat-pdf-${id}`);
        }

        if (initialMessage) {
          sessionStorage.removeItem(`chat-initial-${id}`);
          // CRITICAL: Pass PDF info directly to avoid race condition with state
          console.log("📎 [CONV] Calling handleAppend with PDF:", parsedPdfInfo);
          handleAppend(initialMessage, parsedPdfInfo);
        }
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

  // Auto-collapse sidebar when video panel opens
  useEffect(() => {
    if (videoEnabled && open) {
      setOpen(false);
    }
  }, [videoEnabled, open, setOpen]);

  // Generate video when toggling on (if there's a last message)
  useEffect(() => {
    if (videoEnabled && lastUserMessage && videoState.status === "idle") {
      setVideoState({ status: "generating", progress: 0 });

      manimGeneration.mutate(
        {
          concept: lastUserMessage,
          quality: videoQuality,
          use_ai: true,
        },
        {
          onSuccess: (data) => {
            const apiUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
    } else if (!videoEnabled) {
      // Reset video state when toggling off
      setVideoState({ status: "idle" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoEnabled]);

  const handleAppend = async (
    message: string,
    pdfInfo?: { filename: string; indexName: string } | null
  ) => {
    if (!id) {
      return router.push("/chat");
    }

    // Use provided pdfInfo (from initial load) or current state
    const activePdf = pdfInfo !== undefined ? pdfInfo : uploadedPdf;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to storage
    addMessageToThread(id as string, {
      id: userMessage.id,
      role: userMessage.role,
      content: userMessage.content,
    });

    // Store message for video generation
    setLastUserMessage(message);

    // Reset streaming content
    setStreamingContent("");

    // Start video generation if enabled
    if (videoEnabled) {
      setVideoState({ status: "generating", progress: 0 });

      manimGeneration.mutate(
        {
          concept: message,
          quality: videoQuality,
          use_ai: true,
        },
        {
          onSuccess: (data) => {
            const apiUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

    // CRITICAL: Use RAG query if PDF is uploaded, otherwise use normal chat
    if (activePdf) {
      console.log("📎 [CONV] Using RAG query with index:", activePdf.indexName);

      await ragQuery.query(message, {
        indexName: activePdf.indexName,
        onChunk: (content) => {
          flushSync(() => {
            setStreamingContent((prev) => prev + content);
          });
        },
        onComplete: (fullResponse, sources) => {
          console.log("📎 [CONV] RAG response complete. Sources:", sources);
          const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            content: fullResponse,
            model: "rag-llama-4-scout-17b",
          };
          setMessages((prev) => [...prev, aiMessage]);
          setStreamingContent("");

          // Save AI response to storage
          addMessageToThread(id as string, {
            id: aiMessage.id,
            role: aiMessage.role,
            content: aiMessage.content,
            model: aiMessage.model,
          });
        },
        onError: (error) => {
          console.error("📎 [CONV] RAG error:", error);
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            content: `RAG Error: ${error.message}`,
            model: "error",
          };
          setMessages((prev) => [...prev, errorMessage]);
          setStreamingContent("");
        },
      });
    } else {
      console.log("💬 [CONV] Using normal chat (no PDF)");

      await chat.sendMessage(message, {
        conversationHistory: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
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

          // Save AI response to storage
          addMessageToThread(id as string, {
            id: aiMessage.id,
            role: aiMessage.role,
            content: aiMessage.content,
            model: aiMessage.model,
          });
        },
        onError: (error) => {
          console.error("💬 [CONV] Chat error:", error);
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
    }
  };

  const handleVideoRegenerate = () => {
    if (!lastUserMessage) return;

    setVideoState({ status: "generating", progress: 0 });

    manimGeneration.mutate(
      {
        concept: lastUserMessage,
        quality: videoQuality,
        use_ai: true,
      },
      {
        onSuccess: (data) => {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
  };

  return (
    <>
      <ChatPrompt
        input={input}
        setInput={setInput}
        append={handleAppend}
        videoEnabled={videoEnabled}
        onVideoToggle={setVideoEnabled}
        enableVideoLayout={true}
        uploadedPdfInfo={uploadedPdf}
        onPdfUpload={setUploadedPdf}
      />
      <div className="absolute inset-0 flex">
        {/* Chat Area */}
        <div
          ref={chatContainerRef}
          className={`overflow-y-scroll sm:pt-3.5 pb-[144px] smooth-scroll transition-all duration-300 ${
            videoEnabled ? "w-[60%]" : "w-full"
          }`}
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
            {(chat.isStreaming || ragQuery.isStreaming) && streamingContent && (
              <Message
                key="streaming"
                message={streamingContent}
                messageId="streaming"
                role="assistant"
                model={uploadedPdf ? `rag-${uploadedPdf.indexName}` : "llama-4-scout-17b"}
              />
            )}
            {(chat.isStreaming || ragQuery.isStreaming) && !streamingContent && <TypingIndicator />}
          </div>
        </div>

        {/* Video Panel */}
        {videoEnabled && (
          <div className="w-[40%] h-full animate-slide-in-right">
            <VideoPanel
              videoState={videoState}
              quality={videoQuality}
              onQualityChange={setVideoQuality}
              onRegenerate={handleVideoRegenerate}
              onClose={() => setVideoEnabled(false)}
            />
          </div>
        )}
      </div>
    </>
  );
}
