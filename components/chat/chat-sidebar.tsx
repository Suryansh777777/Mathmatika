"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/chat/logo";
import ThreadList from "@/components/chat/thread-list";
import UserProfile from "@/components/chat/user-profile";

export default function ChatSidebar() {
  return (
    <Sidebar className="z-50 border-none p-2 bg-[#F7F5F3]">
      <SidebarHeader className="flex flex-col gap-2 relative m-1 mb-0 space-y-1 p-0">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="small-scrollbar scroll-shadow relative pb-2">
        <ThreadList />
      </SidebarContent>
      <SidebarFooter className="m-0 pt-0">
        <UserProfile />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
