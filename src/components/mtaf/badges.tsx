"use client";

import { Badge } from "@/components/ui/badge";
import {
  MERIT_LEVEL_COLORS,
  MERIT_LEVEL_LABELS,
  GRADE_COLORS,
  GRADE_LABELS,
  DUTY_STATUS_COLORS,
  DUTY_STATUS_LABELS,
  attendanceColor,
  ATTENDANCE_LABELS,
} from "@/lib/format";
import type { AttendanceStatus } from "@/lib/format";

export function MeritLevelBadge({ level }: { level: string }) {
  const color = MERIT_LEVEL_COLORS[level] ?? "#9CA3AF";
  return (
    <Badge
      style={{ backgroundColor: color, color: "white", borderColor: color }}
    >
      {MERIT_LEVEL_LABELS[level] ?? level}
    </Badge>
  );
}

export function GradeBadge({ grade }: { grade: string }) {
  const color = GRADE_COLORS[grade] ?? "#9CA3AF";
  return (
    <Badge
      style={{ backgroundColor: color, color: "white", borderColor: color }}
    >
      {GRADE_LABELS[grade] ?? grade}
    </Badge>
  );
}

export function DutyStatusBadge({ status }: { status: string }) {
  const color = DUTY_STATUS_COLORS[status] ?? "#9CA3AF";
  return (
    <Badge
      style={{ backgroundColor: color, color: "white", borderColor: color }}
    >
      {DUTY_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function AttendanceStatusBadge({
  status,
}: {
  status: string;
}) {
  const color = attendanceColor(status);
  const label =
    ATTENDANCE_LABELS[status as AttendanceStatus] ?? status;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color,
      }}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export function AttendanceDot({ status }: { status: string }) {
  const color = attendanceColor(status);
  return (
    <span
      className="inline-block size-2.5 rounded-full"
      style={{ backgroundColor: color }}
      title={ATTENDANCE_LABELS[status as AttendanceStatus] ?? status}
    />
  );
}
