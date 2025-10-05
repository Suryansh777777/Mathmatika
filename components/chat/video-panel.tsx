"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useState, useRef, useEffect } from "react";

export type VideoQuality = "low" | "medium" | "high";

export interface VideoState {
  status: "idle" | "generating" | "ready" | "error";
  videoUrl?: string;
  error?: string;
  progress?: number;
}

interface VideoPanelProps {
  videoState: VideoState;
  quality?: VideoQuality;
  onQualityChange?: (quality: VideoQuality) => void;
  onRegenerate?: () => void;
  onClose?: () => void;
}

export function VideoPanel({
  videoState,
  onRegenerate,
  onClose,
}: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoState.status === "ready" && videoRef.current) {
      videoRef.current.load();
    }
  }, [videoState.videoUrl, videoState.status]);

  const handleDownload = () => {
    if (videoState.videoUrl) {
      const a = document.createElement("a");
      a.href = videoState.videoUrl;
      a.download = `math-animation-${Date.now()}.mp4`;
      a.click();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#fdfcfb] to-[#f7f5f3] border-l border-[#d4cfc8]/30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4cfc8]/30 bg-[#fdfcfb]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <h3 className="text-sm font-semibold text-[#37322f]">
            Video Generation
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 rounded-lg hover:bg-[#e8e4df]/50 text-[#8b7d70] hover:text-[#37322f]"
        >
          <Icon name="back" className="rotate-180" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Idle State */}
        {videoState.status === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-slide-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 shadow-elegant">
                <span className="text-6xl">📹</span>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-[#37322f] mb-2">
              Ready to visualize!
            </h4>
            <p className="text-sm text-[#8b7d70] max-w-xs mb-6">
              Send a message to generate an animated video explanation using
              Manim
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-xs text-[#8b7d70]/70">
              <span className="px-3 py-1 rounded-full bg-[#e8e4df]/50">
                LaTeX support
              </span>
              <span className="px-3 py-1 rounded-full bg-[#e8e4df]/50">
                HD Quality
              </span>
              <span className="px-3 py-1 rounded-full bg-[#e8e4df]/50">
                Instant download
              </span>
            </div>
          </div>
        )}

        {/* Generating State */}
        {videoState.status === "generating" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative">
                <svg className="w-24 h-24 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-[#37322f] mb-2">
              Generating animation...
            </h4>
            <p className="text-sm text-[#8b7d70] mb-6">
              Creating your mathematical visualization with Manim
            </p>
            {videoState.progress !== undefined && (
              <div className="w-full max-w-xs">
                <div className="h-2 bg-[#e8e4df] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${videoState.progress}%` }}
                  />
                </div>
                <p className="text-xs text-[#8b7d70] mt-2">
                  {videoState.progress}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ready State */}
        {videoState.status === "ready" && videoState.videoUrl && (
          <div className="flex-1 flex flex-col p-4 gap-4 animate-slide-up">
            <div className="relative flex-1 bg-[#37322f] rounded-xl overflow-hidden shadow-elegant-lg group">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                controls
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={videoState.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {!isPlaying && (
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="bg-white/90 rounded-full p-4 shadow-xl">
                    <svg
                      className="w-8 h-8 text-[#37322f]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1 h-9 gap-2 text-xs bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700 hover:shadow-md transition-all"
                >
                  <span>⬇</span>
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerate}
                  className="flex-1 h-9 gap-2 text-xs hover:bg-[#e8e4df]/50 hover:shadow-sm transition-all"
                >
                  <span>🔄</span>
                  Regenerate
                </Button>
              </div>

              {/* Quality Selector */}
              {/* <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5a5550]">Quality</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as VideoQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => onQualityChange(q)}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        quality === q
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                          : "bg-[#e8e4df]/50 text-[#5a5550] hover:bg-[#e8e4df] hover:shadow-sm"
                      )}
                    >
                      {q.charAt(0).toUpperCase() + q.slice(1)}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        )}

        {/* Error State */}
        {videoState.status === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-slide-up">
            <div className="relative mb-6">
              <div className="bg-red-100 rounded-2xl p-8 shadow-elegant">
                <span className="text-6xl">⚠️</span>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-[#37322f] mb-2">
              Generation failed
            </h4>
            <p className="text-sm text-[#8b7d70] max-w-xs mb-6">
              {videoState.error ||
                "Something went wrong while generating the video"}
            </p>
            <Button
              onClick={onRegenerate}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <span>🔄</span>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
