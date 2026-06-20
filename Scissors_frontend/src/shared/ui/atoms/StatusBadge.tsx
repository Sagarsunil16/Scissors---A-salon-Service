import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  Cancelled: "bg-red-50 text-red-700 ring-red-200",
  Completed: "bg-sky-50 text-sky-700 ring-sky-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        statusStyles[status] ?? "bg-muted text-muted-foreground ring-border",
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
