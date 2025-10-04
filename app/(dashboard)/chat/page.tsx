"use client";

import ChatPrompt, { DRAFT_KEY } from "@/components/chat/chat-prompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/icon";
import { IconType } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "usehooks-ts";
import { useState } from "react";
import { useRouter } from "next/navigation";

const promptSuggestions: Record<string, { title: string; icon: IconType; prompts: string[] }> = {
  create: {
    title: "Create",
    icon: "create",
    prompts: [
      "Generate practice problems for quadratic equations",
      "Create a step-by-step guide for integration by parts",
      "Design a visual proof of the Pythagorean theorem",
      "Build a study schedule for calculus exam prep",
    ]
  },
  explore: {
    title: "Explore",
    icon: "explore",
    prompts: [
      "What are the real-world applications of linear algebra?",
      "History of calculus and its impact on science",
      "Most beautiful mathematical theorems",
      "How does number theory relate to cryptography?",
    ]
  },
  code: {
    title: "Code",
    icon: "code",
    prompts: [
      "Write Python code to solve a system of linear equations",
      "Implement the Euclidean algorithm in JavaScript",
      "Create a matrix multiplication function",
      "Code a numerical derivative calculator",
    ]
  },
  learn: {
    title: "Learn",
    icon: "learn",
    prompts: [
      "Explain derivatives using simple analogies",
      "What is the fundamental theorem of calculus?",
      "Beginner's guide to trigonometric identities",
      "How do logarithms work?",
    ]
  }
};

export default function ChatHome() {
  const router = useRouter();
  const [_, setDraft] = useLocalStorage<string>(DRAFT_KEY, "");
  const [input, setInput] = useState("");

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setDraft(prompt);
  };

  const handleAppend = async (message: string) => {
    // TODO: Integrate with your backend API
    // For now, just create a new thread and navigate
    const threadId = Date.now().toString(); // Replace with actual thread creation
    router.push(`/chat/${threadId}`);
  };

  return (
    <>
      <ChatPrompt
        input={input}
        setInput={setInput}
        append={handleAppend}
      />
      <div className="absolute inset-0 overflow-y-scroll sm:pt-3.5 pb-[144px] smooth-scroll" style={{ scrollbarGutter: "stable both-edges" }}>
        <div role="log" aria-label="Chat messages" aria-live="polite" className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 py-10">
          <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
            <div
              className={cn(
                "w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8",
                input.length && "pointer-events-none opacity-0 animate-out fade-out-0 zoom-out-105"
              )}
            >
              <h2 className="text-3xl font-semibold text-[#37322f] animate-slide-up">
                How can I help you with mathematics today?
              </h2>
              <Tabs
                defaultValue={Object.keys(promptSuggestions)[0]}
                className="gap-6 animate-slide-up [animation-delay:100ms]"
              >
                <TabsList className="gap-2.5 text-sm max-sm:justify-evenly bg-transparent p-0">
                  {Object.keys(promptSuggestions).map((key) => (
                    <TabsTrigger key={key} value={key}>
                      <Icon name={promptSuggestions[key].icon} className="max-sm:block" />
                      {promptSuggestions[key].title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.keys(promptSuggestions).map((key) => (
                  <TabsContent value={key} key={key}>
                    {promptSuggestions[key].prompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="border-t border-[#d4cfc8]/40 py-1 first:border-none animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <button
                          onMouseDown={() => handlePromptClick(prompt)}
                          className="w-full rounded-md py-2.5 px-3 text-left text-[#5a5550] hover:bg-[#e8e4df]/50 cursor-pointer transition-all duration-150 group relative overflow-hidden"
                        >
                          <span className="group-hover:text-[#37322f] transition-colors duration-150 relative z-10">{prompt}</span>
                          <div className="absolute inset-y-0 left-0 w-1 bg-[#37322f] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                        </button>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
