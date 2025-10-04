"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Logo() {
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key === "o"
      ) {
        event.preventDefault();
        router.push("/chat");
      }
    };

    document.addEventListener("keydown", handleKeyPress, { signal });

    return () => {
      controller.abort();
    };
  }, [router]);

  return (
    <>
      <h1 className="flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75">
        <Link
          className="relative flex h-8 w-full items-center justify-center text-sm font-semibold text-foreground"
          href="/chat"
        >
          <div className="h-3.5 select-none text-[#37322f] font-semibold text-lg">
            Mathematiks
          </div>
        </Link>
      </h1>
      <div className="px-1">
        <Button
          asChild
          className="w-full select-none bg-[#37322f] font-semibold border-reflect button-reflect focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-[#4a443f] active:bg-[#37322f] disabled:hover:bg-[#37322f] disabled:active:bg-[#37322f] text-white"
        >
          <Link href="/chat">
            <span className="w-full select-none text-center">New Chat</span>
          </Link>
        </Button>
      </div>
    </>
  );
}
