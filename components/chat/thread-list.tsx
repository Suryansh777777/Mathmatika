"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteThread } from "@/lib/chat-storage";
import { useParams, useRouter } from "next/navigation";

// Mock data structure - replace with your actual data source
interface Thread {
  id: string;
  title: string;
  timestamp: number;
  pinned: boolean;
}

interface GroupedThreads {
  period: string;
  conversations: Thread[];
}

// Helper function to group threads by period
function groupThreadsByPeriod(threads: Thread[]): GroupedThreads[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
  const last7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();

  const grouped: { [key: string]: GroupedThreads } = {
    Pinned: { period: "Pinned", conversations: [] },
    Today: { period: "Today", conversations: [] },
    Yesterday: { period: "Yesterday", conversations: [] },
    "Last 7 days": { period: "Last 7 days", conversations: [] },
    "Last month": { period: "Last month", conversations: [] },
    Older: { period: "Older", conversations: [] },
  };

  const sortedThreads = [...threads].sort((a, b) => b.timestamp - a.timestamp);

  sortedThreads.forEach((thread) => {
    const threadTimestamp = thread.timestamp;

    if (thread.pinned) {
      grouped.Pinned.conversations.push(thread);
    } else if (threadTimestamp >= today) {
      grouped.Today.conversations.push(thread);
    } else if (threadTimestamp >= yesterday) {
      grouped.Yesterday.conversations.push(thread);
    } else if (threadTimestamp >= last7Days) {
      grouped["Last 7 days"].conversations.push(thread);
    } else if (threadTimestamp >= lastMonth) {
      grouped["Last month"].conversations.push(thread);
    } else {
      grouped.Older.conversations.push(thread);
    }
  });

  const orderedGroups: GroupedThreads[] = [];
  if (grouped.Pinned.conversations.length > 0) orderedGroups.push(grouped.Pinned);
  if (grouped.Today.conversations.length > 0) orderedGroups.push(grouped.Today);
  if (grouped.Yesterday.conversations.length > 0) orderedGroups.push(grouped.Yesterday);
  if (grouped["Last 7 days"].conversations.length > 0) orderedGroups.push(grouped["Last 7 days"]);
  if (grouped["Last month"].conversations.length > 0) orderedGroups.push(grouped["Last month"]);
  if (grouped.Older.conversations.length > 0) orderedGroups.push(grouped.Older);

  return orderedGroups;
}

interface ThreadListProps {
  searchQuery?: string;
}

export default function ThreadList({ searchQuery = "" }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const params = useParams();
  const router = useRouter();
  const currentThreadId = params?.id as string | undefined;

  // Load threads from localStorage
  useEffect(() => {
    const loadThreads = () => {
      if (typeof window === "undefined") return;

      try {
        const stored = localStorage.getItem("mathmatika_chat_threads");
        if (stored) {
          const allThreads = JSON.parse(stored);
          setThreads(allThreads);
        }
      } catch (error) {
        console.error("Failed to load threads:", error);
      }
    };

    loadThreads();

    // Listen for thread updates
    const handleThreadsUpdate = () => loadThreads();
    window.addEventListener("threads-updated", handleThreadsUpdate);

    return () => {
      window.removeEventListener("threads-updated", handleThreadsUpdate);
    };
  }, []);

  // Filter threads based on search query
  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedThreads = groupThreadsByPeriod(filteredThreads);

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteThread(threadId);

      // If we're currently viewing this thread, redirect to chat home
      if (currentThreadId === threadId) {
        router.push("/chat");
      }
    }
  };

  return (
    <div className="relative flex-1">
      {threads.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-slide-up">
          <Icon name="newThread" className="size-12 text-[#8b7d70]/30 mb-3" />
          <p className="text-sm text-[#8b7d70]">No conversations yet</p>
          <p className="text-xs text-[#8b7d70]/60 mt-1">Start a new chat to begin</p>
        </div>
      )}
      {groupedThreads.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-slide-up">
          <p className="text-sm text-[#8b7d70]">No threads found</p>
          <p className="text-xs text-[#8b7d70]/60 mt-1">Try a different search term</p>
        </div>
      )}
      {groupedThreads.map((group) => (
        <Collapsible
          key={group.period}
          defaultOpen
          className="group/collapsible animate-slide-up"
        >
          <SidebarGroup>
            <SidebarGroupLabel className="select-none px-2 py-1.5 text-heading hover:bg-[#e8e4df]/30 rounded-md transition-colors duration-150" asChild>
              <CollapsibleTrigger className="group/label">
                <span className="text-[#37322f] font-semibold text-xs uppercase tracking-wider">{group.period}</span>
                <Icon
                  name="collapse"
                  className="ml-auto transition-all duration-200 group-data-[state=open]/collapsible:rotate-90 text-[#8b7d70] group-hover/label:text-[#37322f] w-3.5 h-3.5"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="text-sm">
                  {group.conversations.map((conversation, index) => (
                    <span className="select-none animate-slide-up" key={conversation.id} style={{ animationDelay: `${index * 30}ms` }}>
                      <SidebarMenuItem>
                        <Link
                          href={`/chat/${conversation.id}`}
                          className="group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-3 py-2 pr-8 text-sm outline-none hover:bg-[#e8e4df]/60 focus-visible:bg-[#e8e4df]/60 focus-visible:ring-1 focus-visible:ring-[#8b7d70]/20 active:scale-98 transition-all duration-150"
                        >
                          <div className="relative flex w-full items-center min-w-0">
                            <span className="truncate text-sm text-[#5a5550] group-hover/link:text-[#37322f] transition-colors duration-150 font-medium">
                              {conversation.title}
                            </span>
                          </div>
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-[#37322f] scale-y-0 group-hover/link:scale-y-100 transition-transform duration-200 origin-center rounded-r-full"></div>
                        </Link>
                        <SidebarMenuAction
                          onClick={(e) => handleDeleteThread(conversation.id, e)}
                          showOnHover
                          className="text-[#8b7d70]/60 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Delete conversation</span>
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    </span>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </div>
  );
}
