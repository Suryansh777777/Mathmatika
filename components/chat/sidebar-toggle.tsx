"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon } from "lucide-react";

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="fixed left-4 top-3 z-50 size-10 rounded-lg hover:bg-[#e8e4df] hover:border-[#8b7d70]/30 active:scale-95 backdrop-blur-sm transition-all duration-150"
      aria-label="Toggle sidebar"
    >
      <PanelLeftIcon
        className={`size-4 text-[#37322f] transition-transform duration-200 `}
      />
    </Button>
  );
}
