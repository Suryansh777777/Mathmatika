import { cn } from "@/lib/utils"

export function DotsLoader({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
    xl: "h-6 w-6",
  }

  const containerSizes = {
    sm: "h-4",
    md: "h-5",
    lg: "h-6",
    xl: "h-8",
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-1",
        containerSizes[size],
        className
      )}
    >
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-secondary-foreground/40 animate-bounce-dots rounded-full",
            dotSizes[size]
          )}
          style={{
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  )
}

