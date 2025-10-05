"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatBackground from "@/components/chat/chat-background";
import { SidebarToggle } from "@/components/chat/sidebar-toggle";
import { VoiceWidget } from "@/components/voice";

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
        <SidebarToggle />
        {children}
        <VoiceWidget />
      </SidebarInset>
    </SidebarProvider>
  );
}
