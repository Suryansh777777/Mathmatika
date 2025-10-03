"use client";

import { useMutation } from "@tanstack/react-query";

interface ManimGenerateRequest {
  concept: string;
  quality?: "low" | "medium" | "high";
  use_ai?: boolean;
}

interface ManimGenerateResponse {
  success: boolean;
  video_url?: string;
  code?: string;
  used_ai: boolean;
  render_quality: string;
  error?: string;
  details?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useManimGenerate() {
  return useMutation<ManimGenerateResponse, Error, ManimGenerateRequest>({
    mutationFn: async (data) => {
      const response = await fetch(`${API_URL}/manim/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to generate animation: ${response.statusText}`);
      }

      return response.json();
    },
  });
}