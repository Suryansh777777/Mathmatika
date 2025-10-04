import { useMutation } from "@tanstack/react-query";

import { useState, useCallback, useRef } from "react";

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
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      options?: {
        conversationHistory?: ChatMessage[];
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
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversation_history: options?.conversationHistory || [],
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
                options?.onComplete?.(fullResponse);
              }
            } catch (e) {
              console.error("Failed to parse SSE:", line, e);
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Stream cancelled");
          return;
        }
        const error =
          err instanceof Error ? err : new Error("Streaming failed");
        setError(error);
        options?.onError?.(error);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    sendMessage,
    cancelStream,
    isStreaming,
    error,
  };
}

/**
 * Hook for generating Manim animations
 *
 * @example
 * ```tsx
 * const manim = useManimGeneration();
 *
 * manim.mutate({
 *   concept: "derivative of x^2",
 *   quality: "medium",
 *   use_ai: true
 * }, {
 *   onSuccess: (data) => console.log(data.video_url),
 * });
 * ```
 */
export function useManimGeneration() {
  return useMutation({
    mutationFn: async (request: {
      concept: string;
      quality?: "low" | "medium" | "high";
      use_ai?: boolean;
    }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      console.log("🎬 Manim Generation Request:", {
        apiUrl,
        concept: request.concept,
        quality: request.quality,
        use_ai: request.use_ai,
      });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      try {
        const response = await fetch(`${apiUrl}/manim/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            concept: request.concept,
            quality: request.quality || "medium",
            use_ai: request.use_ai !== false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("🎬 Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("🎬 Error response:", errorData);
          throw new Error(
            errorData.detail ||
              `HTTP ${response.status}: Failed to generate animation`
          );
        }

        const data = await response.json();
        console.log("🎬 Success response:", data);

        // Validate response
        if (!data.success) {
          console.error("🎬 Generation failed:", data.error, data.details);
          throw new Error(
            data.error || data.details || "Animation generation failed"
          );
        }

        return data;
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof Error && err.name === "AbortError") {
          throw new Error(
            "Animation generation timed out. Try with lower quality or simpler concept."
          );
        }

        console.error("🎬 Manim generation error:", err);
        throw err;
      }
    },
    retry: (failureCount, error) => {
      console.log("🎬 Retry attempt:", failureCount, error.message);
      // Retry up to 2 times, but not for timeout errors
      if (error.message.includes("timed out")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Hook for RAG PDF upload
 */
export function useRAGUpload() {
  return useMutation({
    mutationFn: async (data: { file: File; indexName?: string }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("file", data.file);
      if (data.indexName) {
        formData.append("index_name", data.indexName);
      }

      const response = await fetch(`${apiUrl}/rag/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: Failed to upload PDF`
        );
      }

      return response.json();
    },
  });
}

/**
 * Hook for RAG query streaming
 */
export function useRAGQuery() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const query = useCallback(
    async (
      question: string,
      options?: {
        indexName?: string;
        onChunk?: (content: string) => void;
        onComplete?: (fullResponse: string, sources: any[]) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      setIsStreaming(true);
      setError(null);

      let fullResponse = "";
      let sources: any[] = [];
      abortControllerRef.current = new AbortController();

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/rag/query/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: question,
            index_name: options?.indexName || "pdf-index",
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

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

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

              if (data.sources) {
                sources = data.sources;
              }

              if (data.done === true) {
                options?.onComplete?.(fullResponse, sources);
              }
            } catch (e) {
              console.error("Failed to parse SSE:", line, e);
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Stream cancelled");
          return;
        }
        const error =
          err instanceof Error ? err : new Error("Streaming failed");
        setError(error);
        options?.onError?.(error);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    query,
    cancelStream,
    isStreaming,
    error,
  };
}

/**
 * Hook for text-to-speech
 */
export function useTextToSpeech() {
  return useMutation({
    mutationFn: async (data: {
      text: string;
      voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
      model?: "tts-1" | "tts-1-hd";
      speed?: number;
    }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/voice/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: data.text,
          voice: data.voice || "alloy",
          model: data.model || "tts-1",
          speed: data.speed || 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: Failed to generate speech`
        );
      }

      // Return audio blob
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    },
  });
}

/**
 * Hook for speech-to-text
 */
export function useSpeechToText() {
  return useMutation({
    mutationFn: async (audioFile: File) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("audio", audioFile);

      const response = await fetch(`${apiUrl}/voice/speech-to-text`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: Failed to transcribe audio`
        );
      }

      return response.json();
    },
  });
}
