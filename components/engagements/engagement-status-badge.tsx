import { cn } from "@/lib/utils";

const labels = {
  UNSCHEDULED: "Unscheduled",
  SCHEDULED: "Scheduled",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

const styles = {
  UNSCHEDULED: "bg-slate-100 text-slate-700 border-slate-200",
  SCHEDULED: "bg-sky-50 text-sky-700 border-sky-200",
  ASSIGNED: "bg-violet-50 text-violet-700 border-violet-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200"
};

export type EngagementStatus = keyof typeof labels;

export function EngagementStatusBadge({ status, className }: { status: EngagementStatus; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium", styles[status], className)}>
      {labels[status]}
    </span>
  );
}
