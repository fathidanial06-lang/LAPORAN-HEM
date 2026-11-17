"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiPost } from "@/lib/api";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading, EmptyState } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ATTENDANCE_LABELS,
  type AttendanceStatus,
} from "@/lib/format";

type ClassesResp = {
  classes: { id: string; name: string; year: number }[];
};
type AttendanceResp = {
  date: string;
  classId: string;
  students: {
    id: string;
    name: string;
    status: string | null;
    timeIn: string | null;
    note: string | null;
  }[];
};

const STATUSES: AttendanceStatus[] = [
  "HADIR",
  "LEWAT",
  "TH_BERSEBAB",
  "TH_TANPA_SEBAB",
  "CUTI",
];

export function AdminAttendanceView() {
  const { data: classesData } = useQuery<ClassesResp>({
    queryKey: ["classes"],
    queryFn: () => api("/api/classes"),
  });
  const [classIdInput, setClassId] = useState("");
  const [dateStr, setDateStr] = useState(
    new Date().toISOString().slice(0, 10),
  );
  // Derived effective classId - falls back to first class once loaded
  const effectiveClassId =
    classIdInput || classesData?.classes[0]?.id || "";

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Rekod Kedatangan"
        subtitle="Tanda kedatangan pelajar mengikut kelas dan tarikh."
      />

      <BentoCard>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Kelas</label>
            <Select value={effectiveClassId} onValueChange={setClassId}>
              <SelectTrigger className="h-10 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classesData?.classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Tarikh</label>
            <Input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="h-10 w-[180px]"
            />
          </div>
        </div>
      </BentoCard>

      {effectiveClassId && (
        <AttendanceEditor
          key={`${effectiveClassId}/${dateStr}`}
          classId={effectiveClassId}
          dateStr={dateStr}
        />
      )}
    </div>
  );
}

function AttendanceEditor({
  classId,
  dateStr,
}: {
  classId: string;
  dateStr: string;
}) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<AttendanceResp>({
    queryKey: ["admin-attendance", classId, dateStr],
    queryFn: () =>
      api(`/api/admin/attendance?classId=${classId}&date=${dateStr}`),
  });
  // local overrides (only for this classId/date - reset on remount via key)
  const [edits, setEdits] = useState<
    Record<string, { status: string; timeIn?: string }>
  >({});

  function setStatus(id: string, status: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], status } }));
  }
  function markAllHadir() {
    const m: Record<string, { status: string }> = {};
    data?.students.forEach((s) => (m[s.id] = { status: "HADIR" }));
    setEdits(m);
  }

  async function onSave() {
    if (!data) return;
    const records = data.students
      .map((s) => ({
        studentId: s.id,
        status: edits[s.id]?.status ?? s.status ?? "HADIR",
        timeIn: edits[s.id]?.timeIn ?? s.timeIn ?? undefined,
      }))
      .filter((r) => r.status);
    try {
      await apiPost("/api/admin/attendance", {
        classId,
        date: dateStr,
        records,
      });
      toast.success(`${records.length} rekod kedatangan disimpan`);
      setEdits({});
      qc.invalidateQueries({ queryKey: ["admin-attendance", classId, dateStr] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <BentoCard>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button onClick={onSave} className="h-10">
          Simpan Kedatangan
        </Button>
        <Button variant="outline" onClick={markAllHadir} className="h-10">
          <CheckCheck className="size-4" />
          Tanda Semua Hadir
        </Button>
      </div>
      {isLoading ? (
        <Loading />
      ) : !data || data.students.length === 0 ? (
        <EmptyState title="Tiada pelajar dalam kelas" />
      ) : (
        <div className="max-h-[70vh] overflow-y-auto custom-scroll">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.id} className="border-b border-border">
                  <td className="py-2 pr-3 font-medium">{s.name}</td>
                  <td className="py-2 pr-3">
                    <Select
                      value={edits[s.id]?.status ?? s.status ?? "HADIR"}
                      onValueChange={(v) => setStatus(s.id, v)}
                    >
                      <SelectTrigger className="h-9 w-[260px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {ATTENDANCE_LABELS[st]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BentoCard>
  );
}
