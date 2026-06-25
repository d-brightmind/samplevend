import { cn } from "@/lib/utils";

const labels = {
  AVAILABLE: "Available",
  BUSY: "Busy",
  OFFLINE: "Offline",
  ON_LEAVE: "On leave",
  DEACTIVATED: "Deactivated"
};

const styles = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BUSY: "bg-amber-50 text-amber-800 border-amber-200",
  OFFLINE: "bg-slate-100 text-slate-700 border-slate-200",
  ON_LEAVE: "bg-sky-50 text-sky-700 border-sky-200",
  DEACTIVATED: "bg-red-50 text-red-700 border-red-200"
};

export type ResourceStatus = keyof typeof labels;

export function StatusBadge({ status, className }: { status: ResourceStatus; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium", styles[status], className)}>
      {labels[status]}
    </span>
  );
}
