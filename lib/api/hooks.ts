import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { operations } from "./schema";
import { useState, useCallback, useRef } from "react";

/**
 * Type definitions for API requests and responses (strictly from OpenAPI schema)
 */
type ResearchRequest =
  operations["research_topic_research_post"]["requestBody"]["content"]["application/json"];
type ResearchResponse =
  operations["research_topic_research_post"]["responses"][200]["content"]["application/json"];
type DeepResearchResponse =
  operations["deeper_research_topic_deep_research_post"]["responses"][200]["content"]["application/json"];
type MultiAgentResearchResponse =
  operations["anthropic_multiagent_research_multi_agent_research_post"]["responses"][200]["content"]["application/json"];

/**
 * Hook for basic research endpoint
 *
 * @example
 * ```tsx
 * const research = useResearch();
 *
 * research.mutate({ query: "What is quantum computing?" }, {
 *   onSuccess: (data) => console.log(data),
 *   onError: (error) => console.error(error)
 * });
 * ```
 */
export function useResearch(
  options?: UseMutationOptions<ResearchResponse, Error, ResearchRequest>
) {
  return useMutation({
    mutationFn: async (request: ResearchRequest) => {
      const { data, error } = await apiClient.POST("/research", {
        body: request,
      });

      if (error) {
        const message =
          (error as { detail?: string }).detail ||
          (error as { message?: string }).message ||
          "Research failed";
        throw new Error(message);
      }

      return data;
    },
    ...options,
  });
}

/**
 * Hook for deep research endpoint (two-layer research)
 *
 * @example
 * ```tsx
 * const deepResearch = useDeepResearch();
 *
 * deepResearch.mutate({ query: "Climate change solutions" }, {
 *   onSuccess: (data) => console.log(data),
 * });
 * ```
 */
export function useDeepResearch(
  options?: UseMutationOptions<DeepResearchResponse, Error, ResearchRequest>
) {
  return useMutation({
    mutationFn: async (request: ResearchRequest) => {
      const { data, error } = await apiClient.POST("/deep-research", {
        body: request,
      });

      if (error) {
        const message =
          (error as { detail?: string }).detail ||
          (error as { message?: string }).message ||
          "Deep research failed";
        throw new Error(message);
      }

      return data;
    },
    ...options,
  });
}

/**
 * Hook for multi-agent research endpoint
 *
 * @example
 * ```tsx
 * const multiAgentResearch = useMultiAgentResearch();
 *
 * multiAgentResearch.mutate({ query: "AI safety research" }, {
 *   onSuccess: (data) => {
 *     console.log(`Analyzed by ${data.subagents} agents`);
 *     console.log(`Total sources: ${data.total_sources}`);
 *   },
 * });
 * ```
 */
export function useMultiAgentResearch(
  options?: UseMutationOptions<
    MultiAgentResearchResponse,
    Error,
    ResearchRequest
  >
) {
  return useMutation({
    mutationFn: async (request: ResearchRequest) => {
      const { data, error } = await apiClient.POST("/multi-agent-research", {
        body: request,
      });

      if (error) {
        const message =
          (error as { detail?: string }).detail ||
          (error as { message?: string }).message ||
          "Multi-agent research failed";
        throw new Error(message);
      }

      return data;
    },
    ...options,
  });
}

/**
 * Chat message type
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Hook for streaming chat with conversation history
 *
 * @example
 * ```tsx
 * const chat = useChatStream();
 *
 * const handleSend = async (message: string) => {
 *   await chat.sendMessage(message, {
 *     onChunk: (text) => console.log("Received:", text),
 *     onComplete: () => console.log("Done!"),
 *   });
 * };
 * ```
 */
export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      options?: {
        onChunk?: (content: string) => void;
        onComplete?: (fullResponse: string) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      setIsStreaming(true);
      setError(null);

      let fullResponse = "";
      abortControllerRef.current = new AbortController();

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversation_history: conversationHistory,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Decode with stream flag for partial UTF-8 sequences
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep last partial line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.content) {
                fullResponse += data.content;
                options?.onChunk?.(data.content);
              }

              if (data.done === true) {
                setConversationHistory((prev) => [
                  ...prev,
                  { role: "user", content: message },
                  { role: "assistant", content: fullResponse },
                ]);
                options?.onComplete?.(fullResponse);
              }
            } catch (e) {
              console.error("Failed to parse SSE:", line, e);
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Stream cancelled');
          return;
        }
        const error = err instanceof Error ? err : new Error("Streaming failed");
        setError(error);
        options?.onError?.(error);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [conversationHistory]
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const resetConversation = useCallback(() => {
    setConversationHistory([]);
    setError(null);
  }, []);

  return {
    sendMessage,
    cancelStream,
    isStreaming,
    error,
    conversationHistory,
    resetConversation,
  };
}
