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
        "flex w-full select-none items-center rounded-lg hover:bg-[#e8e4df]/60 justify-between gap-3 px-3 py-2.5 focus:bg-[#e8e4df]/60 focus:outline-1 focus:outline-[#8b7d70]/20 transition-all duration-150 group/user"
      )}
    >
      <div className="flex w-full min-w-0 flex-row items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8b7d70] to-[#6d6258] flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover/user:shadow-md transition-shadow duration-150">
          M
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-[#37322f]">
            Math Explorer
          </span>
        </div>
      </div>
    </Link>
  );
}
