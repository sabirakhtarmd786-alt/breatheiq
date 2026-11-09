"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}

export function Card({ children, className, noPad, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-slate-800/80 border border-slate-700/50 rounded-2xl",
        "light:bg-white light:border-slate-200",
        !noPad && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("font-semibold text-slate-200 text-sm", className)}>
      {children}
    </h3>
  );
}

