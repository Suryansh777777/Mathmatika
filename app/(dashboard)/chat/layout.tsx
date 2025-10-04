"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatBackground from "@/components/chat/chat-background";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <ChatSidebar />
      <SidebarInset className="relative">
        <ChatBackground />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
