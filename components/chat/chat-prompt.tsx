"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useLocalStorage } from "usehooks-ts";
import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRAGUpload } from "@/lib/api/hooks";
import { useToast } from "@/hooks/use-toast";

export const DRAFT_KEY = "draft_prompt";
const MAX_TEXTAREA_HEIGHT = 240;
const LINE_HEIGHT_PX = 24;

interface ChatPromptProps {
  input: string;
  setInput: (input: string) => void;
  append: (message: string) => Promise<void>;
  videoEnabled?: boolean;
  onVideoToggle?: (enabled: boolean) => void;
  enableVideoLayout?: boolean;
  uploadedPdfInfo?: { filename: string; indexName: string } | null;
  onPdfUpload?: (info: { filename: string; indexName: string } | null) => void;
}

const modelRegistry = {
  "gpt-4": { provider: "openai", modelId: "gpt-4" },
  "gpt-4o": { provider: "openai", modelId: "gpt-4o" },
  "claude-3.5": { provider: "anthropic", modelId: "claude-3-5-sonnet" },
  "gemini-2.0": { provider: "google", modelId: "gemini-2.0-flash" },
};

export default function ChatPrompt({
  input,
  setInput,
  append,
  videoEnabled = false,
  onVideoToggle,
  enableVideoLayout = false,
  uploadedPdfInfo,
  onPdfUpload,
}: ChatPromptProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft, removeDraft] = useLocalStorage<string>(DRAFT_KEY, "");
  const [model, setModel] = useLocalStorage<string>("selected_model", "gpt-4o");

  useEffect(() => {
    setInput(draft);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(
        textareaRef.current.scrollHeight,
        MAX_TEXTAREA_HEIGHT
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [input]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim().length === 0) return;
    await append(input);
    removeDraft();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = `${LINE_HEIGHT_PX * 2}px`;
    }
  };

  const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setDraft(e.target.value.trim());
    setInput(e.target.value);

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${newHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  return (
    <PromptWrapper videoEnabled={enableVideoLayout && videoEnabled}>
      <form
        ref={formRef}
        className="relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-[#d4cfc8]/70 glass-dark px-3 pt-3 text-secondary-foreground outline-8 outline-[#e8e4df]/50 pb-3 max-sm:pb-6 sm:max-w-3xl shadow-elegant-lg transition-shadow duration-200"
        style={{
          boxShadow:
            "rgba(55, 50, 47, 0.1) 0px 80px 50px 0px, rgba(55, 50, 47, 0.07) 0px 50px 30px 0px, rgba(55, 50, 47, 0.06) 0px 30px 15px 0px, rgba(55, 50, 47, 0.04) 0px 15px 8px, rgba(55, 50, 47, 0.04) 0px 6px 4px, rgba(55, 50, 47, 0.02) 0px 2px 2px",
        }}
        onSubmit={submitHandler}
      >
        <div className="flex flex-grow flex-col">
          <div className="flex flex-grow flex-row items-start">
            <textarea
              ref={textareaRef}
              name="input"
              id="chat-input"
              placeholder="Type your mathematics question here..."
              aria-label="Message input"
              aria-describedby="chat-input-description"
              autoComplete="off"
              className="w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-[#8b7d70]/60 disabled:opacity-0"
              style={{ height: "48px !important" }}
              value={input || draft || ""}
              autoFocus={!!input}
              onChange={changeHandler}
              onKeyDown={handleKeyDown}
            />
            <div id="chat-input-description" className="sr-only">
              Press Enter to send, Shift+Enter to new line
            </div>
          </div>
          <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
            <SendButton />
            <PromptActions
              model={model}
              setModel={setModel}
              videoEnabled={videoEnabled}
              onVideoToggle={onVideoToggle}
              uploadedPdfInfo={uploadedPdfInfo}
              onPdfUpload={onPdfUpload}
            />
          </div>
        </div>
      </form>
    </PromptWrapper>
  );
}

const SendButton = () => {
  const [draft] = useLocalStorage<string>(DRAFT_KEY, "");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2"
      aria-label="Message actions"
    >
      <Button
        variant="ghost"
        size="icon"
        className="border-reflect button-reflect bg-[#37322f] font-semibold shadow-sm hover:shadow-md hover:bg-[#4a443f] active:bg-[#37322f] active:scale-95 disabled:hover:bg-[#37322f] disabled:active:bg-[#37322f] h-9 w-9 relative rounded-lg p-2 text-white hover:text-white disabled:hover:text-white transition-all duration-150"
        disabled={draft.trim().length === 0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon
          name="send"
          className={`!size-5 transition-transform duration-150 ${
            isHovered ? "translate-x-0.5 -translate-y-0.5" : ""
          }`}
        />
      </Button>
    </div>
  );
};

