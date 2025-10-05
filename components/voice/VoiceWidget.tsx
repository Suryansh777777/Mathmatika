"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import VoiceWidgetButton from "./VoiceWidgetButton";
import VoiceWidgetDialog from "./VoiceWidgetDialog";

type WidgetState = "collapsed" | "loading" | "connected" | "speaking";

export default function VoiceWidget() {
  const [muted, setMuted] = useState(false);
  const [state, setState] = useState<WidgetState>("collapsed");
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);

  // Simulate connection process (replace with actual LiveKit connection later)
  const connect = useCallback(() => {
    setState("loading");
    // Simulate connection delay
    setTimeout(() => {
      setConnected(true);
      setState("connected");
    }, 1500);
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setState("collapsed");
    setMuted(false);
  }, []);

  // Keep UI state in sync with connection and audio
  useEffect(() => {
    if (!connected) {
      setState("collapsed");
      return;
    }
    if (connected && volume > 0.01) {
      setState("speaking");
    } else {
      setState("connected");
    }
  }, [connected, volume]);

  // Handlers
  const handleWidgetClick = useCallback(() => {
    if (state === "collapsed") {
      connect();
    }
  }, [state, connect]);

  const handleMicToggle = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const endAndClose = useCallback(() => {
    setMuted(false);
    disconnect();
  }, [disconnect]);

  const handleEndCall = endAndClose;
  const handleClose = endAndClose;

  // Memoize computed values to prevent unnecessary re-renders
  const isExpanded = useMemo(
    () => state === "connected" || state === "speaking",
    [state]
  );

  const isListening = useMemo(() => connected && !muted, [connected, muted]);

  // Memoize AIOrb status to prevent constant prop changes
  const orbStatus = useMemo(() => {
    if (state === "speaking") return "processing";
    if (isListening) return "listening";
    return "idle";
  }, [state, isListening]);

  return (
    <div
      className={`fixed right-2 bottom-2 z-50 transition-all duration-300 ${
        isExpanded ? "w-full max-w-sm" : ""
      }`}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {!isExpanded && (
          <VoiceWidgetButton
            isLoading={state === "loading"}
            onClick={handleWidgetClick}
            disabled={state === "loading"}
          />
        )}

        {isExpanded && (
          <VoiceWidgetDialog
            orbStatus={orbStatus}
            isListening={isListening}
            connected={connected}
            onClose={handleClose}
            onMicToggle={handleMicToggle}
            onEndCall={handleEndCall}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
