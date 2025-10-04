import { cn } from "@/lib/utils";

export default function BgGradient({ className }: React.ComponentProps<"div">) {
  return (
    <div className={cn("inset-0 -z-50 bg-[#F7F5F3] fixed *:absolute *:inset-0", className)}>
      <div className="opacity-40"
        style={{
          backgroundImage: 'radial-gradient(closest-corner at 120px 36px, rgba(139, 125, 112, 0.12), rgba(139, 125, 112, 0)), linear-gradient(rgb(247, 245, 243) 15%, rgb(235, 230, 225))'
        }} />
    </div>
  );
}
