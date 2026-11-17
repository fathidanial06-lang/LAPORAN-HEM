"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function BentoCard({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm hover-lift",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  color = "#0E7C8F",
  icon,
}: {
  label: string;
  value: ReactNode;
  sublabel?: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <BentoCard className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold" style={{ color }}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-muted-foreground">{sublabel}</div>
      )}
    </BentoCard>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-brand-dark sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
