"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BentoCard, StatCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading } from "@/components/mtaf/states";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarCheck,
  Award,
  FileText,
  FolderKanban,
  AlertTriangle,
  ScrollText,
  TrendingUp,
} from "lucide-react";
import { formatBMDate } from "@/lib/format";

type Dashboard = {
  totalStudents: number;
  todayAttendancePct: number;
  todayAttendanceStats: {
    total: number;
    hadir: number;
    lewat: number;
    thBersebab: number;
    thTanpa: number;
    cuti: number;
    effective: number;
    percentage: number;
  };
  highDemeritCount: number;
  highDemeritStudents: {
    id: string;
    name: string;
    className: string;
    cleanPoints: number;
    hasBerat: boolean;
  }[];
  dutyPending: number;
  recentMerit: {
    id: string;
    date: string;
    points: number;
    studentName: string;
    className: string;
    categoryName: string;
    severity: string | null;
  }[];
  programsCount: number;
  auditLogs: {
    id: string;
    username: string | null;
    action: string;
    entity: string;
    detail: string;
    createdAt: string;
  }[];
};

export function AdminDashboardView() {
  const { setView } = useStore();
  const { data, isLoading } = useQuery<Dashboard>({
    queryKey: ["admin-dashboard"],
    queryFn: () => api("/api/admin/dashboard"),
  });

  if (isLoading || !data) return <Loading label="Memuatkan papan pemuka..." />;

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Papan Pemuka"
        subtitle="Ringkasan operasi UNIT HEM Madrasah Tahfiz Al Furqan."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Jumlah Pelajar"
          value={data.totalStudents}
          color="#0E7C8F"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Kedatangan Hari Ini"
          value={`${data.todayAttendancePct}%`}
          sublabel={`${data.todayAttendanceStats.hadir}/${data.todayAttendanceStats.total} direkod`}
          color="#16A34A"
          icon={<CalendarCheck className="size-4" />}
        />
        <StatCard
          label="Demerit Tinggi"
          value={data.highDemeritCount}
          sublabel="Mata bersih >= 30 / Kes Berat"
          color="#DC2626"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          label="Laporan Menunggu"
          value={data.dutyPending}
          sublabel="Menunggu kelulusan"
          color="#F59E0B"
          icon={<FileText className="size-4" />}
        />
        <StatCard
          label="Program"
          value={data.programsCount}
          color="#00B4CC"
          icon={<FolderKanban className="size-4" />}
        />
        <StatCard
          label="Rekod Merit Terkini"
          value={data.recentMerit.length}
          color="#16A34A"
          icon={<Award className="size-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* High demerit students */}
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <AlertTriangle className="size-4 text-status-red" />
            Pelajar Demerit Tinggi
          </h3>
          {data.highDemeritStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tiada pelajar dengan demerit tinggi buat masa ini.
            </p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto custom-scroll">
              {data.highDemeritStudents.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.className}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.hasBerat && <Badge variant="destructive">Kes Berat</Badge>}
                    <Badge variant="secondary">{s.cleanPoints}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>

        {/* Recent merit */}
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Award className="size-4 text-primary" />
            Rekod Merit Terkini
          </h3>
          {data.recentMerit.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tiada rekod terkini.</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto custom-scroll">
              {data.recentMerit.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: r.points >= 0 ? "#16A34A15" : "#DC262615",
                        color: r.points >= 0 ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {r.points > 0 ? `+${r.points}` : r.points}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{r.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.className} - {r.categoryName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBMDate(r.date)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>
      </div>

      {/* Audit log snippet */}
      <BentoCard>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold">
            <ScrollText className="size-4 text-primary" />
            Log Audit Terkini
          </h3>
          <button
            onClick={() => setView("admin-audit")}
            className="text-xs font-medium text-primary hover:underline"
          >
            Lihat Semua
          </button>
        </div>
        <ul className="space-y-1.5 text-sm max-h-60 overflow-y-auto custom-scroll">
          {data.auditLogs.map((l) => (
            <li
              key={l.id}
              className="flex items-start justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5"
            >
              <div className="flex-1">
                <p className="text-xs font-medium">{l.detail}</p>
                <p className="text-xs text-muted-foreground">
                  {l.username ?? "-"} - {l.action} ({l.entity})
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(l.createdAt).toLocaleString("ms-MY")}
              </span>
            </li>
          ))}
        </ul>
      </BentoCard>

      <BentoCard className="bg-muted/30">
        <div className="flex items-start gap-3 text-xs text-muted-foreground">
          <TrendingUp className="size-4 text-primary" />
          <p>
            Tip: Gunakan menu di sebelah kanan atas untuk mengakses pengurusan
            pelajar, kedatangan, sahsiah, merit, laporan bertugas dan program.
          </p>
        </div>
      </BentoCard>
    </div>
  );
}
