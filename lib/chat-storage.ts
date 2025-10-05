/**
 * Chat storage utilities for managing conversation threads
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  timestamp: number;
}

export interface ChatThread {
  id: string;
  title: string;
  timestamp: number;
  pinned: boolean;
  messages: ChatMessage[];
  lastMessagePreview?: string;
}

const STORAGE_KEY = "mathmatika_chat_threads";

/**
 * Get all chat threads from localStorage
 */
export function getAllThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load threads:", error);
    return [];
  }
}

/**
 * Get a specific thread by ID
 */
export function getThread(id: string): ChatThread | null {
  const threads = getAllThreads();
  return threads.find((t) => t.id === id) || null;
}

/**
 * Save or update a thread
 */
export function saveThread(thread: ChatThread): void {
  if (typeof window === "undefined") return;

  try {
    const threads = getAllThreads();
    const existingIndex = threads.findIndex((t) => t.id === thread.id);

    if (existingIndex >= 0) {
      threads[existingIndex] = thread;
    } else {
      threads.unshift(thread);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));

    // Dispatch custom event for thread updates
    window.dispatchEvent(new CustomEvent("threads-updated"));
  } catch (error) {
    console.error("Failed to save thread:", error);
  }
}

/**
 * Add a message to a thread
 */
export function addMessageToThread(
  threadId: string,
  message: Omit<ChatMessage, "timestamp">
): void {
  const thread = getThread(threadId);

  if (!thread) {
    // Create new thread
    const newMessage: ChatMessage = {
      ...message,
      timestamp: Date.now(),
    };

    const newThread: ChatThread = {
      id: threadId,
      title: generateThreadTitle(newMessage.content),
      timestamp: Date.now(),
      pinned: false,
      messages: [newMessage],
      lastMessagePreview: newMessage.content.slice(0, 100),
    };

    saveThread(newThread);
  } else {
    // Update existing thread
    const newMessage: ChatMessage = {
      ...message,
      timestamp: Date.now(),
    };

    thread.messages.push(newMessage);
    thread.timestamp = Date.now();
    thread.lastMessagePreview = newMessage.content.slice(0, 100);

    saveThread(thread);
  }
}

/**
 * Delete a thread
 */
export function deleteThread(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const threads = getAllThreads();
    const filtered = threads.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("threads-updated"));
  } catch (error) {
    console.error("Failed to delete thread:", error);
  }
}

/**
 * Toggle thread pin status
 */
export function toggleThreadPin(id: string): void {
  const thread = getThread(id);
  if (thread) {
    thread.pinned = !thread.pinned;
    saveThread(thread);
  }
}

/**
 * Generate a thread title from the first message
 */
function generateThreadTitle(message: string): string {
  // Remove markdown and trim to reasonable length
  const cleaned = message
    .replace(/[#*`_~]/g, "")
    .replace(/\$.*?\$/g, "")
    .trim();

  const maxLength = 40;
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.slice(0, maxLength).trim() + "...";
}

/**
 * Update thread title
 */
export function updateThreadTitle(id: string, title: string): void {
  const thread = getThread(id);
  if (thread) {
    thread.title = title;
    saveThread(thread);
  }
}
