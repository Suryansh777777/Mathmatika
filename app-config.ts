import type { AppConfig } from "@/lib/voice/types";

export const VOICE_CONFIG_DEFAULTS: AppConfig = {
  supportsChatInput: false,  // Voice only, no text chat
  supportsVideoInput: false, // Audio only mentor
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,
};
