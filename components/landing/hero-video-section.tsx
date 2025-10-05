"use client";

import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function HeroVideoSection() {
  const videoId = "tDRjmjhuMfg";
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const [videoSrc, setVideoSrc] = useState(() => {
    const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      loop: "1",
      playlist: videoId,
      controls: "0",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      showinfo: "0",
      iv_load_policy: "3",
      enablejsapi: "1",
      fs: "0",
    });
    return `${base}?${params.toString()}`;
  });

  useEffect(() => {
    const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      loop: "1",
      playlist: videoId,

      origin: window.location.origin,
    });
    setVideoSrc(`${base}?${params.toString()}`);
  }, [videoId]);

  const handleToggleMute = () => {
    const contentWindow = iframeRef.current?.contentWindow;
    if (!contentWindow) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    const post = (func: string, args: unknown[] = []) => {
      contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    };

    if (newMutedState) {
      post("mute");
    } else {
      post("unMute");
      post("setVolume", [100]);
      post("playVideo");
    }
  };

  return (
    <div className="relative  mt-6 sm:mt-10">
      <div className="relative size-full rounded-3xl overflow-x-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
            opacity: isVideoLoaded ? 0 : 1,
          }}
        />
        <div
          className="group relative cursor-pointer w-full aspect-video transition-colors duration-700"
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleToggleMute();
            }
          }}
        >
          <iframe
            ref={iframeRef}
            src={videoSrc}
            className="w-full h-full"
            title="Hero Video"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ pointerEvents: "auto" }}
            onLoad={() => setIsVideoLoaded(true)}
          />

          {/* Always visible on mobile, hover on desktop */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-out ${
              isMuted
                ? "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          ></div>

          {/* Mobile-specific mute indicator - always visible when muted */}
          {/* <div
            className={`absolute top-4 right-4 sm:hidden transition-opacity duration-300 ${
              isMuted ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm">
              <VolumeX className="size-5 text-white" />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
