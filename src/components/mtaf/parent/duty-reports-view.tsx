"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { DutyStatusBadge } from "@/components/mtaf/badges";
import { EmptyState, Loading } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { formatBMDate } from "@/lib/format";
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  User,
  ClipboardList,
  Sparkles,
  Lightbulb,
  Bell,
} from "lucide-react";

type DutyListResp = {
  reports: {
    id: string;
    weekNo: number;
    startDate: string;
    endDate: string;
    teacherName: string;
    status: string;
    statusLabel: string;
    attendanceSummary: string;
    noticeToParents: string;
  }[];
};

export function DutyReportsView() {
  const { goDutyReport } = useStore();
  const { data, isLoading } = useQuery<DutyListResp>({
    queryKey: ["duty-reports-public"],
    queryFn: () => api("/api/duty-reports"),
  });

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Laporan Guru Bertugas"
        subtitle="Laporan mingguan guru bertugas untuk pemantauan ibu bapa."
      />
      {isLoading ? (
        <Loading />
      ) : !data || data.reports.length === 0 ? (
        <EmptyState
          title="Tiada laporan diterbitkan"
          description="Laporan mingguan akan dipaparkan di sini selepas diluluskan."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.reports.map((r) => (
            <BentoCard
              key={r.id}
              onClick={() => goDutyReport(r.id)}
              className="flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <DutyStatusBadge status={r.status} />
              </div>
              <div>
                <h3 className="font-bold">Minggu {r.weekNo}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatBMDate(r.startDate)} - {formatBMDate(r.endDate)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {r.attendanceSummary || "Tiada ringkasan"}
              </p>
              {r.noticeToParents && (
                <p className="text-xs rounded-lg bg-status-yellow/10 p-2 line-clamp-2">
                  <span className="font-medium text-status-orange">Notis: </span>
                  {r.noticeToParents}
                </p>
              )}
              <Button variant="outline" size="sm" className="mt-auto h-9 w-fit">
                Baca Penuh
                <ArrowRight className="size-4" />
              </Button>
            </BentoCard>
          ))}
        </div>
      )}
    </div>
  );
}

type DutyDetail = {
  id: string;
  weekNo: number;
  startDate: string;
  endDate: string;
  teacherName: string;
  status: string;
  attendanceSummary: string;
  disciplineSummary: string;
  cleanliness: string;
  safety: string;
  positives: string[];
  improvements: string[];
  noticeToParents: string;
  reviewNote: string | null;
};

export function DutyReportDetailView() {
  const { selectedDutyReportId, setView } = useStore();
  const { data, isLoading } = useQuery<DutyDetail>({
    queryKey: ["duty-report-detail", selectedDutyReportId],
    queryFn: () => api(`/api/duty-reports/${selectedDutyReportId}`),
    enabled: !!selectedDutyReportId,
  });

  if (isLoading) return <Loading label="Memuatkan laporan..." />;
  if (!data)
    return (
      <EmptyState title="Laporan tidak dijumpai" />
    );

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setView("duty-reports")} className="h-10">
        <ArrowLeft className="size-4" />
        Senarai Laporan
      </Button>

      <BentoCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Laporan Minggu {data.weekNo}</h2>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatBMDate(data.startDate)} - {formatBMDate(data.endDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {data.teacherName}
              </span>
            </div>
          </div>
          <DutyStatusBadge status={data.status} />
        </div>
      </BentoCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BentoCard>
          <h3 className="mb-2 flex items-center gap-2 font-bold">
            <ClipboardList className="size-4 text-primary" />
            Ringkasan Kedatangan
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.attendanceSummary || "Tiada maklumat."}
          </p>
        </BentoCard>
        <BentoCard>
          <h3 className="mb-2 flex items-center gap-2 font-bold">
            <ClipboardList className="size-4 text-primary" />
            Ringkasan Disiplin
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.disciplineSummary || "Tiada maklumat."}
          </p>
        </BentoCard>
        <BentoCard>
          <h3 className="mb-2 flex items-center gap-2 font-bold">
            <ClipboardList className="size-4 text-primary" />
            Kebersihan
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.cleanliness || "Tiada maklumat."}
          </p>
        </BentoCard>
        <BentoCard>
          <h3 className="mb-2 flex items-center gap-2 font-bold">
            <ClipboardList className="size-4 text-primary" />
            Keselamatan
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.safety || "Tiada maklumat."}
          </p>
        </BentoCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Sparkles className="size-4 text-status-green" />
            Perkara Positif
          </h3>
          {data.positives.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tiada.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {data.positives.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-status-green" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </BentoCard>
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Lightbulb className="size-4 text-status-yellow" />
            Perlu Penambahbaikan
          </h3>
          {data.improvements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tiada.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {data.improvements.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-status-yellow" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </BentoCard>
      </div>

      {data.noticeToParents && (
        <BentoCard className="border-status-yellow/40 bg-status-yellow/10">
          <h3 className="mb-2 flex items-center gap-2 font-bold text-status-orange">
            <Bell className="size-4" />
            Notis Kepada Ibu Bapa
          </h3>
          <p className="text-sm">{data.noticeToParents}</p>
        </BentoCard>
      )}

      {data.reviewNote && (
        <BentoCard className="bg-muted/30">
          <h3 className="mb-1 font-semibold">Catatan Pengulas</h3>
          <p className="text-sm text-muted-foreground">{data.reviewNote}</p>
        </BentoCard>
      )}
    </div>
  );
}
