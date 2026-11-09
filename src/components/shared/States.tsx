"use client";

import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoBannerProps {
  message?: string;
  className?: string;
}

export function DemoBanner({ message, className }: DemoBannerProps) {
  return (
    <div
      className={cn(
        "demo-stripe flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
        className
      )}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <p className="text-sm font-medium">
        {message ||
          "⚠️ DEMO DATA — This data is for demonstration only. Add your OPENAQ_API_KEY in .env.local to load real monitoring station data."}
      </p>
    </div>
  );
}

export function InfoBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-2 rounded-lg bg-slate-700/50 text-xs text-slate-400",
        className
      )}
    >
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
      <span>{children}</span>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export function LoadingState({ message = "Loading data…", rows = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {message && (
        <p className="text-sm text-slate-400 animate-pulse">{message}</p>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-200">{title}</h3>
        {message && <p className="text-sm text-slate-500 mt-1">{message}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 rounded-lg transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon: Icon,
}: {
  title: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
          <Icon className="w-7 h-7 text-slate-500" />
        </div>
      )}
      <h3 className="font-semibold text-slate-300">{title}</h3>
      {message && <p className="text-sm text-slate-500 max-w-md">{message}</p>}
    </div>
  );
}

