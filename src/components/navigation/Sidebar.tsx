"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wind,
  Map,
  BarChart3,
  GitCompare,
  Heart,
  CloudSun,
  Leaf,
  Bot,
  Bell,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Wind },
  { href: "/map", label: "Explore Map", icon: Map },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/comparison", label: "Comparison", icon: GitCompare },
  { href: "/health", label: "Health Insights", icon: Heart },
  { href: "/forecast", label: "Forecast", icon: CloudSun },
  { href: "/clean-air", label: "Clean Air Finder", icon: Leaf },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col",
          "bg-slate-900 border-r border-slate-700/50",
          "transition-all duration-300 ease-in-out",
          // Desktop
          collapsed ? "w-16" : "w-64",
          // Mobile
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-5 border-b border-slate-700/50",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <Wind className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-white text-lg leading-tight">
                BreatheIQ
              </span>
              <p className="text-xs text-slate-400 leading-tight">
                Air Intelligence
              </p>
            </div>
          )}
          {/* Mobile close */}
          {mobileOpen && !collapsed && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        active ? "text-emerald-400" : "text-slate-400"
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block border-t border-slate-700/50 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400",
              "hover:text-slate-200 hover:bg-slate-800 transition-colors text-sm",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