const UploadButton = ({
  uploadedPdfInfo,
  onPdfUpload,
}: {
  uploadedPdfInfo?: { filename: string; indexName: string } | null;
  onPdfUpload?: (info: { filename: string; indexName: string } | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useRAGUpload();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    console.log("📤 Starting upload...");

    upload.mutate(
      { file: selectedFile },
      {
        onSuccess: (data) => {
          console.log("✅ Upload successful:", data);

          const pdfInfo = {
            filename: data.filename,
            indexName: data.index_name,
          };

          console.log("📎 Setting PDF info:", pdfInfo);
          console.log("📎 onPdfUpload function exists?", !!onPdfUpload);

          if (onPdfUpload) {
            console.log("📎 Calling onPdfUpload NOW...");
            onPdfUpload(pdfInfo);
            console.log("📎 onPdfUpload called successfully");
          } else {
            console.error("❌ onPdfUpload is undefined!");
          }

          toast({
            title: "Upload successful",
            description: `${data.filename} indexed with ${data.chunks} chunks`,
          });

          setSelectedFile(null);
          setOpen(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
        onError: (error) => {
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemovePdf = () => {
    onPdfUpload?.(null);
    toast({
      title: "PDF removed",
      description: "Switched back to normal chat mode",
    });
  };

  const isPdfAttached = !!uploadedPdfInfo;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={`text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid py-1.5 pl-2 pr-2.5 max-sm:p-2 transition-all duration-200 ${
            isPdfAttached
              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/40 text-green-700 shadow-md hover:shadow-lg"
              : "border-[#8b7d70]/10 text-[#5a5550] hover:border-[#8b7d70]/30 hover:shadow-sm"
          }`}
        >
          <Icon name="media" />
          {isPdfAttached && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-lg bg-background p-4 text-popover-foreground shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">Upload PDF</h3>
            <p className="text-xs text-muted-foreground">
              Upload a PDF document to enable RAG-powered Q&A
            </p>
          </div>

          {isPdfAttached ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/20 p-3">
                <Icon name="media" className="!size-4 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-700 truncate">
                    {uploadedPdfInfo.filename}
                  </p>
                  <p className="text-xs text-green-600/80">
                    Index: {uploadedPdfInfo.indexName}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemovePdf}
                variant="outline"
                className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                size="sm"
              >
                Remove PDF
              </Button>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="text-xs text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-[#37322f] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-[#4a443f] file:transition-colors"
              />

              {selectedFile && (
                <div className="flex items-center gap-2 rounded-md bg-muted/30 p-2">
                  <Icon name="media" className="!size-4 text-muted-foreground" />
                  <span className="text-xs text-foreground truncate flex-1">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || upload.isPending}
                className="w-full bg-[#37322f] hover:bg-[#4a443f] text-white"
                size="sm"
              >
                {upload.isPending ? "Uploading..." : "Upload"}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PromptActions = ({
  model,
  setModel,
  videoEnabled,
  onVideoToggle,
  uploadedPdfInfo,
  onPdfUpload,
}: {
  model: string;
  setModel: (model: string) => void;
  videoEnabled?: boolean;
  onVideoToggle?: (enabled: boolean) => void;
  uploadedPdfInfo?: { filename: string; indexName: string } | null;
  onPdfUpload?: (info: { filename: string; indexName: string } | null) => void;
}) => {
  const handleClick = (key: string) => {
    setModel(key);
  };

  return (
    <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
      <div className="ml-[-7px] flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              className="h-8 text-xs gap-2 px-2 py-1.5 -mb-2 text-[#5a5550]"
            >
              {model}
              <Icon name="models" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 rounded-lg bg-background p-4 text-popover-foreground shadow-xl">
            <div className="flex flex-col gap-2">
              {Object.keys(modelRegistry).map((key) => (
                <Button
                  variant="ghost"
                  key={key}
                  className="flex items-center gap-2"
                  onClick={() => handleClick(key)}
                >
                  <span className="text-sm">{key}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          className="text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-[#8b7d70]/10 py-1.5 pl-2 pr-2.5 text-[#5a5550] max-sm:p-2 hover:border-[#8b7d70]/30 hover:shadow-sm transition-all duration-200"
        >
          <Icon name="web" />
          Search
        </Button>
        <UploadButton uploadedPdfInfo={uploadedPdfInfo} onPdfUpload={onPdfUpload} />
        <Button
          variant="outline"
          type="button"
          onClick={() => onVideoToggle?.(!videoEnabled)}
          className={`text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid py-1.5 pl-2 pr-2.5 max-sm:p-2 transition-all duration-200 ${
            videoEnabled
              ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/40 text-purple-700 shadow-md hover:shadow-lg"
              : "border-[#8b7d70]/10 text-[#5a5550] hover:border-[#8b7d70]/30 hover:shadow-sm"
          }`}
          title={
            videoEnabled
              ? "Disable video generation"
              : "Enable video generation"
          }
        >
          <span className={videoEnabled ? "text-lg" : ""}>🎬</span>
          <span className="max-sm:hidden">Video</span>
          {videoEnabled && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

const PromptWrapper = ({
  children,
  videoEnabled = false,
}: {
  children: React.ReactNode;
  videoEnabled?: boolean;
}) => {
  return (
    <div
      className={`pointer-events-none absolute bottom-0 z-10 px-2 transition-all duration-300 ${
        videoEnabled ? "w-[60%]" : "w-full"
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
        <div className="pointer-events-none">
          <div className="pointer-events-auto">
            <div
              className="border-reflect rounded-t-[20px] bg-[#fdfcfb] p-2 pb-0 backdrop-blur-lg"
              style={
                {
                  "--c": "30 15% 75%",
                  "--gradientBorder-gradient":
                    "linear-gradient(180deg, var(--min), var(--max), var(--min)), linear-gradient(15deg, var(--min) 50%, var(--max))",
                  "--start": "#f7f5f3e0",
                  "--opacity": 1,
                } as React.CSSProperties
              }
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
