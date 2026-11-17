"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BentoCard, StatCard } from "@/components/mtaf/bento";
import {
  AttendanceStatusBadge,
  AttendanceDot,
} from "@/components/mtaf/badges";
import { EmptyState, Loading } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import {
  ATTENDANCE_LABELS,
  attendanceColor,
  bmMonthLabel,
  type AttendanceStatus,
} from "@/lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type AttendanceResp = {
  month: string;
  records: { id: string; date: string; status: string; timeIn: string | null; note: string | null }[];
  stats: {
    total: number;
    hadir: number;
    lewat: number;
    thBersebab: number;
    thTanpa: number;
    cuti: number;
    effective: number;
    present: number;
    percentage: number;
  };
  trend: { month: string; percentage: number }[];
};

export function AttendanceTab({
  studentId,
  currentMonth,
}: {
  studentId: string;
  currentMonth: string;
}) {
  const [month, setMonth] = useState(currentMonth);

  const { data, isLoading } = useQuery<AttendanceResp>({
    queryKey: ["student-attendance", studentId, month],
    queryFn: () =>
      api(`/api/students/${studentId}/attendance?month=${month}`),
  });

  // Build calendar matrix
  const calendar = useMemo(() => {
    if (!data) return null;
    const [y, m] = month.split("-").map((n) => parseInt(n, 10));
    const first = new Date(y, m - 1, 1);
    const startDay = first.getDay(); // 0=Sun
    const daysInMonth = new Date(y, m, 0).getDate();
    const recMap = new Map(data.records.map((r) => [r.date, r]));
    const cells: { date: string | null; status?: string }[] = [];
    for (let i = 0; i < startDay; i++) cells.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${month}-${String(d).padStart(2, "0")}`;
      cells.push({ date: ds, status: recMap.get(ds)?.status });
    }
    return cells;
  }, [data, month]);

  if (isLoading || !data) return <Loading label="Memuatkan kedatangan..." />;

  const stats = data.stats;
  const lowAttendance = stats.percentage < 85 && stats.effective > 0;
  const trendData = data.trend.map((t) => ({
    month: t.month.slice(5),
    percentage: t.percentage,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Kedatangan Bulan {bmMonthLabel(month)}</h3>
          <p className="text-sm text-muted-foreground">
            {stats.present} daripada {stats.effective} hari berkesan
          </p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {lowAttendance && (
        <div className="flex items-start gap-3 rounded-xl border border-status-yellow/40 bg-status-yellow/10 p-4 text-sm">
          <AlertTriangle className="size-5 shrink-0 text-status-yellow" />
          <div>
            <p className="font-semibold text-status-orange">
              Amaran: Kedatangan rendah
            </p>
            <p className="text-muted-foreground">
              Kedatangan pelajar bulan ini kurang daripada 85%. Sila hubungi
              guru kelas untuk perbincangan lanjut.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Hadir" value={stats.hadir} color="#16A34A" />
        <StatCard label="Lewat" value={stats.lewat} color="#F59E0B" />
        <StatCard label="TH Bersebab" value={stats.thBersebab} color="#2563EB" />
        <StatCard label="TH Tanpa Sebab" value={stats.thTanpa} color="#DC2626" />
        <StatCard label="Cuti" value={stats.cuti} color="#9CA3AF" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Calendar */}
        <BentoCard>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <CalendarDays className="size-4 text-primary" />
            Kalendar Bulanan
          </h4>
          {/* Legend */}
          <div className="mb-3 flex flex-wrap gap-3 text-xs">
            {(
              ["HADIR", "LEWAT", "TH_BERSEBAB", "TH_TANPA_SEBAB", "CUTI"] as AttendanceStatus[]
            ).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: attendanceColor(s) }}
                />
                {ATTENDANCE_LABELS[s]}
              </span>
            ))}
          </div>
          {calendar && (
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"].map((d) => (
                <div key={d} className="font-semibold text-muted-foreground py-1">
                  {d}
                </div>
              ))}
              {calendar.map((cell, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-md border border-border p-1"
                  style={{
                    backgroundColor: cell.status
                      ? `${attendanceColor(cell.status)}25`
                      : undefined,
                  }}
                >
                  {cell.date && (
                    <>
                      <span className="absolute left-1 top-0.5 text-[10px] text-muted-foreground">
                        {parseInt(cell.date.slice(-2), 10)}
                      </span>
                      {cell.status && (
                        <div className="flex h-full items-center justify-center">
                          <AttendanceDot status={cell.status} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </BentoCard>

        {/* Trend chart */}
        <BentoCard>
          <h4 className="mb-3 font-semibold">Trend Kedatangan 6 Bulan</h4>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Kedatangan"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#0E7C8F"
                strokeWidth={2}
                name="% Kedatangan"
                dot={{ fill: "#0E7C8F" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </BentoCard>
      </div>

      {/* Detailed list */}
      <BentoCard>
        <h4 className="mb-3 font-semibold">Senarai Rekod Terperinci</h4>
        {data.records.length === 0 ? (
          <EmptyState title="Tiada rekod kedatangan" description={`Tiada rekod untuk ${bmMonthLabel(month)}.`} />
        ) : (
          <div className="max-h-72 overflow-y-auto custom-scroll">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">Tarikh</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Waktu Masuk</th>
                  <th className="py-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 pr-3">{r.date}</td>
                    <td className="py-2 pr-3">
                      <AttendanceStatusBadge status={r.status} />
                    </td>
                    <td className="py-2 pr-3 font-mono">{r.timeIn ?? "-"}</td>
                    <td className="py-2 text-muted-foreground">{r.note ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>
    </div>
  );
}

function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = useMemo(() => {
    const now = new Date();
    const arr: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push(d.toISOString().slice(0, 7));
    }
    return arr;
  }, []);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-[180px]">
        <SelectValue placeholder="Pilih bulan" />
      </SelectTrigger>
      <SelectContent>
        {options.map((m) => (
          <SelectItem key={m} value={m}>
            {bmMonthLabel(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
