"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BentoCard } from "@/components/mtaf/bento";
import { GradeBadge } from "@/components/mtaf/badges";
import { EmptyState, Loading } from "@/components/mtaf/states";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDown,
  ArrowUp,
  Minus,
  TrendingUp,
} from "lucide-react";
import {
  ASPECT_LABELS,
  GRADE_LABELS,
} from "@/lib/format";

type CharacterResp = {
  assessments: {
    id: string;
    period: string;
    periodLabel: string;
    akhlak: number;
    ibadah: number;
    tanggungjawab: number;
    kebersihan: number;
    kerjasama: number;
    average: number;
    grade: string;
    comment: string;
    teacherName: string | null;
    createdAt: string;
  }[];
};

export function CharacterTab({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery<CharacterResp>({
    queryKey: ["student-character", studentId],
    queryFn: () => api(`/api/students/${studentId}/character`),
  });

  if (isLoading || !data) return <Loading label="Memuatkan sahsiah..." />;

  const latest = data.assessments[data.assessments.length - 1];
  const previous = data.assessments[data.assessments.length - 2];

  if (!latest) {
    return (
      <EmptyState
        title="Belum ada penilaian sahsiah"
        description="Penilaian sahsiah akan dipaparkan selepas guru menilai pelajar."
      />
    );
  }

  const aspects: { key: string; value: number }[] = [
    { key: "akhlak", value: latest.akhlak },
    { key: "ibadah", value: latest.ibadah },
    { key: "tanggungjawab", value: latest.tanggungjawab },
    { key: "kebersihan", value: latest.kebersihan },
    { key: "kerjasama", value: latest.kerjasama },
  ];
  const delta =
    previous && typeof previous.average === "number"
      ? latest.average - previous.average
      : null;

  return (
    <div className="space-y-4">
      <BentoCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">
              Penilaian Sahsiah - {latest.periodLabel}
            </h3>
            <p className="text-sm text-muted-foreground">
              Dinilai oleh: {latest.teacherName ?? "Tidak diketahui"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GradeBadge grade={latest.grade} />
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {latest.average.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">/ 5.0</div>
            </div>
          </div>
        </div>

        {delta !== null && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Perubahan:</span>
            {Math.abs(delta) < 0.01 ? (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Minus className="size-3.5" /> Kekal
              </span>
            ) : delta > 0 ? (
              <span className="flex items-center gap-1 text-status-green">
                <ArrowUp className="size-3.5" /> Naik {delta.toFixed(2)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-status-red">
                <ArrowDown className="size-3.5" /> Turun {Math.abs(delta).toFixed(2)}
              </span>
            )}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {aspects.map((a) => {
            const label =
              ASPECT_LABELS.find((x) => x.key === a.key)?.label ?? a.key;
            return (
              <div key={a.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {a.value} / 5
                  </span>
                </div>
                <Progress value={(a.value / 5) * 100} className="h-2.5" />
              </div>
            );
          })}
        </div>

        {latest.comment && (
          <div className="mt-5 rounded-xl bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Catatan Guru
            </p>
            <p className="mt-1 text-sm">{latest.comment}</p>
          </div>
        )}
      </BentoCard>

      {/* History */}
      {data.assessments.length > 1 && (
        <BentoCard>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <TrendingUp className="size-4 text-primary" />
            Sejarah Penilaian
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">Tempoh</th>
                  <th className="py-2 pr-3">Purata</th>
                  <th className="py-2 pr-3">Gred</th>
                  <th className="py-2">Guru</th>
                </tr>
              </thead>
              <tbody>
                {data.assessments.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="py-2 pr-3">{a.periodLabel}</td>
                    <td className="py-2 pr-3 font-medium">
                      {a.average.toFixed(2)}
                    </td>
                    <td className="py-2 pr-3">
                      <GradeBadge grade={a.grade} />
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {a.teacherName ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BentoCard>
      )}

      <BentoCard className="bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Skala penilaian: 1 (Perlu Bimbingan) - 5 (Cemerlang). Tahap gred:{" "}
          {Object.entries(GRADE_LABELS).map(([k, v]) => `${v} (${k})`).join(", ")}.
        </p>
      </BentoCard>
    </div>
  );
}
