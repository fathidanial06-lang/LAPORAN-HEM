"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiPost } from "@/lib/api";
import { BentoCard, SectionTitle } from "@/components/mtaf/bento";
import { Loading, EmptyState } from "@/components/mtaf/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GradeBadge } from "@/components/mtaf/badges";
import { characterGrade, GRADE_LABELS, bmMonthLabel } from "@/lib/format";
import { toast } from "sonner";
import { ClipboardList, Save } from "lucide-react";

type ClassesResp = { classes: { id: string; name: string; year: number }[] };
type StudentsResp = {
  students: {
    id: string;
    name: string;
    classId: string;
    className: string;
  }[];
};
type CharacterListResp = {
  assessments: {
    id: string;
    studentId: string;
    studentName: string;
    className: string;
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

const ASPECTS = [
  { key: "akhlak", label: "Akhlak" },
  { key: "ibadah", label: "Ibadah" },
  { key: "tanggungjawab", label: "Tanggungjawab" },
  { key: "kebersihan", label: "Kebersihan" },
  { key: "kerjasama", label: "Kerjasama" },
] as const;

export function AdminCharacterView() {
  const qc = useQueryClient();
  const { data: classesData } = useQuery<ClassesResp>({
    queryKey: ["classes"],
    queryFn: () => api("/api/classes"),
  });
  const { data: studentsData } = useQuery<StudentsResp>({
    queryKey: ["admin-students"],
    queryFn: () => api("/api/admin/students"),
  });
  const { data: listData, isLoading } = useQuery<CharacterListResp>({
    queryKey: ["admin-character"],
    queryFn: () => api("/api/admin/character"),
  });

  const [studentId, setStudentId] = useState("");
  const [period, setPeriod] = useState(currentMonth());
  const [aspects, setAspects] = useState<Record<string, number>>({
    akhlak: 4,
    ibadah: 4,
    tanggungjawab: 4,
    kebersihan: 4,
    kerjasama: 4,
  });
  const [comment, setComment] = useState("");

  const avg = useMemo(
    () =>
      Object.values(aspects).reduce((s, v) => s + v, 0) / ASPECTS.length,
    [aspects],
  );
  const grade = characterGrade(avg);

  async function onSave() {
    if (!studentId || !period) {
      toast.error("Sila pilih pelajar dan tempoh");
      return;
    }
    try {
      await apiPost("/api/admin/character", {
        studentId,
        period,
        ...aspects,
        comment,
      });
      toast.success("Penilaian sahsiah disimpan");
      qc.invalidateQueries({ queryKey: ["admin-character"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Penilaian Sahsiah"
        subtitle="Nilai 5 aspek sahsiah pelajar (1-5)."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Form */}
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <ClipboardList className="size-4 text-primary" />
            Borang Penilaian
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Pelajar</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih pelajar" />
                </SelectTrigger>
                <SelectContent>
                  {studentsData?.students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tempoh (Bulan)</Label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                {bmMonthLabel(period)}
              </p>
            </div>

            <div className="space-y-3 rounded-lg bg-muted/40 p-3">
              {ASPECTS.map((a) => (
                <div key={a.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{a.label}</span>
                    <span className="text-muted-foreground">
                      {aspects[a.key]} / 5
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[aspects[a.key]]}
                    onValueChange={(v) =>
                      setAspects((prev) => ({ ...prev, [a.key]: v[0] }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Purata</p>
                <p className="text-xl font-bold text-primary">
                  {avg.toFixed(2)}
                </p>
              </div>
              <GradeBadge grade={grade} />
            </div>

            <div className="space-y-1.5">
              <Label>Catatan Guru</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Catatan tentang sahsiah pelajar..."
              />
            </div>

            <Button onClick={onSave} className="w-full h-11">
              <Save className="size-4" />
              Simpan Penilaian
            </Button>
          </div>
        </BentoCard>

        {/* List */}
        <BentoCard>
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <ClipboardList className="size-4 text-primary" />
            Penilaian Terkini
          </h3>
          {isLoading ? (
            <Loading />
          ) : !listData || listData.assessments.length === 0 ? (
            <EmptyState title="Tiada penilaian" />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scroll">
              <ul className="space-y-2">
                {listData.assessments.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{a.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.className} - {a.periodLabel}
                        </p>
                      </div>
                      <GradeBadge grade={a.grade} />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">
                        Purata: {a.average.toFixed(2)}
                      </Badge>
                      {a.teacherName && <span>{a.teacherName}</span>}
                    </div>
                    {a.comment && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {a.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </BentoCard>
      </div>

      <BentoCard className="bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Skala gred: {Object.entries(GRADE_LABELS).map(([k, v]) => `${v}`).join(", ")}.{" "}
          Hanya Guru Kanan HEM / Pengetua boleh mengemaskini selepas penyerahan.
        </p>
      </BentoCard>
    </div>
  );
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
