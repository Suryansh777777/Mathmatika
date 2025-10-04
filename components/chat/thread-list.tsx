"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";

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

export default function ThreadList() {
  const [threads, setThreads] = useState<Thread[]>([]);

  // TODO: Replace with actual data fetching from your backend
  useEffect(() => {
    // Mock data - replace with your API call
    const mockThreads: Thread[] = [
      {
        id: "1",
        title: "Understanding calculus derivatives",
        timestamp: Date.now(),
        pinned: false,
      },
      {
        id: "2",
        title: "Linear algebra basics",
        timestamp: Date.now() - 86400000,
        pinned: true,
      },
    ];
    setThreads(mockThreads);
  }, []);

  const groupedThreads = groupThreadsByPeriod(threads);

  return (
    <div className="relative flex-1">
      {groupedThreads.map((group) => (
        <Collapsible
          key={group.period}
          defaultOpen
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel className="select-none px-1.5 text-heading" asChild>
              <CollapsibleTrigger>
                <span className="text-[#37322f] font-medium">{group.period}</span>
                <Icon
                  name="collapse"
                  className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 text-[#37322f]"
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="text-sm">
                  {group.conversations.map((conversation) => (
                    <span className="select-none" key={conversation.id}>
                      <SidebarMenuItem>
                        <div className="group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-[#e8e4df] focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring hover:focus-visible:bg-[#e8e4df]">
                          <div className="relative flex w-full items-center">
                            <Link
                              href={`/chat/${conversation.id}`}
                              className="w-full"
                            >
                              <input
                                aria-label="Thread title"
                                aria-describedby="thread-title-hint"
                                aria-readonly="true"
                                tabIndex={-1}
                                className="hover:truncate-none h-full w-full overflow-hidden rounded bg-transparent px-1 py-1 text-sm text-[#5a5550] outline-none pointer-events-none cursor-pointer truncate"
                                title={conversation.title}
                                type="text"
                                readOnly={true}
                                value={conversation.title}
                              />
                            </Link>
                          </div>
                        </div>
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
