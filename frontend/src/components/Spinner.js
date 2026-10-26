import { cn } from "@/lib/utils";

export function Spinner({ className = "size-5" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}

export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted">
      <Spinner className="size-8 text-crimson-400" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
