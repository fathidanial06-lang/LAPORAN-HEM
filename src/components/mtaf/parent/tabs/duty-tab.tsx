"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { BentoCard } from "@/components/mtaf/bento";
import { DutyStatusBadge } from "@/components/mtaf/badges";
import { EmptyState, Loading } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { formatBMDate } from "@/lib/format";
import { FileText, ArrowRight } from "lucide-react";

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

export function DutyTab({ studentId }: { studentId: string }) {
  void studentId;
  const { goDutyReport } = useStore();
  const { data, isLoading } = useQuery<DutyListResp>({
    queryKey: ["duty-reports-public"],
    queryFn: () => api("/api/duty-reports"),
  });

  if (isLoading || !data) return <Loading label="Memuatkan laporan bertugas..." />;

  if (data.reports.length === 0) {
    return (
      <EmptyState
        title="Tiada laporan bertugas"
        description="Laporan mingguan guru bertugas akan dipaparkan di sini."
      />
    );
  }

  return (
    <div className="space-y-3">
      <BentoCard className="bg-primary/5 border-primary/20">
        <p className="text-sm">
          Laporan mingguan guru bertugas adalah laporan umum tentang
          aktiviti madrasah. Laporan ini tidak menyebut nama pelajar individu
          untuk melindungi privasi.
        </p>
      </BentoCard>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.reports.map((r) => (
          <BentoCard key={r.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </span>
                <div>
                  <h4 className="font-semibold">
                    Minggu {r.weekNo}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatBMDate(r.startDate)} - {formatBMDate(r.endDate)}
                  </p>
                </div>
              </div>
              <DutyStatusBadge status={r.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Guru Bertugas: {r.teacherName}
            </p>
            {r.attendanceSummary && (
              <p className="text-sm line-clamp-2">
                <span className="text-muted-foreground">Kedatangan: </span>
                {r.attendanceSummary}
              </p>
            )}
            {r.noticeToParents && (
              <p className="text-sm rounded-lg bg-status-yellow/10 p-2 line-clamp-2">
                <span className="font-medium text-status-orange">Notis Ibu Bapa: </span>
                {r.noticeToParents}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-9 w-fit"
              onClick={() => goDutyReport(r.id)}
            >
              Baca Penuh
              <ArrowRight className="size-4" />
            </Button>
          </BentoCard>
        ))}
      </div>
    </div>
  );
}
