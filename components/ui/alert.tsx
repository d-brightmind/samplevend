import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "error" | "success" | "info";
};

export function Alert({ className, variant = "info", children, ...props }: AlertProps) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-md border p-3 text-sm",
        variant === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
        variant === "success" && "border-primary/30 bg-primary/10 text-primary",
        variant === "info" && "bg-secondary text-secondary-foreground",
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
