"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

export default function UserProfile() {
  // No auth needed for hackathon project
  return (
    <Link
      role="button"
      href="/settings"
      aria-label="Go to settings"
      className={cn(
        "flex w-full select-none items-center rounded-lg hover:bg-[#e8e4df] justify-between gap-3 px-3 py-3 focus:bg-[#e8e4df] focus:outline-2"
      )}
    >
      <div className="flex w-full min-w-0 flex-row items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[#8b7d70] flex items-center justify-center text-white font-medium text-sm">
          M
        </div>
        <div className="flex min-w-0 flex-col text-foreground">
          <span className="truncate text-sm font-medium text-[#37322f]">
            Math Explorer
          </span>
        </div>
      </div>
    </Link>
  );
}
