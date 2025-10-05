"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/chat/logo";
import ThreadList from "@/components/chat/thread-list";
import { Icon } from "@/components/icon";
import { useState } from "react";
import { XIcon } from "lucide-react";

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Sidebar className="z-50 border-none p-0 bg-gradient-to-b from-[#F7F5F3] to-[#f0ede9]">
      <SidebarHeader className="flex flex-col gap-3 relative px-3 pt-4 pb-3 border-b border-[#d4cfc8]/30">
        <Logo />
        <div className="relative group">
          <Icon
            name="search"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[#8b7d70]/60 transition-all duration-150 group-focus-within:text-[#37322f] group-focus-within:scale-110"
          />
          <input
            type="text"
            placeholder="Search your threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2 text-sm bg-[#e8e4df]/40 border border-[#d4cfc8]/40 rounded-lg text-[#37322f] placeholder:text-[#8b7d70]/50 focus:outline-none focus:border-[#8b7d70]/50 focus:bg-[#e8e4df]/60 focus:shadow-sm transition-all duration-150"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-md hover:bg-[#d4cfc8]/40 text-[#8b7d70]/60 hover:text-[#37322f] transition-all duration-150 animate-slide-up"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="small-scrollbar scroll-shadow relative px-2 py-3">
        <ThreadList searchQuery={searchQuery} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
