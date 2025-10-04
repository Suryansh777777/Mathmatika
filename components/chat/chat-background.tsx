import { cn } from "@/lib/utils";

export default function ChatBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-[#F7F5F3]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(139, 125, 112, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(139, 125, 112, 0.1) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
