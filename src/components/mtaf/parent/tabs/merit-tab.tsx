"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BentoCard, StatCard } from "@/components/mtaf/bento";
import { MeritLevelBadge } from "@/components/mtaf/badges";
import { EmptyState, Loading } from "@/components/mtaf/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  bmMonthLabel,
  formatBMDate,
  MERIT_LEVEL_LABELS,
} from "@/lib/format";

type MeritResp = {
  records: {
    id: string;
    date: string;
    points: number;
    type: string;
    categoryName: string;
    categoryType: string;
    group: string | null;
    severity: string | null;
    isBerat: boolean;
    needsParentMeeting: boolean;
    note: string | null;
  }[];
  stats: {
    merit: number;
    demerit: number;
    cleanPoints: number;
    level: string;
    hasBerat: boolean;
  };
};

export function MeritTab({ studentId }: { studentId: string }) {
  const [filter, setFilter] = useState("all");
  const [month, setMonth] = useState("all");

  const queryKey = `merit-${studentId}-${filter}-${month}`;
  const { data, isLoading } = useQuery<MeritResp>({
    queryKey: [queryKey],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("filter", filter);
      if (month !== "all") params.set("month", month);
      return api(`/api/students/${studentId}/merit?${params.toString()}`);
    },
  });

  if (isLoading || !data) return <Loading label="Memuatkan rekod merit..." />;

  const months = buildMonthOptions();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Jumlah Merit" value={data.stats.merit} color="#16A34A" />
        <StatCard label="Jumlah Demerit" value={Math.abs(data.stats.demerit)} color="#DC2626" />
        <StatCard
          label="Mata Bersih"
          value={data.stats.cleanPoints}
          color="#0E7C8F"
        />
        <BentoCard className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tahap Status
          </span>
          <div className="flex items-center gap-2">
            <MeritLevelBadge level={data.stats.level} />
            {data.stats.hasBerat && (
              <Badge variant="destructive">Kes Berat</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {MERIT_LEVEL_LABELS[data.stats.level]}
          </span>
        </BentoCard>
      </div>

      {data.stats.hasBerat && (
        <div className="flex items-start gap-3 rounded-xl border border-status-red/40 bg-status-red/10 p-4 text-sm">
          <AlertCircle className="size-5 shrink-0 text-status-red" />
          <div>
            <p className="font-semibold text-status-red">
              Kes Berat: Tindakan disiplin oleh HEM
            </p>
            <p className="text-muted-foreground">
              Maklumat terperinci tidak dipaparkan atas sebab privasi. Sila
              temui UNIT HEM untuk perbincangan lanjut.
            </p>
            <p className="mt-1 font-medium text-status-orange">
              Perlu pertemuan ibu bapa.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <BentoCard>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold">
            <Award className="size-4 text-primary" />
            Senarai Rekod
          </h4>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="merit">Merit</SelectItem>
                <SelectItem value="demerit">Demerit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {bmMonthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {data.records.length === 0 ? (
          <EmptyState title="Tiada rekod" description="Tiada rekod merujuk penapis semasa." />
        ) : (
          <div className="max-h-96 overflow-y-auto custom-scroll">
            <ul className="space-y-2">
              {data.records.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-3 rounded-xl border border-border p-3"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                    style={{
                      backgroundColor: r.points >= 0 ? "#16A34A15" : "#DC262615",
                      color: r.points >= 0 ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {r.points > 0 ? `+${r.points}` : r.points}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.categoryName}</span>
                      {r.severity && r.severity !== "BERAT" && (
                        <Badge variant="secondary">{severityLabel(r.severity)}</Badge>
                      )}
                      {r.isBerat && (
                        <Badge variant="destructive">Kes Berat</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {formatBMDate(r.date)}
                      {r.group && ` - ${r.group}`}
                    </div>
                    {r.note && (
                      <p className="mt-1 text-sm">{r.note}</p>
                    )}
                    {r.isBerat && (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        Maklumat terperinci dikendalikan oleh HEM.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BentoCard>

      <BentoCard className="bg-muted/30">
        <div className="flex items-start gap-3 text-xs text-muted-foreground">
          <TrendingUp className="size-4 text-primary" />
          <p>
            Tahap status: Hijau (0-14), Kuning (15-29), Jingga (30-49), Merah (50+ atau Kes Berat).
            Mata bersih = Jumlah Merit + Jumlah Demerit.
          </p>
        </div>
      </BentoCard>
    </div>
  );
}

function severityLabel(s: string): string {
  const m: Record<string, string> = {
    RINGAN: "Ringan",
    SEDERHANA: "Sederhana",
    BERAT: "Berat",
  };
  return m[s] ?? s;
}

function buildMonthOptions(): string[] {
  const arr: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push(d.toISOString().slice(0, 7));
  }
  return arr;
}
